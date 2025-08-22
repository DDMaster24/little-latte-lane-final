const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugAdminPermissions() {
  console.log('🔍 Debugging Admin Permissions for Menu Categories...\n');
  
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ User is not authenticated');
      console.log('Please log in to the admin dashboard first');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('User ID:', user.id);
    
    // Check user profile and admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Error fetching profile:', profileError.message);
      return;
    }
    
    console.log('\n👤 User Profile:');
    console.log('Name:', profile.full_name);
    console.log('Is Admin:', profile.is_admin);
    console.log('Is Staff:', profile.is_staff);
    
    // Test the is_staff_or_admin function directly
    const { data: permissionTest, error: permissionError } = await supabase
      .rpc('is_staff_or_admin');
    
    if (permissionError) {
      console.log('\n❌ Error testing is_staff_or_admin function:', permissionError.message);
    } else {
      console.log('\n🔑 is_staff_or_admin() function result:', permissionTest);
    }
    
    // Test reading menu_categories (should work)
    console.log('\n📖 Testing menu_categories read access...');
    const { data: categories, error: readError } = await supabase
      .from('menu_categories')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.log('❌ Read error:', readError.message);
    } else {
      console.log('✅ Can read categories. Found:', categories.length, 'categories');
    }
    
    // Test inserting a menu category (this is where the error occurs)
    console.log('\n📝 Testing menu_categories insert access...');
    const testCategory = {
      name: 'Test Category ' + Date.now(),
      description: 'Test category for permission debugging',
      display_order: 999,
      is_active: true
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('menu_categories')
      .insert(testCategory)
      .select();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('Error details:', JSON.stringify(insertError, null, 2));
      
      // Try with the service role client
      console.log('\n🔧 Trying with service role client...');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      
      const { data: adminInsert, error: adminError } = await supabaseAdmin
        .from('menu_categories')
        .insert(testCategory)
        .select();
      
      if (adminError) {
        console.log('❌ Service role also failed:', adminError.message);
      } else {
        console.log('✅ Service role succeeded. Issue is with RLS policy.');
        // Clean up the test category
        await supabaseAdmin
          .from('menu_categories')
          .delete()
          .eq('id', adminInsert[0].id);
        console.log('🧹 Cleaned up test category');
      }
    } else {
      console.log('✅ Insert succeeded:', insertResult);
      // Clean up the test category
      await supabase
        .from('menu_categories')
        .delete()
        .eq('id', insertResult[0].id);
      console.log('🧹 Cleaned up test category');
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

debugAdminPermissions();
