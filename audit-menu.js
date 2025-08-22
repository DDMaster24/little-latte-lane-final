const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function auditAndFixMenu() {
  const supabase = getSupabaseAdmin();
  
  console.log('🔍 Auditing current menu structure...\n');
  
  try {
    // Get all categories and menu items
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('name');
    
    const { data: menuItems, error: itemError } = await supabase
      .from('menu_items')
      .select('*')
      .order('name');
    
    if (catError || itemError) {
      console.error('❌ Error fetching data:', catError || itemError);
      return;
    }
    
    console.log('📋 Current structure:');
    
    const sections = categories.filter(cat => !cat.parent_id);
    const categoriesWithParent = categories.filter(cat => cat.parent_id);
    
    sections.forEach(section => {
      const sectionCategories = categoriesWithParent.filter(cat => cat.parent_id === section.id);
      const sectionItems = sectionCategories.reduce((acc, cat) => {
        const catItems = menuItems.filter(item => item.category_id === cat.id);
        return acc + catItems.length;
      }, 0);
      
      console.log(`\n📁 ${section.name} (${sectionCategories.length} categories, ${sectionItems} items)`);
      
      sectionCategories.forEach(cat => {
        const catItems = menuItems.filter(item => item.category_id === cat.id);
        console.log(`   📂 ${cat.name} (${catItems.length} items)`);
        catItems.forEach(item => {
          console.log(`      🍽️ ${item.name}`);
        });
      });
    });
    
    // Check for orphaned items (items without proper category structure)
    console.log('\n🔍 Checking for organizational issues...');
    
    const orphanedItems = menuItems.filter(item => {
      const category = categories.find(cat => cat.id === item.category_id);
      return !category;
    });
    
    if (orphanedItems.length > 0) {
      console.log(`\n⚠️ Found ${orphanedItems.length} orphaned items (no category):`);
      orphanedItems.forEach(item => console.log(`   - ${item.name}`));
    }
    
    // Now let's fix the organization based on logical groupings
    console.log('\n🔧 Fixing menu organization...');
    
    // Find existing sections
    const drinksSection = sections.find(s => s.name === 'Drinks');
    const foodSection = sections.find(s => s.name === 'Food');
    const extrasSection = sections.find(s => s.name === 'Extras');
    const mealsSection = sections.find(s => s.name === 'Meals');
    const kidsSection = sections.find(s => s.name === 'Monna & Rassies Corner');
    
    // Create Kids section if it doesn't exist properly
    let kidsId = kidsSection?.id;
    if (!kidsSection) {
      console.log('🏗️ Creating Kids/Family section...');
      const { data: newKids, error } = await supabase
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
      
      if (error) {
        console.error('❌ Error creating Kids section:', error);
      } else {
        kidsId = newKids.id;
        console.log('✅ Created Kids & Family section');
      }
    } else {
      // Update the existing kids section name for clarity
      await supabase
        .from('menu_categories')
        .update({ 
          name: 'Kids & Family',
          description: 'Kid-friendly menu options and family favorites'
        })
        .eq('id', kidsSection.id);
      console.log('✅ Updated Kids & Family section');
    }
    
    // Define proper category mappings based on logical menu organization
    const categoryMappings = {
      [drinksSection.id]: {
        name: 'Drinks',
        categories: ['Hot Drinks', 'Lattes', 'Iced Lattes', 'Frappes', 'Fizzers', 'Freezos', 'Smoothies', 'Coke a Cola']
      },
      [foodSection.id]: {
        name: 'Food', 
        categories: ['Pizza', 'Toasties']
      },
      [mealsSection.id]: {
        name: 'Meals',
        categories: ['All Day Brekkies', 'All Day Meals', 'Scones'] // Scones are more like a meal/breakfast item
      },
      [extrasSection.id]: {
        name: 'Extras',
        categories: ['Pizza Add Ons', 'Sides']
      },
      [kidsId]: {
        name: 'Kids & Family',
        categories: ['Monna & Rassies Corner'] // This should be moved here
      }
    };
    
    // Apply the mappings
    for (const [sectionId, mapping] of Object.entries(categoryMappings)) {
      console.log(`\n📝 Organizing ${mapping.name} categories...`);
      
      for (const categoryName of mapping.categories) {
        const category = categories.find(cat => cat.name === categoryName);
        if (category && category.parent_id !== sectionId) {
          const { error } = await supabase
            .from('menu_categories')
            .update({ parent_id: sectionId })
            .eq('id', category.id);
          
          if (error) {
            console.error(`   ❌ Error moving "${categoryName}":`, error.message);
          } else {
            console.log(`   ✅ Moved "${categoryName}" to ${mapping.name}`);
          }
        }
      }
    }
    
    console.log('\n✅ Menu audit and fixes completed!');
    console.log('💡 Refresh your admin page to see the corrected structure.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the audit and fix
auditAndFixMenu().catch(console.error);
