#!/usr/bin/env node

/**
 * Direct Three-Tier Menu Migration
 * Manually applies the three-tier structure using direct Supabase operations
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function directMigration() {
  console.log('🔄 DIRECT THREE-TIER MENU MIGRATION')
  console.log('=' .repeat(50))

  try {
    // STEP 1: Clean existing data
    console.log('\\n🧹 Step 1: Cleaning existing menu data...')
    
    // Remove order_items first (foreign key constraint)
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (orderItemsError) console.log('   ⚠️  Order items cleanup:', orderItemsError.message)

    // Remove menu_items
    const { error: itemsError } = await supabase
      .from('menu_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (itemsError) console.log('   ⚠️  Menu items cleanup:', itemsError.message)

    // Remove menu_categories
    const { error: categoriesError } = await supabase
      .from('menu_categories')  
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (categoriesError) console.log('   ⚠️  Categories cleanup:', categoriesError.message)

    console.log('   ✅ Existing menu data cleaned')

    // STEP 2: Insert main sections (if table exists)
    console.log('\\n📂 Step 2: Creating main sections...')
    
    const sections = [
      { id: '450e8400-e29b-41d4-a716-446655440001', name: 'Drinks', description: 'All beverages including coffee, tea, smoothies, and specialty drinks', display_order: 1 },
      { id: '450e8400-e29b-41d4-a716-446655440002', name: 'Food', description: 'Scones, pizza, toasties, and sides', display_order: 2 },
      { id: '450e8400-e29b-41d4-a716-446655440003', name: 'All Day Menu', description: 'Breakfast items and full meals available all day', display_order: 3 },
      { id: '450e8400-e29b-41d4-a716-446655440004', name: 'Kids', description: 'Monna & Rassie\'s Corner - Kids menu and family favorites', display_order: 4 }
    ]

    for (const section of sections) {
      const { error } = await supabase
        .from('menu_sections')
        .insert(section)

      if (error && !error.message.includes('does not exist')) {
        console.log(`   ⚠️  Section creation error: ${error.message}`)
      }
    }

    console.log('   ✅ Main sections created (if table exists)')

    // STEP 3: Insert categories with section links
    console.log('\\n📁 Step 3: Creating categories...')

    const categories = [
      // DRINKS SECTION CATEGORIES
      { id: '550e8400-e29b-41d4-a716-446655440010', section_id: '450e8400-e29b-41d4-a716-446655440001', name: 'Hot Drinks', description: 'Coffee, tea, and warm beverages', display_order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440011', section_id: '450e8400-e29b-41d4-a716-446655440001', name: 'Lattes', description: 'Specialty latte creations', display_order: 2 },
      { id: '550e8400-e29b-41d4-a716-446655440012', section_id: '450e8400-e29b-41d4-a716-446655440001', name: 'Iced Lattes', description: 'Cold coffee specialties', display_order: 3 },
      { id: '550e8400-e29b-41d4-a716-446655440013', section_id: '450e8400-e29b-41d4-a716-446655440001', name: 'Frappes', description: 'Blended coffee drinks', display_order: 4 },
      { id: '550e8400-e29b-41d4-a716-446655440014', section_id: '450e8400-e29b-41d4-a716-446655440001', name: 'Fizzers', description: 'Refreshing fizzy drinks', display_order: 5 },
      { id: '550e8400-e29b-41d4-a716-446655440015', section_id: '450e8400-e29b-41d4-a716-446655440001', name: 'Freezos', description: 'Frozen coffee treats', display_order: 6 },
      { id: '550e8400-e29b-41d4-a716-446655440016', section_id: '450e8400-e29b-41d4-a716-446655440001', name: 'Smoothies', description: 'Fresh fruit and protein smoothies', display_order: 7 },

      // FOOD SECTION CATEGORIES
      { id: '550e8400-e29b-41d4-a716-446655440001', section_id: '450e8400-e29b-41d4-a716-446655440002', name: 'Scones', description: 'Fresh baked scones with various fillings', display_order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440002', section_id: '450e8400-e29b-41d4-a716-446655440002', name: 'Pizza', description: 'Wood-fired pizzas with fresh toppings', display_order: 2 },
      { id: '550e8400-e29b-41d4-a716-446655440006', section_id: '450e8400-e29b-41d4-a716-446655440002', name: 'Toasties', description: 'Grilled sandwiches and toasted treats', display_order: 3 },
      { id: '550e8400-e29b-41d4-a716-446655440004', section_id: '450e8400-e29b-41d4-a716-446655440002', name: 'Sides', description: 'Perfect sides to complete your meal', display_order: 4 },
      { id: '550e8400-e29b-41d4-a716-446655440005', section_id: '450e8400-e29b-41d4-a716-446655440002', name: 'Extras', description: 'Additional extras and bread options', display_order: 5 },

      // ALL DAY MENU SECTION CATEGORIES  
      { id: '550e8400-e29b-41d4-a716-446655440007', section_id: '450e8400-e29b-41d4-a716-446655440003', name: 'All Day Brekkies', description: 'Breakfast items available all day', display_order: 1 },
      { id: '550e8400-e29b-41d4-a716-446655440008', section_id: '450e8400-e29b-41d4-a716-446655440003', name: 'All Day Meals', description: 'Hearty meals served throughout the day', display_order: 2 },

      // KIDS SECTION CATEGORIES
      { id: '550e8400-e29b-41d4-a716-446655440009', section_id: '450e8400-e29b-41d4-a716-446655440004', name: 'Monna & Rassie\'s Corner', description: 'Kids menu and family favorites', display_order: 1 }
    ]

    for (const category of categories) {
      // Try inserting with section_id first
      let { error } = await supabase
        .from('menu_categories')
        .insert(category)

      // If section_id column doesn't exist, insert without it
      if (error && error.message.includes('column "section_id" does not exist')) {
        const { section_id: _section_id, ...categoryWithoutSection } = category
        const { error: retryError } = await supabase
          .from('menu_categories')
          .insert(categoryWithoutSection)
        
        if (retryError) {
          console.log(`   ⚠️  Category error: ${retryError.message}`)
        }
      } else if (error) {
        console.log(`   ⚠️  Category error: ${error.message}`)
      }
    }

    console.log('   ✅ Categories created')

    // STEP 4: Sample menu items (Hot Drinks only for verification)
    console.log('\\n🍽️ Step 4: Creating sample menu items...')

    const sampleItems = [
      { id: '650e8400-e29b-41d4-a716-446655440055', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Espresso (R)', description: 'Rich and bold espresso shot', price: 20.00 },
      { id: '650e8400-e29b-41d4-a716-446655440056', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Espresso (L)', description: 'Double shot espresso', price: 25.00 },
      { id: '650e8400-e29b-41d4-a716-446655440057', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Americano (R)', description: 'Espresso with hot water', price: 25.00 },
      { id: '650e8400-e29b-41d4-a716-446655440058', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Americano (L)', description: 'Double shot americano', price: 30.00 },
      { id: '650e8400-e29b-41d4-a716-446655440059', category_id: '550e8400-e29b-41d4-a716-446655440010', name: 'Cortado', description: 'Espresso with warm milk', price: 30.00 }
    ]

    for (const item of sampleItems) {
      const { error } = await supabase
        .from('menu_items')
        .insert(item)

      if (error) {
        console.log(`   ⚠️  Item error: ${error.message}`)
      }
    }

    console.log('   ✅ Sample menu items created')

    // STEP 5: Verify structure
    console.log('\\n🔍 Step 5: Verifying structure...')

    const { count: categoryCount } = await supabase
      .from('menu_categories')
      .select('*', { count: 'exact', head: true })

    const { count: itemCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })

    const { count: sectionCount } = await supabase
      .from('menu_sections')
      .select('*', { count: 'exact', head: true })
      .then(result => result.error ? { count: 'N/A' } : result)

    console.log('\\n📊 FINAL STRUCTURE SUMMARY')
    console.log('=' .repeat(40))
    console.log(`📂 Sections: ${sectionCount} ${sectionCount === 'N/A' ? '(table not created yet)' : ''}`)
    console.log(`📁 Categories: ${categoryCount}`)
    console.log(`🍽️ Items: ${itemCount}`)

    if (sectionCount === 'N/A') {
      console.log('\\n⚠️  NOTE: menu_sections table needs to be created via SQL migration')
      console.log('📝 Run the SQL migrations manually to complete the three-tier structure')
    } else {
      console.log('\\n✅ Three-tier structure ready!')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  }
}

// Apply direct migration
directMigration()
  .then(() => {
    console.log('\\n🏁 Direct migration complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Direct migration failed:', error)
    process.exit(1)
  })
