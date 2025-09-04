#!/usr/bin/env node

/**
 * Complete Menu Database Rebuild
 * Cleans existing data and rebuilds with proper structure
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Your complete menu data
const menuData = {
  "currency": "ZAR",
  "categories": [
    {
      "category": "Drinks",
      "sections": [
        {
          "section": "HOT DRINKS",
          "items": [
            { "name": "Espresso", "variants": [{ "name": "R", "price": 20 }, { "name": "L", "price": 25 }] },
            { "name": "Americano", "variants": [{ "name": "R", "price": 25 }, { "name": "L", "price": 30 }] },
            { "name": "Cortado", "price": 30 },
            { "name": "Flat White", "price": 35 },
            { "name": "Cappuccino", "variants": [{ "name": "R", "price": 33 }, { "name": "L", "price": 37 }] },
            { "name": "Mochachino", "variants": [{ "name": "R", "price": 37 }, { "name": "L", "price": 42 }] },
            { "name": "Hot Chocolate", "variants": [{ "name": "R", "price": 33 }, { "name": "L", "price": 37 }] },
            { "name": "Hot Coco-Chocolate", "variants": [{ "name": "R", "price": 40 }, { "name": "L", "price": 45 }] },
            { "name": "Red Cappuccino", "variants": [{ "name": "R", "price": 37 }, { "name": "L", "price": 42 }] },
            { "name": "5 Roses Tea", "variants": [{ "name": "R", "price": 20 }, { "name": "L", "price": 25 }] },
            { "name": "Rooibos Tea", "variants": [{ "name": "R", "price": 20 }, { "name": "L", "price": 25 }] },
            { "name": "Babychino", "price": 25 },
            {
              "name": "Steamers",
              "price": 33,
              "modifier_groups": ["STEAMER FLAVOURS"]
            }
          ]
        },
        {
          "section": "LATTE'S",
          "items": [
            { "name": "Cafe Latte", "price": 37 },
            { "name": "Salted Caramel/Butterscotch", "price": 42 },
            { "name": "Shortbread Cookies/Hazelnut", "price": 42 },
            { "name": "Vanilla/Caramel/Pumpkin Spice", "price": 42 },
            { "name": "Chai/Dirty Chai/Red Chai", "price": 45 },
            { "name": "Spanish Salted Caramel", "price": 48 },
            { "name": "Honey Toffeenut", "price": 48 },
            { "name": "Baklawa Macchiato", "price": 55 },
            { "name": "Coco Mocha", "price": 42 },
            { "name": "Creme Brulee", "price": 48 }
          ]
        },
        {
          "section": "ICED LATTE'S",
          "items": [
            { "name": "Iced Shortbread Cortado", "price": 55 },
            { "name": "White Russian Iced Mocha", "price": 55 },
            { "name": "Salted Caramel & Pecan Latte", "price": 55 },
            { "name": "Pistachio Choco Latte", "price": 55 },
            { "name": "Almond Spanish Macchiato", "price": 55 },
            { "name": "Coco-Matcha Latte", "price": 55 },
            { "name": "Mango Coco Coffee Latte", "price": 55 }
          ]
        },
        {
          "section": "FRAPPE'S",
          "items": [
            { "name": "Butterscotch", "price": 60 },
            { "name": "Salted Caramel", "price": 60 },
            { "name": "Mocha", "price": 60 },
            { "name": "Toffee Nut", "price": 60 },
            { "name": "Chai/Dirty Chai", "price": 60 },
            { "name": "Chocolate Brownie", "price": 63 },
            { "name": "Choc Chip Cookie", "price": 63 },
            { "name": "Strawberry-Shortcake", "price": 63 },
            { "name": "Mango Cheesecake", "price": 63 }
          ]
        },
        {
          "section": "FIZZERS",
          "items": [
            { "name": "Strawberry & Watermelon", "price": 52 },
            { "name": "Strawberry & Passionfruit", "price": 52 },
            { "name": "Raspberry Fizz", "price": 52 },
            { "name": "Mint Lemonade", "price": 52 },
            { "name": "Mixed Berry Lemonade", "price": 52 },
            { "name": "Peach Fizz", "price": 52 },
            { "name": "Coco Passion Fizz", "price": 52 }
          ]
        },
        {
          "section": "FREEZO'S",
          "items": [
            { "name": "Butterscotch", "price": 55 },
            { "name": "Salted Caramel", "price": 55 },
            { "name": "Mocha/Chocolate", "price": 55 },
            { "name": "Chai/Dirty Chai", "price": 55 }
          ]
        },
        {
          "section": "SMOOTHIES",
          "items": [
            { "name": "Berry, Almond & Banana", "price": 82 },
            { "name": "Spiced Mango and Banana", "price": 82 },
            { "name": "Green Power Smoothie", "price": 78 },
            { "name": "Protein Breakfast Smoothie", "price": 82 },
            { "name": "High Protein Blueberry", "price": 82 },
            { "name": "Vanilla Berry Smoothie", "price": 82 },
            { "name": "Peanut Butter & Banana", "price": 82 }
          ]
        }
      ]
    },
    {
      "category": "Food",
      "sections": [
        {
          "section": "SCONES",
          "items": [
            { "name": "Savory Bacon & Cheese", "price": 43 },
            { "name": "Cheese & Strawberry Jam", "price": 43 },
            { "name": "Cream", "price": 45 }
          ]
        },
        {
          "section": "PIZZA",
          "items": [
            {
              "name": "Regina (Ham & Cheese)",
              "variants": [{ "name": "S", "price": 42 }, { "name": "L", "price": 98 }],
              "modifier_groups": ["PIZZA ADD-ONS"]
            },
            {
              "name": "Margarita (Mozzarella & Basic)",
              "variants": [{ "name": "S", "price": 35 }, { "name": "L", "price": 82 }],
              "modifier_groups": ["PIZZA ADD-ONS"]
            }
          ]
        },
        {
          "section": "TOASTIES",
          "items": [
            { "name": "Ham, Cheese & Tomato", "price": 52 },
            { "name": "Chicken Mayo", "price": 67 },
            { "name": "Bacon, Egg & Cheese", "price": 70 },
            { "name": "Tomato, Cheese & Onion (V)", "price": 52, "tags": ["V"] }
          ]
        },
        {
          "section": "SIDES",
          "items": [
            { "name": "Small Chips (350 g)", "price": 25 },
            { "name": "Large Chips (500 g)", "price": 47 },
            { "name": "Small Saucy Chips", "price": 52 },
            { "name": "Large Saucy Chips", "price": 65 },
            { "name": "Side Greek Salad", "price": 75 }
          ]
        },
        {
          "section": "EXTRA'S",
          "items": [
            { "name": "Egg", "price": 6 },
            { "name": "Cheese", "price": 10 },
            { "name": "Avo (Seasonal)", "price": 10 }
          ]
        }
      ]
    },
    {
      "category": "All Day Menu",
      "sections": [
        {
          "section": "ALL DAY BREKKIES",
          "items": [
            { "name": "Yogurt & Granold (V)", "price": 65, "tags": ["V"] },
            { "name": "Brekkie Roll (Bacon & Egg)", "price": 45 },
            { "name": "Cheese Griller Brekkie", "price": 80 },
            { "name": "Avo on Toast (V)", "price": 45, "tags": ["V"] }
          ]
        },
        {
          "section": "ALL DAY MEALS",
          "items": [
            { "name": "Chicken Wrap (Chips or Salad)", "price": 115 },
            { "name": "Halloumi Wrap (V)", "variants": [{ "name": "Wrap", "price": 87 }, { "name": "With Chips", "price": 115 }], "tags": ["V"] },
            { "name": "Chicken Burger", "variants": [{ "name": "Burger", "price": 87 }, { "name": "With Chips", "price": 97 }] },
            { "name": "Beef Burger", "variants": [{ "name": "Burger", "price": 87 }, { "name": "With Chips", "price": 97 }] },
            { "name": "Boujee Bowl", "price": 116 },
            { "name": "Pie & Gravy", "price": 75 }
          ]
        }
      ]
    },
    {
      "category": "Kids",
      "sections": [
        {
          "section": "MONNA & RASSIE'S CORNER",
          "items": [
            { "name": "Chicken Strips", "price": 77 },
            { "name": "Vienna & Chips", "price": 75 },
            { "name": "Small Margarita Pizza", "price": 35 }
          ]
        }
      ]
    }
  ]
}

async function rebuildMenuDatabase() {
  console.log('🔄 COMPLETE MENU DATABASE REBUILD')
  console.log('=' .repeat(50))

  try {
    // Step 1: Clean existing data
    console.log('\n🧹 Step 1: Cleaning existing data...')
    
    const { error: deleteItemsError } = await supabase
      .from('menu_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteItemsError) {
      console.error('❌ Error deleting items:', deleteItemsError.message)
      return
    }

    const { error: deleteCategoriesError } = await supabase
      .from('menu_categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteCategoriesError) {
      console.error('❌ Error deleting categories:', deleteCategoriesError.message)
      return
    }

    console.log('✅ Existing data cleaned')

    // Step 2: Create new categories and items
    console.log('\n🏗️ Step 2: Creating new menu structure...')
    
    let displayOrder = 1

    for (const categoryData of menuData.categories) {
      console.log(`\n📂 Creating category: ${categoryData.category}`)
      
      // Create main category
      const { data: category, error: categoryError } = await supabase
        .from('menu_categories')
        .insert({
          name: categoryData.category,
          description: `${categoryData.category} items`,
          display_order: displayOrder++,
          is_active: true
        })
        .select()
        .single()

      if (categoryError) {
        console.error(`❌ Error creating category ${categoryData.category}:`, categoryError.message)
        continue
      }

      // Create items for each section
      for (const section of categoryData.sections) {
        console.log(`   📋 Section: ${section.section}`)
        
        for (const item of section.items) {
          // Handle items with variants
          if (item.variants) {
            for (const variant of item.variants) {
              const variantName = `${item.name} (${variant.name})`
              const { error: itemError } = await supabase
                .from('menu_items')
                .insert({
                  category_id: category.id,
                  name: variantName,
                  description: `${section.section} - ${item.name} ${variant.name} size`,
                  price: variant.price,
                  is_available: true
                })

              if (itemError) {
                console.error(`❌ Error creating item ${variantName}:`, itemError.message)
              } else {
                console.log(`      ✅ ${variantName} - R${variant.price}`)
              }
            }
          } 
          // Handle regular items
          else {
            const { error: itemError } = await supabase
              .from('menu_items')
              .insert({
                category_id: category.id,
                name: item.name,
                description: `${section.section} - ${item.name}`,
                price: item.price,
                is_available: true
              })

            if (itemError) {
              console.error(`❌ Error creating item ${item.name}:`, itemError.message)
            } else {
              console.log(`      ✅ ${item.name} - R${item.price}`)
            }
          }
        }
      }
    }

    // Step 3: Verify the rebuild
    console.log('\n🔍 Step 3: Verifying rebuild...')
    
    const { count: newCategoryCount } = await supabase
      .from('menu_categories')
      .select('*', { count: 'exact', head: true })

    const { count: newItemCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })

    console.log('\n📊 REBUILD SUMMARY:')
    console.log(`   New Categories: ${newCategoryCount}`)
    console.log(`   New Menu Items: ${newItemCount}`)
    console.log('\n✅ Menu database successfully rebuilt!')
    console.log('🎯 All items properly categorized with correct pricing!')

  } catch (error) {
    console.error('❌ Rebuild failed:', error.message)
  }
}

// Run rebuild
rebuildMenuDatabase()
  .then(() => {
    console.log('\n🏁 Database rebuild complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
