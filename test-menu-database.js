#!/usr/bin/env node

/**
 * Menu Database Diagnostic Script
 * Tests menu database integrity and identifies corruption issues
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

async function diagnoseMenuDatabase() {
  console.log('🔍 MENU DATABASE DIAGNOSTIC')
  console.log('=' .repeat(50))

  try {
    // Test 1: Check menu categories
    console.log('\n📂 Testing menu_categories table...')
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (categoriesError) {
      console.error('❌ Categories Error:', categoriesError.message)
      return
    }

    console.log(`✅ Found ${categories.length} categories:`)
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.is_active ? 'Active' : 'Inactive'}) - Order: ${cat.display_order}`)
    })

    // Test 2: Check menu items
    console.log('\n🍽️ Testing menu_items table...')
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories (
          name
        )
      `)

    if (itemsError) {
      console.error('❌ Items Error:', itemsError.message)
      return
    }

    console.log(`✅ Found ${items.length} menu items:`)
    
    // Group items by category
    const itemsByCategory = {}
    let orphanedItems = []
    
    items.forEach(item => {
      if (item.menu_categories) {
        const categoryName = item.menu_categories.name
        if (!itemsByCategory[categoryName]) {
          itemsByCategory[categoryName] = []
        }
        itemsByCategory[categoryName].push(item)
      } else {
        orphanedItems.push(item)
      }
    })

    // Display items by category
    Object.keys(itemsByCategory).forEach(categoryName => {
      console.log(`\n   📁 ${categoryName}:`)
      itemsByCategory[categoryName].forEach(item => {
        const status = item.is_available ? '✅' : '❌'
        console.log(`      ${status} ${item.name} - R${item.price}`)
      })
    })

    // Show orphaned items
    if (orphanedItems.length > 0) {
      console.log('\n⚠️ ORPHANED ITEMS (no category):')
      orphanedItems.forEach(item => {
        console.log(`   - ${item.name} - R${item.price}`)
      })
    }

    // Test 3: Check for data integrity issues
    console.log('\n🔍 Checking data integrity...')
    
    // Check for duplicate categories
    const categoryNames = categories.map(c => c.name.toLowerCase())
    const duplicateCategories = categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index)
    
    if (duplicateCategories.length > 0) {
      console.log('⚠️ Duplicate categories found:', duplicateCategories)
    }

    // Check for items with invalid prices
    const invalidPriceItems = items.filter(item => !item.price || item.price <= 0)
    if (invalidPriceItems.length > 0) {
      console.log('⚠️ Items with invalid prices:')
      invalidPriceItems.forEach(item => {
        console.log(`   - ${item.name}: R${item.price}`)
      })
    }

    // Check for items without names
    const unnamedItems = items.filter(item => !item.name || item.name.trim() === '')
    if (unnamedItems.length > 0) {
      console.log('⚠️ Items without names:', unnamedItems.length)
    }

    // Summary
    console.log('\n📊 SUMMARY:')
    console.log(`   Categories: ${categories.length}`)
    console.log(`   Menu Items: ${items.length}`)
    console.log(`   Orphaned Items: ${orphanedItems.length}`)
    console.log(`   Duplicate Categories: ${duplicateCategories.length}`)
    console.log(`   Invalid Price Items: ${invalidPriceItems.length}`)
    console.log(`   Unnamed Items: ${unnamedItems.length}`)

    if (orphanedItems.length === 0 && duplicateCategories.length === 0 && 
        invalidPriceItems.length === 0 && unnamedItems.length === 0) {
      console.log('\n✅ Menu database appears to be healthy!')
    } else {
      console.log('\n⚠️ Issues detected - may need cleanup/rebuild')
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message)
  }
}

// Run diagnostic
diagnoseMenuDatabase()
  .then(() => {
    console.log('\n🏁 Diagnostic complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
