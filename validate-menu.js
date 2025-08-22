const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function validateMenuStructure() {
  console.log('✅ Validating Menu Structure...\n');

  // Get all categories
  const { data: categories, error } = await supabase
    .from('menu_categories')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('❌ Error fetching categories:', error);
    return;
  }

  // Separate sections and categories
  const sections = categories.filter(cat => cat.parent_id === null);
  const childCategories = categories.filter(cat => cat.parent_id !== null);

  console.log('📋 VALIDATION RESULTS:');
  console.log('======================');

  let allValidationsPassed = true;

  // Validation 1: All sections should have 0 items directly
  console.log('\\n1️⃣ Checking sections have no direct items...');
  for (const section of sections) {
    const { count: itemCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact' })
      .eq('category_id', section.id);

    if (itemCount > 0) {
      console.log(`❌ Section "${section.name}" has ${itemCount} direct items (should be 0)`);
      allValidationsPassed = false;
    } else {
      console.log(`✅ Section "${section.name}" has no direct items`);
    }
  }

  // Validation 2: Check each section has categories
  console.log('\\n2️⃣ Checking each section has categories...');
  for (const section of sections) {
    const sectionCategories = childCategories.filter(cat => cat.parent_id === section.id);
    
    if (sectionCategories.length === 0) {
      console.log(`⚠️  Section "${section.name}" has no categories (empty section)`);
    } else {
      let totalItems = 0;
      for (const category of sectionCategories) {
        const { count: itemCount } = await supabase
          .from('menu_items')
          .select('*', { count: 'exact' })
          .eq('category_id', category.id);
        totalItems += itemCount || 0;
      }
      console.log(`✅ Section "${section.name}" has ${sectionCategories.length} categories with ${totalItems} total items`);
    }
  }

  // Validation 3: Check for orphaned items
  console.log('\\n3️⃣ Checking for orphaned items...');
  const { data: allItems } = await supabase
    .from('menu_items')
    .select('id, name, category_id');

  const allCategoryIds = categories.map(cat => cat.id);
  const orphanedItems = allItems.filter(item => !allCategoryIds.includes(item.category_id));

  if (orphanedItems.length === 0) {
    console.log('✅ No orphaned items found');
  } else {
    console.log(`❌ Found ${orphanedItems.length} orphaned items:`);
    orphanedItems.forEach(item => {
      console.log(`   - ${item.name} (category_id: ${item.category_id})`);
    });
    allValidationsPassed = false;
  }

  // Final summary
  console.log('\\n📊 FINAL SUMMARY:');
  console.log('==================');
  console.log(`Sections: ${sections.length}`);
  console.log(`Categories: ${childCategories.length}`);
  console.log(`Total Items: ${allItems.length}`);
  
  if (allValidationsPassed) {
    console.log('\\n🎉 ALL VALIDATIONS PASSED! Menu structure is correct.');
  } else {
    console.log('\\n⚠️  Some validations failed. Please review the issues above.');
  }

  // Show the complete hierarchy
  console.log('\\n🏗️  COMPLETE HIERARCHY:');
  console.log('========================');
  for (const section of sections) {
    const sectionCategories = childCategories.filter(cat => cat.parent_id === section.id);
    let totalSectionItems = 0;
    
    console.log(`\\n📁 ${section.name} (Section)`);
    
    if (sectionCategories.length === 0) {
      console.log(`   📂 (No categories)`);
    } else {
      for (const category of sectionCategories) {
        const { count: itemCount } = await supabase
          .from('menu_items')
          .select('*', { count: 'exact' })
          .eq('category_id', category.id);
        
        totalSectionItems += itemCount || 0;
        console.log(`   📂 ${category.name} (${itemCount || 0} items)`);
      }
    }
    
    console.log(`   Total: ${totalSectionItems} items`);
  }
}

validateMenuStructure().catch(console.error);
