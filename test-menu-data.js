const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testMenuPageData() {
  console.log('🔍 Testing Menu Page Data Structure...\n');

  // Test getSections functionality
  const { data: sections, error: sectionsError } = await supabase
    .from('menu_categories')
    .select('*')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (sectionsError) {
    console.error('❌ Error fetching sections:', sectionsError);
    return;
  }

  console.log('📁 SECTIONS (what menu page should display):');
  console.log('==============================================');
  sections.forEach((section, index) => {
    console.log(`${index + 1}. ${section.name}`);
    console.log(`   Description: ${section.description}`);
    console.log(`   Display Order: ${section.display_order}`);
    console.log('');
  });

  // Test child categories for each section
  console.log('📂 CATEGORIES UNDER EACH SECTION:');
  console.log('==================================');
  
  for (const section of sections) {
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('parent_id', section.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    console.log(`\\n${section.name} Section:`);
    if (categories.length === 0) {
      console.log('  ⚠️  No categories (should show "Coming Soon")');
    } else {
      categories.forEach(category => {
        console.log(`  - ${category.name}`);
      });
    }
  }

  console.log('\\n✅ Menu page should now display all sections correctly!');
}

testMenuPageData().catch(console.error);
