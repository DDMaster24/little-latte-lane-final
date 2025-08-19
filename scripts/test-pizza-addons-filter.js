const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPizzaAddonsFiltering() {
  try {
    console.log('=== TESTING PIZZA ADD-ONS FILTERING ===\n');

    // Test: All categories (admin view)
    console.log('1. ALL CATEGORIES (Admin View):');
    const { data: allCategories, error: allCatError } = await supabase
      .from('menu_categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (allCatError) {
      console.error('Error:', allCatError);
      return;
    }

    allCategories.forEach(cat => {
      const isPizzaAddons = cat.name.toLowerCase().includes('pizza add-ons');
      console.log(`  ${isPizzaAddons ? '🚫' : '✅'} ${cat.name} (${cat.id})`);
    });

    // Test: Customer categories (filtered view)
    console.log('\n2. CUSTOMER CATEGORIES (Filtered View):');
    const customerCategories = allCategories.filter(cat => 
      !cat.name.toLowerCase().includes('pizza add-ons')
    );

    customerCategories.forEach(cat => {
      console.log(`  ✅ ${cat.name} (${cat.id})`);
    });

    // Test: Pizza add-ons items
    console.log('\n3. PIZZA ADD-ONS ITEMS:');
    const pizzaAddonsCategory = allCategories.find(cat => 
      cat.name.toLowerCase().includes('pizza add-ons')
    );

    if (pizzaAddonsCategory) {
      const { data: addonsItems, error: addonsError } = await supabase
        .from('menu_items')
        .select('id, name, price')
        .eq('category_id', pizzaAddonsCategory.id)
        .eq('is_available', true);

      if (addonsError) {
        console.error('Error fetching add-ons:', addonsError);
        return;
      }

      console.log(`  Found ${addonsItems.length} pizza add-on items:`);
      addonsItems.forEach(item => {
        console.log(`    🧀 ${item.name} - R${item.price}`);
      });
    } else {
      console.log('  No pizza add-ons category found');
    }

    // Test: All menu items vs customer menu items
    console.log('\n4. MENU ITEMS COUNT COMPARISON:');
    const { data: allItems, error: allItemsError } = await supabase
      .from('menu_items')
      .select('id, category_id')
      .eq('is_available', true);

    if (allItemsError) {
      console.error('Error:', allItemsError);
      return;
    }

    const customerItems = pizzaAddonsCategory 
      ? allItems.filter(item => item.category_id !== pizzaAddonsCategory.id)
      : allItems;

    console.log(`  All items: ${allItems.length}`);
    console.log(`  Customer items: ${customerItems.length}`);
    console.log(`  Filtered out: ${allItems.length - customerItems.length}`);

    console.log('\n✅ Pizza add-ons filtering test completed!');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testPizzaAddonsFiltering();
