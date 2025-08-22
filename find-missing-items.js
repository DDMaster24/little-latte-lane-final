const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function findMissingItems() {
  console.log('🔍 Finding Missing Items...\n');

  // Check for items that might be in the wrong categories
  const { data: items, error } = await supabase
    .from('menu_items')
    .select(`
      id,
      name,
      category_id,
      menu_categories(name, parent_id)
    `)
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Look for Monna & Rassies items
  console.log('🔍 Searching for Monna & Rassies items:');
  const monnaItems = items.filter(item => 
    item.name.toLowerCase().includes('chicken') ||
    item.name.toLowerCase().includes('vienna') ||
    item.name.toLowerCase().includes('margherita') ||
    item.name.toLowerCase().includes('kids')
  );

  monnaItems.forEach(item => {
    console.log(`- ${item.name}`);
    console.log(`  Category: ${item.menu_categories?.name || 'Unknown'}`);
    console.log(`  Category ID: ${item.category_id}`);
    console.log('');
  });

  // Look for sweet items
  console.log('\n🍰 Searching for sweet items:');
  const sweetItems = items.filter(item => 
    item.name.toLowerCase().includes('cake') ||
    item.name.toLowerCase().includes('muffin') ||
    item.name.toLowerCase().includes('donut') ||
    item.name.toLowerCase().includes('cookie') ||
    item.name.toLowerCase().includes('sweet') ||
    item.name.toLowerCase().includes('dessert')
  );

  sweetItems.forEach(item => {
    console.log(`- ${item.name}`);
    console.log(`  Category: ${item.menu_categories?.name || 'Unknown'}`);
    console.log(`  Category ID: ${item.category_id}`);
    console.log('');
  });

  // Check all categories and their item counts
  console.log('\n📊 All Categories with Item Counts:');
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('*')
    .order('name');

  for (const category of categories) {
    const { count } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact' })
      .eq('category_id', category.id);

    const parentInfo = category.parent_id ? 'Child Category' : 'Section';
    console.log(`${category.name} (${parentInfo}): ${count} items`);
  }
}

findMissingItems().catch(console.error);
