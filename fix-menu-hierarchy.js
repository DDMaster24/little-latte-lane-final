const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixMenuHierarchy() {
  console.log('🔧 Fixing Menu Hierarchy...\n');

  // Step 1: Create proper categories for sections that have items directly assigned
  
  // Create "Kids Menu" category under "Monna & Rassies Corner" section
  const monnaAndRassiesSectionId = '550e8400-e29b-41d4-a716-446655440009';
  
  const { data: kidsCategory, error: kidsError } = await supabase
    .from('menu_categories')
    .insert({
      name: 'Kids Menu',
      description: 'Kid-friendly meals and favorites',
      parent_id: monnaAndRassiesSectionId,
      display_order: 17,
      is_active: true
    })
    .select()
    .single();

  if (kidsError) {
    console.error('Error creating Kids Menu category:', kidsError);
    return;
  }

  console.log('✅ Created "Kids Menu" category');

  // Step 2: Move items from "Monna & Rassies Corner" section to "Kids Menu" category
  const { error: moveKidsItemsError } = await supabase
    .from('menu_items')
    .update({ category_id: kidsCategory.id })
    .eq('category_id', monnaAndRassiesSectionId);

  if (moveKidsItemsError) {
    console.error('Error moving kids items:', moveKidsItemsError);
    return;
  }

  console.log('✅ Moved items from "Monna & Rassies Corner" section to "Kids Menu" category');

  // Step 3: Handle "Extras" section items
  const extrasSectionId = '550e8400-e29b-41d4-a716-446655440005';
  
  // Get items that are directly in Extras section
  const { data: extrasItems, error: extrasItemsError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category_id', extrasSectionId);

  if (extrasItemsError) {
    console.error('Error fetching extras items:', extrasItemsError);
    return;
  }

  console.log('\\n📦 Items currently in Extras section:');
  extrasItems.forEach(item => {
    console.log(`- ${item.name}`);
  });

  // Move these items to appropriate existing categories
  // Let's check what these items are and move them logically
  for (const item of extrasItems) {
    let targetCategoryId;
    
    // Logic to categorize items
    if (item.name.toLowerCase().includes('bread') || 
        item.name.toLowerCase().includes('garlic') ||
        item.name.toLowerCase().includes('side')) {
      // Move to "Sides" category
      targetCategoryId = '550e8400-e29b-41d4-a716-446655440004';
    } else {
      // Default to "Sides" category for any extras
      targetCategoryId = '550e8400-e29b-41d4-a716-446655440004';
    }

    const { error: moveError } = await supabase
      .from('menu_items')
      .update({ category_id: targetCategoryId })
      .eq('id', item.id);

    if (moveError) {
      console.error(`Error moving item ${item.name}:`, moveError);
    } else {
      console.log(`✅ Moved "${item.name}" to Sides category`);
    }
  }

  // Step 4: Create a proper category structure for Sweets section
  const sweetsSectionId = '5b8f4798-51f0-4cf4-a3eb-57bf059fa764';
  
  const { data: dessertsCategory, error: dessertsError } = await supabase
    .from('menu_categories')
    .insert({
      name: 'Desserts',
      description: 'Sweet treats and desserts',
      parent_id: sweetsSectionId,
      display_order: 18,
      is_active: true
    })
    .select()
    .single();

  if (dessertsError) {
    console.error('Error creating Desserts category:', dessertsError);
    return;
  }

  console.log('✅ Created "Desserts" category under Sweets section');

  // Step 5: Verify the structure
  console.log('\\n📊 Verifying Fixed Structure...');
  
  const { data: updatedCategories } = await supabase
    .from('menu_categories')
    .select('*')
    .order('display_order');

  const sections = updatedCategories.filter(cat => cat.parent_id === null);
  
  for (const section of sections) {
    const childCategories = updatedCategories.filter(cat => cat.parent_id === section.id);
    
    // Count items directly in section (should be 0)
    const { count: sectionItemCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact' })
      .eq('category_id', section.id);

    // Count items in child categories
    let totalCategoryItems = 0;
    for (const category of childCategories) {
      const { count: categoryItemCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact' })
        .eq('category_id', category.id);
      totalCategoryItems += categoryItemCount || 0;
    }

    console.log(`\\n${section.name} Section:`);
    console.log(`  Categories: ${childCategories.length}`);
    console.log(`  Items directly in section: ${sectionItemCount || 0} ${sectionItemCount > 0 ? '❌' : '✅'}`);
    console.log(`  Items in child categories: ${totalCategoryItems}`);
    
    childCategories.forEach(cat => {
      console.log(`    - ${cat.name}`);
    });
  }
}

fixMenuHierarchy().catch(console.error);
