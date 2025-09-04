#!/usr/bin/env node

/**
 * Database Schema Viewer - Using Existing Supabase Client
 * Views database schema without needing separate connection
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function viewDatabaseSchema() {
  console.log('📋 DATABASE SCHEMA VIEWER')
  console.log('=' .repeat(50))

  try {
    // Get all tables in public schema
    console.log('\n📊 Getting all tables...')
    
    const { data: tables, error } = await supabase
      .rpc('get_table_list')
      .then(result => {
        // If RPC doesn't exist, try direct query
        if (result.error) {
          return supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
        }
        return result
      })

    if (error) {
      console.log('Using menu tables directly...')
      
      // Direct approach - get menu table schemas
      const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .limit(1)
        
      const { data: items } = await supabase
        .from('menu_items')
        .select('*')
        .limit(1)

      console.log('\n📂 MENU_CATEGORIES structure:')
      if (categories && categories[0]) {
        Object.keys(categories[0]).forEach(column => {
          console.log(`   - ${column}`)
        })
      }

      console.log('\n🍽️ MENU_ITEMS structure:')
      if (items && items[0]) {
        Object.keys(items[0]).forEach(column => {
          console.log(`   - ${column}`)
        })
      }

      // Get current data counts
      const { count: categoryCount } = await supabase
        .from('menu_categories')
        .select('*', { count: 'exact', head: true })

      const { count: itemCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })

      console.log('\n📊 CURRENT DATA:')
      console.log(`   Categories: ${categoryCount}`)
      console.log(`   Menu Items: ${itemCount}`)

      console.log('\n✅ Schema access working via Supabase client!')
      console.log('🎯 Ready to receive your menu data for cleanup!')

    } else {
      console.log(`✅ Found ${tables.length} tables`)
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`)
      })
    }

  } catch (error) {
    console.error('❌ Schema viewing failed:', error.message)
  }
}

// Run schema viewer
viewDatabaseSchema()
  .then(() => {
    console.log('\n🏁 Schema viewing complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
