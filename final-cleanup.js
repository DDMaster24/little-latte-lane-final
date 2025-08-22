const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function finalCleanup() {
  const supabase = getSupabaseAdmin();
  
  console.log('🔧 Final menu cleanup...\n');
  
  try {
    // Get all categories
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('*');
    
    // Find the problematic "Monna & Rassies Corner" that's currently a section
    const monnaSection = categories.find(cat => 
      cat.name === 'Monna & Rassies Corner' && !cat.parent_id
    );
    
    // Find or create the Kids & Family section
    let kidsSection = categories.find(cat => 
      cat.name === 'Kids & Family' && !cat.parent_id
    );
    
    if (!kidsSection) {
      console.log('📝 Creating Kids & Family section...');
      const { data } = await supabase
        .from('menu_categories')
        .insert({
          name: 'Kids & Family',
          description: 'Kid-friendly menu options and family favorites',
          display_order: 5,
          is_active: true,
          parent_id: null
        })
        .select()
        .single();
      kidsSection = data;
    }
    
    if (monnaSection && kidsSection) {
      console.log('📝 Moving Monna & Rassies Corner under Kids & Family...');
      
      // Convert Monna section to category under Kids & Family
      await supabase
        .from('menu_categories')
        .update({ parent_id: kidsSection.id })
        .eq('id', monnaSection.id);
      
      console.log('✅ Moved Monna & Rassies Corner to Kids & Family section');
    }
    
    // Remove any empty sections that shouldn't exist
    const emptySections = categories.filter(cat => 
      !cat.parent_id && 
      cat.name === 'Sweets' && 
      !categories.some(c => c.parent_id === cat.id)
    );
    
    for (const emptySection of emptySections) {
      console.log(`🗑️ Removing empty section: ${emptySection.name}`);
      await supabase
        .from('menu_categories')
        .delete()
        .eq('id', emptySection.id);
    }
    
    console.log('\n✅ Final cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

finalCleanup().catch(console.error);
