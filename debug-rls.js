const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

console.log('🔍 Debugging RLS Policies...')
console.log('URL:', supabaseUrl)
console.log('Service Key exists:', !!supabaseServiceKey)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugRLS() {
  try {
    // Try to check if user exists with the failing ID
    console.log('\n� Testing specific user access...')
    const problematicUserId = '686ba8b3-43c3-44ed-b614-3ef547cb1022'
    
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', problematicUserId)
      .single()
    
    if (userError) {
      console.error('❌ User profile error:', userError)
    } else {
      console.log('✅ User profile found:', userProfile)
    }

    // Check all profiles to see the pattern
    console.log('\n� Checking all profiles...')
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, email, is_admin, is_staff, role')
    
    if (allError) {
      console.error('❌ All profiles error:', allError)
    } else {
      console.log('✅ All profiles:', allProfiles)
    }

    // Try to update with service role
    console.log('\n� Testing update with service role...')
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ phone: 'test-update' })
      .eq('id', problematicUserId)
      .select()
    
    if (updateError) {
      console.error('❌ Update error:', updateError)
    } else {
      console.log('✅ Update successful:', updateData)
    }

    // Check RLS with raw SQL
    console.log('\n🔍 Checking RLS policies with raw SQL...')
    const { data: rlsData, error: rlsError } = await supabase.rpc('get_rls_policies', {
      table_name: 'profiles'
    })
    
    if (rlsError) {
      console.error('❌ RLS check error (this is expected):', rlsError.message)
      
      // Try alternative approach - check if we can create the function
      console.log('\n🔧 Creating helper function to check RLS...')
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
          FROM pg_policies 
          WHERE tablename = 'profiles';
        `
      })
      
      if (createError) {
        console.error('❌ SQL exec error (expected):', createError.message)
        console.log('🔍 RLS policies need to be checked manually in Supabase dashboard')
      }
    } else {
      console.log('✅ RLS policies:', rlsData)
    }

  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugRLS()
