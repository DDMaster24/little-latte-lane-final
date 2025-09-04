#!/usr/bin/env node

/**
 * Order Status Investigation
 * Check what order statuses exist and should be available
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function investigateOrderStatuses() {
  console.log('🔍 ORDER STATUS INVESTIGATION')
  console.log('=' .repeat(50))

  try {
    // Get all unique order statuses currently in use
    console.log('\n📊 Current order statuses in database...')
    const { data: statusData, error: statusError } = await supabase
      .from('orders')
      .select('status')
      .not('status', 'is', null)

    if (statusError) {
      console.error('❌ Error fetching statuses:', statusError.message)
      return
    }

    const uniqueStatuses = [...new Set(statusData.map(item => item.status))].sort()
    console.log('✅ Found statuses:', uniqueStatuses)

    // Get orders by status
    console.log('\n📈 Orders by status:')
    for (const status of uniqueStatuses) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', status)
      
      console.log(`   ${status}: ${count} orders`)
    }

    // Check specific "completed" orders to see the issue
    console.log('\n🍽️ Investigating completed orders...')
    const { data: completedOrders, error: completedError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        created_at,
        updated_at,
        delivery_method
      `)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(5)

    if (completedError) {
      console.error('❌ Error fetching completed orders:', completedError.message)
      return
    }

    console.log(`📋 Latest ${completedOrders.length} completed orders:`)
    completedOrders.forEach(order => {
      const completedTime = new Date(order.updated_at || order.created_at)
      const now = new Date()
      const minutesAgo = Math.round((now.getTime() - completedTime.getTime()) / (1000 * 60))
      
      console.log(`   Order ${order.order_number}: completed ${minutesAgo} minutes ago`)
    })

    console.log('\n🎯 KITCHEN VIEW ISSUE ANALYSIS:')
    console.log('   - Orders get marked as "completed" when kitchen finishes')
    console.log('   - But they stay in completed section forever')
    console.log('   - No status for "collected" or "delivered"')
    console.log('   - Completed section gets cluttered with old orders')

    console.log('\n💡 RECOMMENDED SOLUTION:')
    console.log('   1. Add "collected" status for pickup orders')
    console.log('   2. Add "delivered" status for delivery orders')  
    console.log('   3. Add collection buttons in kitchen view')
    console.log('   4. Auto-hide orders after collection/delivery')

  } catch (error) {
    console.error('❌ Investigation failed:', error.message)
  }
}

investigateOrderStatuses()
  .then(() => {
    console.log('\n🏁 Investigation complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
