#!/usr/bin/env node

/**
 * Complete Menu Population Script
 * Adds ALL menu items according to the three-tier structure specification
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function populateCompleteMenu() {
  console.log('🍽️ POPULATING COMPLETE LITTLE LATTE LANE MENU')
  console.log('=' .repeat(60))

  try {
    // Step 1: Remove existing menu items to start fresh
    console.log('\\n🧹 Step 1: Cleaning existing menu items...')
    
    await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('   ✅ Existing menu items cleaned')

    // Step 2: Add all Hot Drinks
    console.log('\\n☕ Step 2: Adding Hot Drinks...')
    const hotDrinks = [
      { id: '650e8400-e29b-41d4-a716-446655440055', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Espresso (R)', price: 20.00 },
      { id: '650e8400-e29b-41d4-a716-446655440056', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Espresso (L)', price: 25.00 },
      { id: '650e8400-e29b-41d4-a716-446655440057', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Americano (R)', price: 25.00 },
      { id: '650e8400-e29b-41d4-a716-446655440058', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Americano (L)', price: 30.00 },
      { id: '650e8400-e29b-41d4-a716-446655440059', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Cortado', price: 30.00 },
      { id: '650e8400-e29b-41d4-a716-446655440060', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Flat White', price: 35.00 },
      { id: '650e8400-e29b-41d4-a716-446655440061', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Cappuccino (R)', price: 33.00 },
      { id: '650e8400-e29b-41d4-a716-446655440062', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Cappuccino (L)', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440063', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Mochachino (R)', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440064', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Mochachino (L)', price: 42.00 },
      { id: '650e8400-e29b-41d4-a716-446655440065', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Hot Chocolate (R)', price: 33.00 },
      { id: '650e8400-e29b-41d4-a716-446655440066', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Hot Chocolate (L)', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440067', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Hot Coco-Chocolate (R)', price: 40.00 },
      { id: '650e8400-e29b-41d4-a716-446655440068', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Hot Coco-Chocolate (L)', price: 45.00 },
      { id: '650e8400-e29b-41d4-a716-446655440069', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Red Cappuccino (R)', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440070', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Red Cappuccino (L)', price: 42.00 },
      { id: '650e8400-e29b-41d4-a716-446655440071', category_id: '550e8400-e29b-41d4-a716-446655440010', name: '5 Roses Tea (R)', price: 20.00 },
      { id: '650e8400-e29b-41d4-a716-446655440072', category_id: '550e8400-e29b-41d4-a716-446655440010', name: '5 Roses Tea (L)', price: 25.00 },
      { id: '650e8400-e29b-41d4-a716-446655440073', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Rooibos Tea (R)', price: 20.00 },
      { id: '650e8400-e29b-41d4-a716-446655440074', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Rooibos Tea (L)', price: 25.00 },
      { id: '650e8400-e29b-41d4-a716-446655440075', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Babychino', price: 25.00 },
      { id: '650e8400-e29b-41d4-a716-446655440076', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Steamers (Vanilla)', price: 33.00 },
      { id: '650e8400-e29b-41d4-a716-446655440176', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Steamers (Shortbread)', price: 33.00 },
      { id: '650e8400-e29b-41d4-a716-446655440177', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Steamers (Cookies)', price: 33.00 },
      { id: '650e8400-e29b-41d4-a716-446655440178', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Steamers (Butterscotch)', price: 33.00 },
      { id: '650e8400-e29b-41d4-a716-446655440179', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Steamers (Hazelnut)', price: 33.00 }
    ]

    await insertItems(hotDrinks, 'Hot Drinks')

    // Step 3: Add all Lattes
    console.log('\\n🥛 Step 3: Adding Lattes...')
    const lattes = [
      { id: '650e8400-e29b-41d4-a716-446655440077', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Cafe Latte', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440078', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Salted Caramel Latte', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440079', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Butterscotch Latte', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440080', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Shortbread Cookies Latte', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440081', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Hazelnut Latte', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440082', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Vanilla Latte', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440083', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Caramel Latte', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440084', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Pumpkin Spice Latte', price: 37.00 },
      { id: '650e8400-e29b-41d4-a716-446655440085', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Chai Latte', price: 45.00 },
      { id: '650e8400-e29b-41d4-a716-446655440086', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Dirty Chai Latte', price: 45.00 },
      { id: '650e8400-e29b-41d4-a716-446655440087', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Red Chai Latte', price: 45.00 },
      { id: '650e8400-e29b-41d4-a716-446655440088', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Spanish Salted Caramel', price: 48.00 },
      { id: '650e8400-e29b-41d4-a716-446655440089', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Honey Toffeenut', price: 48.00 },
      { id: '650e8400-e29b-41d4-a716-446655440090', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Baklawa Macchiato', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440091', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Coco Mocha', price: 48.00 },
      { id: '650e8400-e29b-41d4-a716-446655440092', category_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Creme Brulee', price: 48.00 }
    ]

    await insertItems(lattes, 'Lattes')

    // Step 4: Add Iced Lattes
    console.log('\\n🧊 Step 4: Adding Iced Lattes...')
    const icedLattes = [
      { id: '650e8400-e29b-41d4-a716-446655440093', category_id: '550e8400-e29b-41d4-a716-446655440012', name: 'Iced Shortbread Cortado', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440094', category_id: '550e8400-e29b-41d4-a716-446655440012', name: 'White Russian Iced Mocha', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440095', category_id: '550e8400-e29b-41d4-a716-446655440012', name: 'Salted Caramel & Pecan Latte', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440096', category_id: '550e8400-e29b-41d4-a716-446655440012', name: 'Pistachio Choco Latte', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440097', category_id: '550e8400-e29b-41d4-a716-446655440012', name: 'Almond Spanish Macchiato', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440098', category_id: '550e8400-e29b-41d4-a716-446655440012', name: 'Coco-Matcha Latte', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440099', category_id: '550e8400-e29b-41d4-a716-446655440012', name: 'Mango Coco Coffee Latte', price: 55.00 }
    ]

    await insertItems(icedLattes, 'Iced Lattes')

    // Step 5: Add Frappes
    console.log('\\n🥤 Step 5: Adding Frappes...')
    const frappes = [
      { id: '650e8400-e29b-41d4-a716-446655440100', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Butterscotch Frappe', price: 60.00 },
      { id: '650e8400-e29b-41d4-a716-446655440101', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Salted Caramel Frappe', price: 60.00 },
      { id: '650e8400-e29b-41d4-a716-446655440102', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Mocha Frappe', price: 60.00 },
      { id: '650e8400-e29b-41d4-a716-446655440103', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Toffee Nut Frappe', price: 60.00 },
      { id: '650e8400-e29b-41d4-a716-446655440104', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Chai Frappe', price: 60.00 },
      { id: '650e8400-e29b-41d4-a716-446655440105', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Dirty Chai Frappe', price: 60.00 },
      { id: '650e8400-e29b-41d4-a716-446655440107', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Chocolate Brownie Frappe', price: 63.00 },
      { id: '650e8400-e29b-41d4-a716-446655440108', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Choc Chip Cookie Frappe', price: 63.00 },
      { id: '650e8400-e29b-41d4-a716-446655440109', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Strawberry Shortcake Frappe', price: 63.00 },
      { id: '650e8400-e29b-41d4-a716-446655440110', category_id: '550e8400-e29b-41d4-a716-446655440013', name: 'Mango Cheesecake Frappe', price: 63.00 }
    ]

    await insertItems(frappes, 'Frappes')

    // Step 6: Add Food Items
    console.log('\\n🍕 Step 6: Adding Food Items...')
    
    // Scones
    const scones = [
      { id: '650e8400-e29b-41d4-a716-446655440001', category_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Savory Bacon & Cheese', price: 43.00 },
      { id: '650e8400-e29b-41d4-a716-446655440002', category_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Cheese & Strawberry Jam', price: 43.00 },
      { id: '650e8400-e29b-41d4-a716-446655440003', category_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Cream', price: 45.00 }
    ]

    // Pizza
    const pizzas = [
      { id: '650e8400-e29b-41d4-a716-446655440004', category_id: '550e8400-e29b-41d4-a716-446655440002', name: 'Regina (Ham & Cheese) (S)', price: 42.00 },
      { id: '650e8400-e29b-41d4-a716-446655440005', category_id: '550e8400-e29b-41d4-a716-446655440002', name: 'Regina (Ham & Cheese) (L)', price: 89.00 },
      { id: '650e8400-e29b-41d4-a716-446655440006', category_id: '550e8400-e29b-41d4-a716-446655440002', name: 'Margarita (Mozzarella & Basic) (S)', price: 35.00 },
      { id: '650e8400-e29b-41d4-a716-446655440007', category_id: '550e8400-e29b-41d4-a716-446655440002', name: 'Margarita (Mozzarella & Basic) (L)', price: 82.00 }
    ]

    // Toasties
    const toasties = [
      { id: '650e8400-e29b-41d4-a716-446655440035', category_id: '550e8400-e29b-41d4-a716-446655440006', name: 'Ham, Cheese & Tomato', price: 52.00 },
      { id: '650e8400-e29b-41d4-a716-446655440036', category_id: '550e8400-e29b-41d4-a716-446655440006', name: 'Chicken Mayo', price: 67.00 },
      { id: '650e8400-e29b-41d4-a716-446655440037', category_id: '550e8400-e29b-41d4-a716-446655440006', name: 'Bacon, Egg & Cheese', price: 70.00 },
      { id: '650e8400-e29b-41d4-a716-446655440038', category_id: '550e8400-e29b-41d4-a716-446655440006', name: 'Tomato, Cheese & Onion (V)', price: 52.00 }
    ]

    // Sides
    const sides = [
      { id: '650e8400-e29b-41d4-a716-446655440026', category_id: '550e8400-e29b-41d4-a716-446655440004', name: 'Small Chips (350g)', price: 25.00 },
      { id: '650e8400-e29b-41d4-a716-446655440027', category_id: '550e8400-e29b-41d4-a716-446655440004', name: 'Large Chips (500g)', price: 47.00 },
      { id: '650e8400-e29b-41d4-a716-446655440028', category_id: '550e8400-e29b-41d4-a716-446655440004', name: 'Small Saucy Chips', price: 52.00 },
      { id: '650e8400-e29b-41d4-a716-446655440029', category_id: '550e8400-e29b-41d4-a716-446655440004', name: 'Large Saucy Chips', price: 65.00 },
      { id: '650e8400-e29b-41d4-a716-446655440030', category_id: '550e8400-e29b-41d4-a716-446655440004', name: 'Side Greek Salad', price: 75.00 }
    ]

    // Extras
    const extras = [
      { id: '650e8400-e29b-41d4-a716-446655440031', category_id: '550e8400-e29b-41d4-a716-446655440005', name: 'Egg', price: 6.00 },
      { id: '650e8400-e29b-41d4-a716-446655440032', category_id: '550e8400-e29b-41d4-a716-446655440005', name: 'Cheese', price: 10.00 },
      { id: '650e8400-e29b-41d4-a716-446655440033', category_id: '550e8400-e29b-41d4-a716-446655440005', name: 'Avo (Seasonal)', price: 10.00 }
    ]

    await insertItems([...scones, ...pizzas, ...toasties, ...sides, ...extras], 'Food Items')

    // Step 7: Add All Day Menu
    console.log('\\n🍳 Step 7: Adding All Day Menu...')
    
    // All Day Brekkies
    const brekkies = [
      { id: '650e8400-e29b-41d4-a716-446655440039', category_id: '550e8400-e29b-41d4-a716-446655440007', name: 'Yogurt & Granold (V)', price: 65.00 },
      { id: '650e8400-e29b-41d4-a716-446655440040', category_id: '550e8400-e29b-41d4-a716-446655440007', name: 'Brekkie Roll (Bacon & Egg)', price: 45.00 },
      { id: '650e8400-e29b-41d4-a716-446655440041', category_id: '550e8400-e29b-41d4-a716-446655440007', name: 'Cheese Griller Brekkie', price: 80.00 },
      { id: '650e8400-e29b-41d4-a716-446655440042', category_id: '550e8400-e29b-41d4-a716-446655440007', name: 'Avo on Toast (V)', price: 45.00 }
    ]

    // All Day Meals
    const meals = [
      { id: '650e8400-e29b-41d4-a716-446655440043', category_id: '550e8400-e29b-41d4-a716-446655440008', name: 'Chicken Wrap (Chips or Salad)', price: 115.00 },
      { id: '650e8400-e29b-41d4-a716-446655440044', category_id: '550e8400-e29b-41d4-a716-446655440008', name: 'Halloumi Wrap (V) / With Chips', price: 87.00 },
      { id: '650e8400-e29b-41d4-a716-446655440046', category_id: '550e8400-e29b-41d4-a716-446655440008', name: 'Chicken Burger / With Chips', price: 87.00 },
      { id: '650e8400-e29b-41d4-a716-446655440048', category_id: '550e8400-e29b-41d4-a716-446655440008', name: 'Beef Burger / With Chips', price: 87.00 },
      { id: '650e8400-e29b-41d4-a716-446655440050', category_id: '550e8400-e29b-41d4-a716-446655440008', name: 'Boujee Bowl', price: 116.00 },
      { id: '650e8400-e29b-41d4-a716-446655440051', category_id: '550e8400-e29b-41d4-a716-446655440008', name: 'Pie & Gravy', price: 75.00 }
    ]

    await insertItems([...brekkies, ...meals], 'All Day Menu')

    // Step 8: Add Kids Menu
    console.log('\\n👶 Step 8: Adding Kids Menu...')
    const kidsItems = [
      { id: '650e8400-e29b-41d4-a716-446655440052', category_id: '550e8400-e29b-41d4-a716-446655440009', name: 'Chicken Strips', price: 77.00 },
      { id: '650e8400-e29b-41d4-a716-446655440053', category_id: '550e8400-e29b-41d4-a716-446655440009', name: 'Vienna & Chips', price: 75.00 },
      { id: '650e8400-e29b-41d4-a716-446655440054', category_id: '550e8400-e29b-41d4-a716-446655440009', name: 'Small Margarita Pizza', price: 36.00 }
    ]

    await insertItems(kidsItems, 'Kids Menu')

    // Final verification
    console.log('\\n🔍 Final Verification...')
    
    const { count: totalItems } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })

    const { data: categoryStats } = await supabase
      .from('menu_categories')
      .select('name, display_order')
      .order('display_order')

    console.log('\\n📊 COMPLETE MENU SUMMARY')
    console.log('=' .repeat(50))
    console.log(`🍽️ Total Menu Items: ${totalItems}`)
    console.log('\\n📋 Menu Structure:')
    
    for (const category of categoryStats || []) {
      const { count } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', getCategoryId(category.name))

      let section = 'Unknown'
      if (category.display_order >= 10 && category.display_order < 20) section = '🥤 Drinks'
      else if (category.display_order >= 20 && category.display_order < 30) section = '🍕 Food'
      else if (category.display_order >= 30 && category.display_order < 40) section = '🍳 All Day Menu'
      else if (category.display_order >= 40) section = '👶 Kids'

      console.log(`   ${section} → ${category.name} (${count} items)`)
    }

    console.log('\\n✅ COMPLETE THREE-TIER MENU READY!')
    console.log('🎯 Structure: Main Sections → Categories → Menu Items')
    console.log('📱 Ready for customer ordering system!')

  } catch (error) {
    console.error('❌ Menu population failed:', error.message)
  }
}

// Helper function to insert items with error handling
async function insertItems(items, categoryName) {
  let successCount = 0
  let errorCount = 0

  for (const item of items) {
    const { error } = await supabase
      .from('menu_items')
      .insert({
        ...item,
        description: item.description || `Delicious ${item.name}`,
        is_available: true,
        image_url: `/images/menu/${item.name.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.jpg`
      })

    if (error) {
      console.log(`   ⚠️  Error adding ${item.name}: ${error.message}`)
      errorCount++
    } else {
      successCount++
    }
  }

  console.log(`   ✅ ${categoryName}: ${successCount} items added, ${errorCount} errors`)
}

// Helper function to get category ID by name
function getCategoryId(categoryName) {
  const categoryMap = {
    'Hot Drinks': '550e8400-e29b-41d4-a716-446655440010',
    'Lattes': '550e8400-e29b-41d4-a716-446655440011',
    'Iced Lattes': '550e8400-e29b-41d4-a716-446655440012',
    'Frappes': '550e8400-e29b-41d4-a716-446655440013',
    'Fizzers': '550e8400-e29b-41d4-a716-446655440014',
    'Freezos': '550e8400-e29b-41d4-a716-446655440015',
    'Smoothies': '550e8400-e29b-41d4-a716-446655440016',
    'Scones': '550e8400-e29b-41d4-a716-446655440001',
    'Pizza': '550e8400-e29b-41d4-a716-446655440002',
    'Toasties': '550e8400-e29b-41d4-a716-446655440006',
    'Sides': '550e8400-e29b-41d4-a716-446655440004',
    'Extras': '550e8400-e29b-41d4-a716-446655440005',
    'All Day Brekkies': '550e8400-e29b-41d4-a716-446655440007',
    'All Day Meals': '550e8400-e29b-41d4-a716-446655440008',
    'Monna & Rassie\'s Corner': '550e8400-e29b-41d4-a716-446655440009'
  }
  return categoryMap[categoryName] || ''
}

// Execute menu population
populateCompleteMenu()
  .then(() => {
    console.log('\\n🏁 Complete menu population finished!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Menu population failed:', error)
    process.exit(1)
  })
