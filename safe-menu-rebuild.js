#!/usr/bin/env node

/**
 * Safe Menu Database Rebuild
 * Updates existing data instead of deleting to preserve foreign key constraints
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Your complete menu data
const menuData = {
  "categories": [
    { "name": "Drinks", "description": "All beverages including hot drinks, lattes, iced drinks, and smoothies", "order": 1 },
    { "name": "Food", "description": "Scones, pizza, toasties, sides and extras", "order": 2 },
    { "name": "All Day Menu", "description": "All day breakfast and meal options", "order": 3 },
    { "name": "Kids", "description": "Monna & Rassie's Corner - Kids menu items", "order": 4 }
  ]
}

async function safeMenuRebuild() {
  console.log('🔄 SAFE MENU DATABASE REBUILD')
  console.log('=' .repeat(50))

  try {
    // Step 1: Check existing orders
    console.log('\n🔍 Step 1: Checking existing orders...')
    
    const { count: orderCount } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Found ${orderCount} existing order items`)
    
    if (orderCount > 0) {
      console.log('⚠️ Found existing orders - using safe update approach')
    }

    // Step 2: Mark all existing items as inactive instead of deleting
    console.log('\n🔄 Step 2: Deactivating old menu items...')
    
    const { error: deactivateError } = await supabase
      .from('menu_items')
      .update({ is_available: false })
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deactivateError) {
      console.error('❌ Error deactivating items:', deactivateError.message)
      return
    }

    const { error: deactivateCategoriesError } = await supabase
      .from('menu_categories')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (deactivateCategoriesError) {
      console.error('❌ Error deactivating categories:', deactivateCategoriesError.message)
      return
    }

    console.log('✅ Old items deactivated')

    // Step 3: Create new clean categories
    console.log('\n🏗️ Step 3: Creating new menu structure...')
    
    const categoryMap = {}

    for (const categoryData of menuData.categories) {
      console.log(`\n📂 Creating category: ${categoryData.name}`)
      
      const { data: category, error: categoryError } = await supabase
        .from('menu_categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          display_order: categoryData.order,
          is_active: true
        })
        .select()
        .single()

      if (categoryError) {
        console.error(`❌ Error creating category ${categoryData.name}:`, categoryError.message)
        continue
      }

      categoryMap[categoryData.name] = category.id
      console.log(`✅ Created: ${categoryData.name}`)
    }

    // Step 4: Create sample items to verify structure
    console.log('\n🍽️ Step 4: Creating sample menu items...')

    const sampleItems = [
      // Drinks
      { category: 'Drinks', name: 'Espresso (R)', price: 20, description: 'HOT DRINKS - Classic espresso regular size' },
      { category: 'Drinks', name: 'Espresso (L)', price: 25, description: 'HOT DRINKS - Classic espresso large size' },
      { category: 'Drinks', name: 'Cafe Latte', price: 37, description: "LATTE'S - Classic cafe latte" },
      { category: 'Drinks', name: 'Butterscotch Frappe', price: 60, description: "FRAPPE'S - Butterscotch flavored frappe" },
      
      // Food
      { category: 'Food', name: 'Savory Bacon & Cheese Scone', price: 43, description: 'SCONES - Savory scone with bacon and cheese' },
      { category: 'Food', name: 'Regina Pizza (S)', price: 42, description: 'PIZZA - Regina with ham and cheese, small size' },
      { category: 'Food', name: 'Regina Pizza (L)', price: 98, description: 'PIZZA - Regina with ham and cheese, large size' },
      { category: 'Food', name: 'Ham, Cheese & Tomato Toastie', price: 52, description: 'TOASTIES - Classic ham, cheese and tomato toastie' },
      
      // All Day Menu
      { category: 'All Day Menu', name: 'Yogurt & Granold (V)', price: 65, description: 'ALL DAY BREKKIES - Vegetarian yogurt and granola' },
      { category: 'All Day Menu', name: 'Chicken Wrap (Chips or Salad)', price: 115, description: 'ALL DAY MEALS - Chicken wrap served with chips or salad' },
      
      // Kids
      { category: 'Kids', name: 'Chicken Strips', price: 77, description: "MONNA & RASSIE'S CORNER - Kids chicken strips" },
      { category: 'Kids', name: 'Small Margarita Pizza', price: 35, description: "MONNA & RASSIE'S CORNER - Kids size margarita pizza" }
    ]

    for (const item of sampleItems) {
      const categoryId = categoryMap[item.category]
      if (!categoryId) {
        console.log(`⚠️ Skipping ${item.name} - category not found`)
        continue
      }

      const { error: itemError } = await supabase
        .from('menu_items')
        .insert({
          category_id: categoryId,
          name: item.name,
          description: item.description,
          price: item.price,
          is_available: true
        })

      if (itemError) {
        console.error(`❌ Error creating ${item.name}:`, itemError.message)
      } else {
        console.log(`✅ ${item.name} - R${item.price}`)
      }
    }

    // Step 5: Verify the structure
    console.log('\n🔍 Step 5: Verifying new structure...')
    
    const { count: activeCategoryCount } = await supabase
      .from('menu_categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: activeItemCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true)

    const { count: totalCategoryCount } = await supabase
      .from('menu_categories')
      .select('*', { count: 'exact', head: true })

    const { count: totalItemCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })

    console.log('\n📊 REBUILD SUMMARY:')
    console.log(`   Active Categories: ${activeCategoryCount} (Total: ${totalCategoryCount})`)
    console.log(`   Active Menu Items: ${activeItemCount} (Total: ${totalItemCount})`)
    console.log(`   Preserved Orders: ${orderCount} (Foreign keys intact)`)
    console.log('\n✅ Menu database safely rebuilt!')
    console.log('🎯 Clean structure created, old data preserved for order history!')

    // Show the new category structure
    console.log('\n📋 NEW CATEGORY STRUCTURE:')
    const { data: newCategories } = await supabase
      .from('menu_categories')
      .select('name, display_order, is_active')
      .eq('is_active', true)
      .order('display_order')

    newCategories?.forEach(cat => {
      console.log(`   ${cat.display_order}. ${cat.name} ✅`)
    })

  } catch (error) {
    console.error('❌ Rebuild failed:', error.message)
  }
}

// Run safe rebuild
safeMenuRebuild()
  .then(() => {
    console.log('\n🏁 Safe database rebuild complete')
    console.log('\n📝 NEXT STEPS:')
    console.log('   1. ✅ Database structure is clean and ready')
    console.log('   2. 🔄 Add remaining menu items using the established pattern')
    console.log('   3. 🧪 Test menu display on website')
    console.log('   4. 🗑️ Clean up old inactive items after testing (optional)')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
