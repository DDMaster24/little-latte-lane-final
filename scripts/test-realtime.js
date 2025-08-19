const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '../.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRealtimeData() {
  console.log('🧪 Testing real-time staff panel data...\n')

  try {
    // Test 1: Create a test order
    console.log('📝 Creating test order...')
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: 'e6b8d3f2-8c4b-4d9e-a2c7-1f3b5e7d9c2a', // admin user
        status: 'pending',
        total_amount: 89.99,
        special_instructions: 'Test order for real-time updates',
        order_number: 'RT-' + Date.now(),
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      return
    }

    console.log('✅ Test order created:', order.id)

    // Test 2: Create order items
    console.log('🍕 Adding order items...')
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert([
        {
          order_id: order.id,
          menu_item_id: '1e7b4f2c-3d8a-9c6e-b5f1-8e2d4c7a9b3f', // Pizza item
          quantity: 2,
          price: 45.00,
          special_instructions: 'Extra cheese'
        },
        {
          order_id: order.id,
          menu_item_id: '2f8c5e3d-4e9b-a7d2-c6g2-9f3e5d8b4c6g', // Drink item
          quantity: 1,
          price: 25.00,
          special_instructions: null
        }
      ])

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError)
    } else {
      console.log('✅ Order items created')
    }

    // Test 3: Create a test booking
    console.log('📅 Creating test booking...')
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: 'e6b8d3f2-8c4b-4d9e-a2c7-1f3b5e7d9c2a', // admin user
        name: 'Real-time Test Booking',
        email: 'test@example.com',
        phone: '+27123456789',
        booking_date: new Date().toISOString().split('T')[0],
        booking_time: '18:00',
        party_size: 4,
        status: 'pending',
        special_requests: 'Test booking for real-time updates'
      })
      .select()
      .single()

    if (bookingError) {
      console.error('❌ Error creating booking:', bookingError)
    } else {
      console.log('✅ Test booking created:', booking.id)
    }

    console.log('\n🎯 Real-time test data created!')
    console.log('📱 Check your staff panel now - you should see:')
    console.log('   • New order with "pending" status')
    console.log('   • Real-time connection indicator should show green')
    console.log('   • Order count should update automatically')
    console.log('   • Last update timestamp should show recent time')

    console.log('\n⏳ Waiting 3 seconds then updating order status...')
    
    setTimeout(async () => {
      // Test 4: Update order status to trigger real-time update
      console.log('🔄 Updating order status to "confirmed"...')
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', order.id)

      if (updateError) {
        console.error('❌ Error updating order:', updateError)
      } else {
        console.log('✅ Order status updated - check staff panel for real-time update!')
      }

      console.log('\n🧹 Cleaning up test data in 10 seconds...')
      
      setTimeout(async () => {
        // Cleanup
        await supabase.from('order_items').delete().eq('order_id', order.id)
        await supabase.from('orders').delete().eq('id', order.id)
        if (booking) {
          await supabase.from('bookings').delete().eq('id', booking.id)
        }
        console.log('🗑️ Test data cleaned up')
        process.exit(0)
      }, 10000)

    }, 3000)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

testRealtimeData()
