const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function revertChanges() {
  const supabase = getSupabaseAdmin();
  
  console.log('🔄 Reverting unauthorized changes...\n');
  
  try {
    // Get all categories
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('*')
      .order('name');
    
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*');
    
    console.log('📋 Current categories:');
    categories.forEach(cat => {
      const items = menuItems.filter(item => item.category_id === cat.id);
      console.log(`   - ${cat.name} (parent: ${cat.parent_id || 'none'}) - ${items.length} items`);
      if (items.length > 0) {
        items.forEach(item => console.log(`      🍽️ ${item.name}`));
      }
    });
    
    // 1. Restore "Monna & Rassies Corner" as original section name
    const kidsSection = categories.find(cat => cat.name === 'Kids & Family' && !cat.parent_id);
    if (kidsSection) {
      console.log('\n📝 Restoring "Monna & Rassies Corner" name...');
      await supabase
        .from('menu_categories')
        .update({ 
          name: 'Monna & Rassies Corner',
          description: 'Kids menu and family favorites'
        })
        .eq('id', kidsSection.id);
      console.log('✅ Restored original name');
    }
    
    // 2. Recreate "Sweets" section
    const sweetsExists = categories.find(cat => cat.name === 'Sweets' && !cat.parent_id);
    if (!sweetsExists) {
      console.log('\n📝 Recreating "Sweets" section...');
      await supabase
        .from('menu_categories')
        .insert({
          name: 'Sweets',
          description: 'Desserts and sweet treats',
          display_order: 6,
          is_active: true,
          parent_id: null
        });
      console.log('✅ Recreated Sweets section');
    }
    
    // 3. Check what items are actually under Monna & Rassies Corner
    const monnaCategory = categories.find(cat => cat.name === 'Monna & Rassies Corner');
    if (monnaCategory) {
      const monnaItems = menuItems.filter(item => item.category_id === monnaCategory.id);
      console.log(`\n🔍 Items currently in Monna & Rassies Corner: ${monnaItems.length}`);
      monnaItems.forEach(item => console.log(`   - ${item.name}`));
      
      if (monnaItems.length === 0) {
        console.log('\n⚠️  Monna & Rassies Corner has no items!');
        console.log('   This suggests the items were moved elsewhere during reorganization.');
        
        // Look for items that might belong to Monna & Rassies Corner
        console.log('\n🔍 Searching for possible Monna & Rassies items in other categories...');
        const possibleMonnaItems = menuItems.filter(item => 
          item.name.toLowerCase().includes('kid') ||
          item.name.toLowerCase().includes('child') ||
          item.name.toLowerCase().includes('monna') ||
          item.name.toLowerCase().includes('rassie') ||
          item.name.toLowerCase().includes('family')
        );
        
        if (possibleMonnaItems.length > 0) {
          console.log('   Found possible matches:');
          possibleMonnaItems.forEach(item => {
            const category = categories.find(cat => cat.id === item.category_id);
            console.log(`      - ${item.name} (currently in: ${category?.name || 'unknown'})`);
          });
        }
      }
    }
    
    console.log('\n✅ Changes reverted. Please check the current structure.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

revertChanges().catch(console.error);
