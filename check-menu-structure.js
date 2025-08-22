const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkMenuStructure() {
  console.log('🔍 Checking Current Menu Structure...\n');

  // Get all categories with their hierarchical relationships
  const { data: categories, error } = await supabase
    .from('menu_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return;
  }

  // Separate sections (parent_id = null) from categories (parent_id != null)
  const sections = categories.filter(cat => cat.parent_id === null);
  const childCategories = categories.filter(cat => cat.parent_id !== null);

  console.log('📁 SECTIONS (parent_id = null):');
  console.log('=====================================');
  sections.forEach(section => {
    console.log(`- ${section.name} (ID: ${section.id})`);
    console.log(`  Description: ${section.description || 'None'}`);
    console.log(`  Display Order: ${section.display_order}`);
    console.log(`  Is Active: ${section.is_active}`);
    console.log(`  Image URL: ${section.image_url || 'None'}`);
    console.log('');
  });

  console.log('\n📂 CATEGORIES (have parent_id):');
  console.log('=====================================');
  for (const section of sections) {
    const sectionCategories = childCategories.filter(cat => cat.parent_id === section.id);
    console.log(`\n${section.name} Section (${sectionCategories.length} categories):`);
    
    if (sectionCategories.length === 0) {
      console.log('  - No categories');
    } else {
      for (const category of sectionCategories) {
        // Get item count for this category
        const { count: itemCount } = await supabase
          .from('menu_items')
          .select('*', { count: 'exact' })
          .eq('category_id', category.id);

        console.log(`  - ${category.name} (${itemCount || 0} items)`);
        console.log(`    ID: ${category.id}`);
        console.log(`    Display Order: ${category.display_order}`);
        console.log(`    Is Active: ${category.is_active}`);
      }
    }
  }

  // Check for orphaned categories (parent_id points to non-existent section)
  console.log('\n⚠️  ORPHANED CATEGORIES:');
  console.log('=====================================');
  const sectionIds = sections.map(s => s.id);
  const orphaned = childCategories.filter(cat => !sectionIds.includes(cat.parent_id));
  
  if (orphaned.length === 0) {
    console.log('✅ No orphaned categories found');
  } else {
    orphaned.forEach(cat => {
      console.log(`- ${cat.name} (points to non-existent parent: ${cat.parent_id})`);
    });
  }

  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('=====================================');
  console.log(`Total Categories: ${categories.length}`);
  console.log(`Sections: ${sections.length}`);
  console.log(`Child Categories: ${childCategories.length}`);
  console.log(`Orphaned Categories: ${orphaned.length}`);

  // Get total items
  const { count: totalItems } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact' });

  console.log(`Total Menu Items: ${totalItems || 0}`);
}

checkMenuStructure().catch(console.error);
