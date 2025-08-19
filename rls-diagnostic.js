const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

console.log('🔍 COMPREHENSIVE RLS POLICY DIAGNOSTIC')
console.log('=====================================')
console.log('URL:', supabaseUrl)
console.log('Service Key exists:', !!supabaseServiceKey)
console.log('')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function diagnosticCheck() {
  try {
    // 1. Check profiles table structure
    console.log('📊 1. PROFILES TABLE STRUCTURE')
    console.log('-------------------------------')
    
    const { data: columns, error: colError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' })
      .single()

    if (colError) {
      console.log('❌ Custom function not available, using direct query...')
      
      // Try raw SQL approach
      const { data: rawColumns, error: rawError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (rawError) {
        console.error('❌ Cannot access profiles table:', rawError)
      } else {
        console.log('✅ Profiles table accessible')
        if (rawColumns && rawColumns[0]) {
          console.log('📋 Table columns (from sample row):')
          Object.keys(rawColumns[0]).forEach(col => {
            console.log(`  - ${col}: ${typeof rawColumns[0][col]} (${rawColumns[0][col] === null ? 'NULL' : 'has value'})`)
          })
        }
      }
    }

    // 2. Check if RLS is enabled
    console.log('\n🔒 2. RLS STATUS CHECK')
    console.log('----------------------')
    
    // Try to query system tables using service role
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'profiles' })
    
    if (rlsError) {
      console.log('❌ Cannot check RLS status directly:', rlsError.message)
      console.log('ℹ️  This is expected - we need to check via SQL editor or Supabase dashboard')
    }

    // 3. Test profile operations with service role
    console.log('\n🧪 3. SERVICE ROLE PERMISSIONS TEST')
    console.log('-----------------------------------')
    
    const testUserId = '686ba8b3-43c3-44ed-b614-3ef547cb1022' // Your user ID from error logs
    
    // Test SELECT
    console.log('Testing SELECT permission...')
    const { data: selectTest, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()
    
    if (selectError) {
      console.error('❌ SELECT failed:', selectError)
    } else {
      console.log('✅ SELECT works:', {
        id: selectTest.id,
        address: selectTest.address,
        full_name: selectTest.full_name
      })
    }

    // Test UPDATE 
    console.log('\nTesting UPDATE permission...')
    const { data: updateTest, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        address: 'Test Address via Service Role - ' + new Date().toISOString().slice(0,19)
      })
      .eq('id', testUserId)
      .select()
    
    if (updateError) {
      console.error('❌ UPDATE failed:', updateError)
    } else {
      console.log('✅ UPDATE works:', updateTest)
    }

    // 4. Check what policies exist (attempt)
    console.log('\n📋 4. RLS POLICIES INVESTIGATION')
    console.log('--------------------------------')
    
    try {
      // This will likely fail but let's try
      const { data: policies, error: policyError } = await supabase
        .rpc('get_table_policies', { table_name: 'profiles' })
      
      if (policyError) {
        console.log('❌ Cannot query policies directly:', policyError.message)
        console.log('')
        console.log('🔍 MANUAL INVESTIGATION NEEDED:')
        console.log('Please run these queries in Supabase SQL Editor:')
        console.log('')
        console.log('-- Check if RLS is enabled:')
        console.log("SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';")
        console.log('')
        console.log('-- Check existing policies:')
        console.log("SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'profiles';")
        console.log('')
        console.log('-- Check table owner and permissions:')
        console.log("SELECT tableowner FROM pg_tables WHERE tablename = 'profiles';")
      } else {
        console.log('✅ Policies found:', policies)
      }
    } catch (err) {
      console.log('❌ Policy check failed:', err.message)
    }

    // 5. Test with different approaches
    console.log('\n🔧 5. TESTING DIFFERENT UPDATE APPROACHES')
    console.log('------------------------------------------')
    
    // Test 1: Simple update
    console.log('Test 1: Simple address update...')
    const { error: test1Error } = await supabase
      .from('profiles')
      .update({ address: 'Simple test ' + Date.now() })
      .eq('id', testUserId)
    
    console.log('Test 1 result:', test1Error ? `❌ ${test1Error.message}` : '✅ Success')

    // Test 2: Update with timestamp
    console.log('Test 2: Update with timestamp...')
    const { error: test2Error } = await supabase
      .from('profiles')
      .update({ 
        address: 'Timestamped test ' + Date.now(),
        updated_at: new Date().toISOString()
      })
      .eq('id', testUserId)
    
    console.log('Test 2 result:', test2Error ? `❌ ${test2Error.message}` : '✅ Success')

  } catch (error) {
    console.error('❌ Diagnostic error:', error)
  }
}

diagnosticCheck()
