#!/usr/bin/env node

/**
 * Test Kitchen View Order Workflow
 * Create test orders to verify the pick-up/delivery completion flow
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testKitchenWorkflow() {
  console.log('🧪 TESTING KITCHEN VIEW WORKFLOW')
  console.log('=' .repeat(50))

  try {
    // Create a test completed order for pickup
    console.log('\n📦 Creating test pickup order...')
    const { data: pickupOrder, error: pickupError } = await supabase
      .from('orders')
      .insert({
        user_id: null,
        status: 'completed',
        payment_status: 'paid',
        total_amount: 125.50,
        order_number: `TEST-PICKUP-${Date.now()}`,
        delivery_method: 'pickup',
        special_instructions: 'Test pickup order - ready for collection'
      })
      .select()
      .single()

    if (pickupError) {
      console.error('❌ Error creating pickup order:', pickupError.message)
      return
    }

    // Create a test completed order for delivery
    console.log('🚚 Creating test delivery order...')
    const { data: deliveryOrder, error: deliveryError } = await supabase
      .from('orders')
      .insert({
        user_id: null,
        status: 'completed',
        payment_status: 'paid',
        total_amount: 89.00,
        order_number: `TEST-DELIVERY-${Date.now()}`,
        delivery_method: 'delivery',
        special_instructions: 'Test delivery order - ready for dispatch'
      })
      .select()
      .single()

    if (deliveryError) {
      console.error('❌ Error creating delivery order:', deliveryError.message)
      return
    }

    console.log(`✅ Created pickup order: ${pickupOrder.order_number}`)
    console.log(`✅ Created delivery order: ${deliveryOrder.order_number}`)

    // Add some test menu items to the orders
    console.log('\n🍕 Adding test items to orders...')
    
    const testItems = [
      {
        order_id: pickupOrder.id,
        menu_item_id: null,
        quantity: 2,
        price: 89.50,
        special_instructions: 'Extra cheese'
      },
      {
        order_id: pickupOrder.id,
        menu_item_id: null,
        quantity: 1,
        price: 36.00,
        special_instructions: null
      },
      {
        order_id: deliveryOrder.id,
        menu_item_id: null,
        quantity: 1,
        price: 89.00,
        special_instructions: 'No onions'
      }
    ]

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(testItems)

    if (itemsError) {
      console.error('❌ Error adding order items:', itemsError.message)
      return
    }

    console.log('✅ Added test items to orders')

    console.log('\n🎯 KITCHEN VIEW TEST SCENARIO:')
    console.log('1. Both orders should appear in "Completed Orders" section')
    console.log('2. Pickup order should show "📦 Mark as Picked Up" button')
    console.log('3. Delivery order should show "🚚 Mark as Delivered" button')
    console.log('4. After clicking button, order should disappear from completed section')
    console.log('\n🔗 Visit: http://localhost:3000/staff/kitchen-view')

    console.log('\n🧹 CLEANUP INSTRUCTIONS:')
    console.log(`To remove test orders later, run:`)
    console.log(`DELETE FROM order_items WHERE order_id IN ('${pickupOrder.id}', '${deliveryOrder.id}');`)
    console.log(`DELETE FROM orders WHERE id IN ('${pickupOrder.id}', '${deliveryOrder.id}');`)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testKitchenWorkflow()
  .then(() => {
    console.log('\n🏁 Kitchen workflow test setup complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
