#!/usr/bin/env node

/**
 * Direct Database Connection Test
 * Tests the direct PostgreSQL connection without Docker/extensions
 */

import sql from './db.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testDirectConnection() {
  console.log('🔗 TESTING DIRECT DATABASE CONNECTION')
  console.log('=' .repeat(50))

  try {
    // Test basic connection
    console.log('\n📡 Testing connection...')
    const result = await sql`SELECT version();`
    console.log('✅ Database connected successfully!')
    console.log('📊 PostgreSQL Version:', result[0].version.split(' ').slice(0, 2).join(' '))

    // Test table access
    console.log('\n📋 Testing table access...')
    
    // List all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
    
    console.log(`✅ Found ${tables.length} tables:`)
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`)
    })

    // Test menu tables specifically
    console.log('\n🍽️ Testing menu tables...')
    
    const categories = await sql`
      SELECT COUNT(*) as count 
      FROM menu_categories;
    `
    
    const items = await sql`
      SELECT COUNT(*) as count 
      FROM menu_items;
    `

    console.log(`📂 Menu Categories: ${categories[0].count}`)
    console.log(`🍽️ Menu Items: ${items[0].count}`)

    console.log('\n✅ Direct database connection working perfectly!')
    console.log('🎯 Ready for database operations without Docker/extensions')

  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

// Run test
testDirectConnection()
  .then(() => {
    console.log('\n🏁 Connection test complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
