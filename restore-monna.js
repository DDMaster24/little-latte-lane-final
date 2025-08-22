const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function restoreMonnaItems() {
  const supabase = getSupabaseAdmin();
  
  console.log('🔄 Restoring Monna & Rassies Corner items...\n');
  
  try {
    // Get categories and items
    const { data: categories } = await supabase.from('menu_categories').select('*');
    const { data: menuItems } = await supabase.from('menu_items').select('*');
    
    // Find the correct Monna & Rassies Corner category
    const monnaCategory = categories.find(cat => cat.name === 'Monna & Rassies Corner');
    const kidsCategory = categories.find(cat => cat.name === 'Kids & Family');
    
    if (!monnaCategory) {
      console.error('❌ Could not find Monna & Rassies Corner category');
      return;
    }
    
    if (!kidsCategory) {
      console.error('❌ Could not find Kids & Family category');
      return;
    }
    
    // Find the items that belong to Monna & Rassies Corner
    const itemsToMove = [
      'Chicken Strips',
      'Vienna and Chips', 
      'Small Margherita Pizza'
    ];
    
    console.log('📝 Moving items back to Monna & Rassies Corner...');
    
    for (const itemName of itemsToMove) {
      const item = menuItems.find(item => item.name === itemName);
      if (item) {
        const { error } = await supabase
          .from('menu_items')
          .update({ category_id: monnaCategory.id })
          .eq('id', item.id);
        
        if (error) {
          console.error(`❌ Error moving "${itemName}":`, error.message);
        } else {
          console.log(`✅ Moved "${itemName}" back to Monna & Rassies Corner`);
        }
      } else {
        console.log(`⚠️ Item "${itemName}" not found`);
      }
    }
    
    // Now delete the empty "Kids & Family" category since we don't need it
    console.log('\n🗑️ Removing unnecessary "Kids & Family" category...');
    const { error: deleteError } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', kidsCategory.id);
    
    if (deleteError) {
      console.error('❌ Error deleting Kids & Family category:', deleteError.message);
    } else {
      console.log('✅ Removed "Kids & Family" category');
    }
    
    console.log('\n✅ Items restored to Monna & Rassies Corner!');
    console.log('💡 The original menu structure has been restored.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

restoreMonnaItems().catch(console.error);
