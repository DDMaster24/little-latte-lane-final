const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateTestBurgerPrice() {
  console.log('💰 Updating Test Burger price to R15...\n')

  try {
    // Update the Test Burger price
    const { data, error } = await supabase
      .from('menu_items')
      .update({ 
        price: 15.00,
        description: 'A test burger for payment testing - R15 (PayFast minimum)'
      })
      .eq('name', 'Test Burger')
      .select()

    if (error) {
      console.error('❌ Error updating test burger:', error)
      return
    }

    if (!data || data.length === 0) {
      console.error('❌ Test Burger not found')
      return
    }

    console.log('✅ Test Burger updated successfully!')
    console.log('📝 Updated details:')
    data.forEach(item => {
      console.log(`   • ID: ${item.id}`)
      console.log(`   • Name: ${item.name}`)
      console.log(`   • Price: R${item.price}`)
      console.log(`   • Description: ${item.description}`)
    })

    console.log('\n🎯 Test Burger now ready for R15 payment!')
    console.log('💳 This should work better with PayFast minimum requirements')

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

updateTestBurgerPrice()
