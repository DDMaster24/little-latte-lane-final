const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryMenuData() {
  try {
    console.log('=== CURRENT MENU CATEGORIES ===');
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { nullsFirst: false });

    if (catError) {
      console.error('Categories error:', catError);
      return;
    }

    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.id}) - Active: ${cat.is_active}`);
      if (cat.description) console.log(`  Description: ${cat.description}`);
    });

    console.log('\n=== CURRENT MENU ITEMS ===');
    const { data: items, error: itemError } = await supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories (name)
      `)
      .order('category_id')
      .order('name');

    if (itemError) {
      console.error('Items error:', itemError);
      return;
    }

    let currentCategoryId = null;
    items.forEach(item => {
      if (item.category_id !== currentCategoryId) {
        currentCategoryId = item.category_id;
        console.log(`\n--- Category: ${item.menu_categories?.name || 'Unknown'} (${item.category_id}) ---`);
      }
      console.log(`  • ${item.name} - R${item.price} - Available: ${item.is_available}`);
    });

    console.log('\n=== CATEGORY SUMMARY ===');
    const categoryStats = {};
    items.forEach(item => {
      const catName = item.menu_categories?.name || 'Unknown';
      categoryStats[catName] = (categoryStats[catName] || 0) + 1;
    });

    Object.entries(categoryStats).forEach(([catName, count]) => {
      console.log(`${catName}: ${count} items`);
    });

  } catch (error) {
    console.error('Query error:', error);
  }
}

queryMenuData();
