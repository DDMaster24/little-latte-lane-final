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

async function completeReorganization() {
  const supabase = getSupabaseAdmin();
  
  console.log('🔄 Starting complete menu reorganization...\n');
  
  try {
    // Get current categories
    const { data: categories, error: fetchError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('name');
    
    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError);
      return;
    }
    
    // Find the main sections we created
    const drinksSection = categories.find(cat => cat.name === 'Drinks' && !cat.parent_id);
    const foodSection = categories.find(cat => cat.name === 'Food' && !cat.parent_id);
    const extrasSection = categories.find(cat => cat.name === 'Extras' && !cat.parent_id);
    const mealsSection = categories.find(cat => cat.name === 'Meals' && !cat.parent_id);
    
    if (!drinksSection || !foodSection || !extrasSection || !mealsSection) {
      console.error('❌ Required sections not found');
      return;
    }
    
    // Define comprehensive category mappings
    const drinkCategories = [
      'Hot Drinks', 'Lattes', 'Iced Lattes', 'Frappes', 
      'Fizzers', 'Freezos', 'Smoothies', 'Coke a Cola'
    ];
    
    const foodCategories = ['Pizza', 'Scones', 'Toasties'];
    const extraCategories = ['Pizza Add Ons', 'Sides'];
    const mealCategories = ['All Day Brekkies', 'All Day Meals'];
    const specialCategories = ['Monna & Rassies Corner']; // Keep as separate section
    
    console.log('📝 Moving drink categories...');
    for (const categoryName of drinkCategories) {
      const category = categories.find(cat => cat.name === categoryName);
      if (category && category.parent_id !== drinksSection.id) {
        const { error } = await supabase
          .from('menu_categories')
          .update({ parent_id: drinksSection.id })
          .eq('id', category.id);
        
        if (error) {
          console.error(`   ❌ Error moving "${categoryName}":`, error.message);
        } else {
          console.log(`   ✅ Moved "${categoryName}" to Drinks`);
        }
      }
    }
    
    console.log('📝 Moving food categories...');
    for (const categoryName of foodCategories) {
      const category = categories.find(cat => cat.name === categoryName);
      if (category && category.parent_id !== foodSection.id) {
        const { error } = await supabase
          .from('menu_categories')
          .update({ parent_id: foodSection.id })
          .eq('id', category.id);
        
        if (error) {
          console.error(`   ❌ Error moving "${categoryName}":`, error.message);
        } else {
          console.log(`   ✅ Moved "${categoryName}" to Food`);
        }
      }
    }
    
    console.log('📝 Moving extra categories...');
    for (const categoryName of extraCategories) {
      const category = categories.find(cat => cat.name === categoryName);
      if (category && category.parent_id !== extrasSection.id) {
        const { error } = await supabase
          .from('menu_categories')
          .update({ parent_id: extrasSection.id })
          .eq('id', category.id);
        
        if (error) {
          console.error(`   ❌ Error moving "${categoryName}":`, error.message);
        } else {
          console.log(`   ✅ Moved "${categoryName}" to Extras`);
        }
      }
    }
    
    console.log('📝 Moving meal categories...');
    for (const categoryName of mealCategories) {
      const category = categories.find(cat => cat.name === categoryName);
      if (category && category.parent_id !== mealsSection.id) {
        const { error } = await supabase
          .from('menu_categories')
          .update({ parent_id: mealsSection.id })
          .eq('id', category.id);
        
        if (error) {
          console.error(`   ❌ Error moving "${categoryName}":`, error.message);
        } else {
          console.log(`   ✅ Moved "${categoryName}" to Meals`);
        }
      }
    }
    
    // Final verification
    console.log('\n🔍 Final structure verification...');
    const { data: finalCategories } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { nullsFirst: false });
    
    const sections = finalCategories?.filter(cat => !cat.parent_id) || [];
    const categoriesWithParent = finalCategories?.filter(cat => cat.parent_id) || [];
    
    console.log(`\n📊 Final Summary:`);
    console.log(`   🏷️  Sections: ${sections.length}`);
    console.log(`   📂 Categories: ${categoriesWithParent.length}`);
    
    sections.forEach(section => {
      const sectionCategories = categoriesWithParent.filter(cat => cat.parent_id === section.id);
      console.log(`\n   📁 ${section.name} (${sectionCategories.length} categories)`);
      sectionCategories.forEach(cat => {
        console.log(`      - ${cat.name}`);
      });
    });
    
    console.log('\n✅ Complete reorganization finished!');
    console.log('💡 Refresh your admin page to see the organized structure.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the complete reorganization
completeReorganization().catch(console.error);
