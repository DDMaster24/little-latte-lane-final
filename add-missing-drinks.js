#!/usr/bin/env node

/**
 * Add Missing Drinks Categories
 * Adds Fizzers, Freezos, and Smoothies to complete the drinks menu
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addMissingDrinks() {
  console.log('🥤 ADDING MISSING DRINKS CATEGORIES')
  console.log('=' .repeat(50))

  try {
    // Add Fizzers
    console.log('\\n💫 Adding Fizzers...')
    const fizzers = [
      { id: '650e8400-e29b-41d4-a716-446655440111', category_id: '550e8400-e29b-41d4-a716-446655440014', name: 'Strawberry & Watermelon', price: 52.00 },
      { id: '650e8400-e29b-41d4-a716-446655440112', category_id: '550e8400-e29b-41d4-a716-446655440014', name: 'Strawberry & Passionfruit', price: 52.00 },
      { id: '650e8400-e29b-41d4-a716-446655440113', category_id: '550e8400-e29b-41d4-a716-446655440014', name: 'Raspberry Fizz', price: 52.00 },
      { id: '650e8400-e29b-41d4-a716-446655440114', category_id: '550e8400-e29b-41d4-a716-446655440014', name: 'Mint Lemonade', price: 52.00 },
      { id: '650e8400-e29b-41d4-a716-446655440115', category_id: '550e8400-e29b-41d4-a716-446655440014', name: 'Mixed Berry Lemonade', price: 52.00 },
      { id: '650e8400-e29b-41d4-a716-446655440116', category_id: '550e8400-e29b-41d4-a716-446655440014', name: 'Peach Fizz', price: 52.00 },
      { id: '650e8400-e29b-41d4-a716-446655440117', category_id: '550e8400-e29b-41d4-a716-446655440014', name: 'Coco Passion Fizz', price: 52.00 }
    ]

    await insertItems(fizzers, 'Fizzers')

    // Add Freezos
    console.log('\\n🧊 Adding Freezos...')
    const freezos = [
      { id: '650e8400-e29b-41d4-a716-446655440118', category_id: '550e8400-e29b-41d4-a716-446655440015', name: 'Butterscotch Freezo', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440119', category_id: '550e8400-e29b-41d4-a716-446655440015', name: 'Salted Caramel Freezo', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440120', category_id: '550e8400-e29b-41d4-a716-446655440015', name: 'Mocha Freezo', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440121', category_id: '550e8400-e29b-41d4-a716-446655440015', name: 'Chocolate Freezo', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440122', category_id: '550e8400-e29b-41d4-a716-446655440015', name: 'Chai Freezo', price: 55.00 },
      { id: '650e8400-e29b-41d4-a716-446655440123', category_id: '550e8400-e29b-41d4-a716-446655440015', name: 'Dirty Chai Freezo', price: 55.00 }
    ]

    await insertItems(freezos, 'Freezos')

    // Add Smoothies
    console.log('\\n🥤 Adding Smoothies...')
    const smoothies = [
      { id: '650e8400-e29b-41d4-a716-446655440124', category_id: '550e8400-e29b-41d4-a716-446655440016', name: 'Berry, Almond & Banana', price: 82.00 },
      { id: '650e8400-e29b-41d4-a716-446655440125', category_id: '550e8400-e29b-41d4-a716-446655440016', name: 'Spiced Mango & Banana', price: 82.00 },
      { id: '650e8400-e29b-41d4-a716-446655440126', category_id: '550e8400-e29b-41d4-a716-446655440016', name: 'Green Power Smoothie', price: 78.00 },
      { id: '650e8400-e29b-41d4-a716-446655440127', category_id: '550e8400-e29b-41d4-a716-446655440016', name: 'Protein Breakfast Smoothie', price: 82.00 },
      { id: '650e8400-e29b-41d4-a716-446655440128', category_id: '550e8400-e29b-41d4-a716-446655440016', name: 'High Protein Blueberry', price: 82.00 },
      { id: '650e8400-e29b-41d4-a716-446655440129', category_id: '550e8400-e29b-41d4-a716-446655440016', name: 'Vanilla Berry Smoothie', price: 78.00 },
      { id: '650e8400-e29b-41d4-a716-446655440130', category_id: '550e8400-e29b-41d4-a716-446655440016', name: 'Peanut Butter & Banana', price: 82.00 }
    ]

    await insertItems(smoothies, 'Smoothies')

    // Final count
    console.log('\\n🔍 Final verification...')
    const { count: totalItems } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })

    console.log('\\n📊 COMPLETE MENU FINAL COUNT')
    console.log('=' .repeat(40))
    console.log(`🍽️ Total Menu Items: ${totalItems}`)
    console.log('\\n✅ ALL MENU CATEGORIES COMPLETE!')
    console.log('🎯 Ready for three-tier menu structure testing!')

  } catch (error) {
    console.error('❌ Adding missing drinks failed:', error.message)
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

// Execute missing drinks addition
addMissingDrinks()
  .then(() => {
    console.log('\\n🏁 Missing drinks addition complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Failed to add missing drinks:', error)
    process.exit(1)
  })
