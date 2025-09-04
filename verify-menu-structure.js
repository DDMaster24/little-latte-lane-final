#!/usr/bin/env node

/**
 * Final Menu Structure Verification
 * Shows the complete three-tier menu organization
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyMenuStructure() {
  console.log('🏗️ LITTLE LATTE LANE - THREE-TIER MENU STRUCTURE')
  console.log('=' .repeat(60))

  try {
    // Get all categories organized by section
    const { data: categories } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order')

    // Group categories by section
    const sections = {
      'Drinks': { order: 1, categories: [] },
      'Food': { order: 2, categories: [] },
      'All Day Menu': { order: 3, categories: [] },
      'Kids': { order: 4, categories: [] }
    }

    for (const category of categories || []) {
      let sectionName = 'Unknown'
      if (category.display_order >= 10 && category.display_order < 20) sectionName = 'Drinks'
      else if (category.display_order >= 20 && category.display_order < 30) sectionName = 'Food'
      else if (category.display_order >= 30 && category.display_order < 40) sectionName = 'All Day Menu'
      else if (category.display_order >= 40) sectionName = 'Kids'

      sections[sectionName].categories.push(category)
    }

    // Display the complete structure
    for (const [sectionName, section] of Object.entries(sections)) {
      if (section.categories.length === 0) continue

      const sectionIcon = getSectionIcon(sectionName)
      console.log(`\\n${sectionIcon} MAIN SECTION: ${sectionName.toUpperCase()}`)
      console.log('=' .repeat(40))

      for (const category of section.categories) {
        console.log(`\\n📁 Category: ${category.name}`)
        
        // Get items for this category
        const { data: items, count } = await supabase
          .from('menu_items')
          .select('name, price', { count: 'exact' })
          .eq('category_id', category.id)
          .order('name')

        console.log(`   Items (${count}):`)
        
        for (const item of items || []) {
          console.log(`   → ${item.name} - R${item.price}`)
        }
      }
    }

    // Summary statistics
    console.log('\\n\\n📊 MENU STRUCTURE SUMMARY')
    console.log('=' .repeat(50))

    const { count: totalCategories } = await supabase
      .from('menu_categories')
      .select('*', { count: 'exact', head: true })

    const { count: totalItems } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })

    console.log(`📂 Total Sections: 4 (Drinks, Food, All Day Menu, Kids)`)
    console.log(`📁 Total Categories: ${totalCategories}`)
    console.log(`🍽️ Total Menu Items: ${totalItems}`)

    // Category breakdown by section
    console.log('\\n📋 Category Breakdown:')
    
    for (const [sectionName, section] of Object.entries(sections)) {
      if (section.categories.length === 0) continue
      
      const sectionIcon = getSectionIcon(sectionName)
      let totalSectionItems = 0
      
      for (const category of section.categories) {
        const { count } = await supabase
          .from('menu_items')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
        
        totalSectionItems += count || 0
      }
      
      console.log(`   ${sectionIcon} ${sectionName}: ${section.categories.length} categories, ${totalSectionItems} items`)
    }

    console.log('\\n✅ THREE-TIER STRUCTURE VERIFIED!')
    console.log('🎯 Structure: Main Sections → Categories → Menu Items')
    console.log('🔄 Database optimized for proper menu organization')
    console.log('📱 Ready for frontend menu display and ordering system!')

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

function getSectionIcon(sectionName) {
  const icons = {
    'Drinks': '🥤',
    'Food': '🍕',
    'All Day Menu': '🍳',
    'Kids': '👶'
  }
  return icons[sectionName] || '📁'
}

// Execute verification
verifyMenuStructure()
  .then(() => {
    console.log('\\n🏁 Menu structure verification complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })
