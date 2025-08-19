const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addTestItem() {
  console.log('🧪 Adding test item to menu...\n')

  try {
    // First, let's check what categories exist
    console.log('📂 Checking existing categories...')
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError)
      return
    }

    console.log('📋 Available categories:')
    categories.forEach(cat => {
      console.log(`   • ${cat.name} (ID: ${cat.id})`)
    })

    let testCategoryId = null
    
    // Look for a general category or create one
    const generalCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('test') || 
      cat.name.toLowerCase().includes('burger') ||
      cat.name.toLowerCase().includes('main') ||
      cat.name.toLowerCase().includes('food')
    )

    if (generalCategory) {
      testCategoryId = generalCategory.id
      console.log(`✅ Using existing category: ${generalCategory.name}`)
    } else if (categories.length > 0) {
      // Use the first available category
      testCategoryId = categories[0].id
      console.log(`✅ Using first available category: ${categories[0].name}`)
    } else {
      // Create a test category
      console.log('📁 Creating test category...')
      const { data: newCategory, error: categoryError } = await supabase
        .from('menu_categories')
        .insert({
          name: 'Test Items',
          description: 'Test items for payment testing',
          display_order: 999,
          is_active: true
        })
        .select()
        .single()

      if (categoryError) {
        console.error('❌ Error creating category:', categoryError)
        return
      }

      testCategoryId = newCategory.id
      console.log(`✅ Created test category: ${newCategory.name}`)
    }

    // Now add the test burger
    console.log('🍔 Adding Test Burger...')
    const { data: testItem, error: itemError } = await supabase
      .from('menu_items')
      .insert({
        category_id: testCategoryId,
        name: 'Test Burger',
        description: 'A simple test burger for payment testing - R1 only!',
        price: 1.00,
        is_available: true,
        image_url: null // We'll use a placeholder
      })
      .select()
      .single()

    if (itemError) {
      console.error('❌ Error creating test item:', itemError)
      return
    }

    console.log('✅ Test Burger created successfully!')
    console.log('📝 Item details:')
    console.log(`   • ID: ${testItem.id}`)
    console.log(`   • Name: ${testItem.name}`)
    console.log(`   • Price: R${testItem.price}`)
    console.log(`   • Description: ${testItem.description}`)
    console.log(`   • Category ID: ${testItem.category_id}`)

    console.log('\n🎯 Test item ready!')
    console.log('📱 You can now:')
    console.log('   1. Go to the menu page')
    console.log('   2. Find the "Test Burger" for R1')
    console.log('   3. Add it to cart and checkout')
    console.log('   4. Test the PayFast payment flow')
    console.log('   5. Verify the payment webhook works')

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

addTestItem()
