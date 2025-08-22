const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function finalCheck() {
  const supabase = getSupabaseAdmin();
  
  try {
    // Get current state
    const { data: categories } = await supabase.from('menu_categories').select('*').order('name');
    const { data: menuItems } = await supabase.from('menu_items').select('*');
    
    console.log('📋 Current sections and categories:');
    
    const sections = categories.filter(cat => !cat.parent_id);
    
    sections.forEach(section => {
      const sectionCategories = categories.filter(cat => cat.parent_id === section.id);
      console.log(`\n📁 ${section.name} (${sectionCategories.length} categories)`);
      
      // If this is Monna & Rassies, check items directly
      if (section.name === 'Monna & Rassies Corner') {
        const directItems = menuItems.filter(item => item.category_id === section.id);
        console.log(`   Direct items: ${directItems.length}`);
        directItems.forEach(item => console.log(`   🍽️ ${item.name}`));
      }
      
      sectionCategories.forEach(cat => {
        const catItems = menuItems.filter(item => item.category_id === cat.id);
        console.log(`   📂 ${cat.name} (${catItems.length} items)`);
      });
    });
    
    // Check if we need to move items to the correct Monna category
    const monnaSection = sections.find(s => s.name === 'Monna & Rassies Corner');
    if (monnaSection) {
      const targetItems = ['Chicken Strips', 'Vienna and Chips', 'Small Margherita Pizza'];
      
      for (const itemName of targetItems) {
        const item = menuItems.find(i => i.name === itemName);
        if (item && item.category_id !== monnaSection.id) {
          console.log(`\n📝 Moving "${itemName}" to Monna & Rassies Corner...`);
          await supabase
            .from('menu_items')
            .update({ category_id: monnaSection.id })
            .eq('id', item.id);
          console.log(`✅ Moved "${itemName}"`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

finalCheck().catch(console.error);
