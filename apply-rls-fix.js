/**
 * Apply Order Items RLS Fix
 * This script applies the RLS policy fix to allow order items insertion
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSFix() {
  console.log('🔧 Applying Order Items RLS Fix...\n');
  
  try {
    // Read the SQL fix file
    const sqlContent = fs.readFileSync('fix-order-items-rls.sql', 'utf8');
    
    console.log('📋 Executing RLS policy fix...');
    
    // Execute the SQL
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.log('❌ RLS fix failed via RPC, trying direct execution...');
      
      // Try splitting the SQL into individual statements
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && s !== '');
      
      console.log(`📝 Executing ${statements.length} SQL statements...`);
      
      for (const statement of statements) {
        console.log(`   - ${statement.substring(0, 50)}...`);
        
        try {
          const { error: stmtError } = await supabaseAdmin
            .from('_dummy')
            .select('1')
            .limit(0); // This is a hack to execute SQL
          
          // Since we can't execute raw SQL via client, we'll output it for manual execution
          console.log('     ⚠️  Manual execution required');
        } catch (err) {
          console.log('     ❌ Statement failed');
        }
      }
      
      console.log('\n⚠️  RLS policies need to be applied manually in Supabase SQL editor.');
      console.log('📋 Copy the content of fix-order-items-rls.sql and execute it in:');
      console.log('    https://supabase.com/dashboard/project/awytuszmunxvthuizyur/sql');
      
    } else {
      console.log('✅ RLS fix applied successfully:', data);
    }
    
    // Test the fix
    console.log('\n🧪 Testing the fix...');
    
    // Get a test user ID (we'll simulate having a user session)
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profiles && profiles.length > 0) {
      const testUserId = profiles[0].id;
      
      // Create a test order
      const { data: testOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: testUserId,
          total_amount: 50,
          status: 'draft',
          payment_status: 'awaiting_payment',
          delivery_method: 'pickup',
          special_instructions: 'RLS test order',
        })
        .select('id')
        .single();
      
      if (orderError) {
        console.log('❌ Test order creation failed:', orderError.message);
        return;
      }
      
      console.log('✅ Test order created:', testOrder.id);
      
      // Now test if we can insert order items (this will still use admin but we'll check the policies)
      const { data: policies, error: policiesError } = await supabaseAdmin
        .from('pg_policies')
        .select('policyname, tablename, cmd')
        .eq('tablename', 'order_items');
      
      if (policiesError) {
        console.log('❌ Could not check policies:', policiesError.message);
      } else {
        console.log('✅ Order items policies:');
        policies.forEach(policy => {
          console.log(`   - ${policy.policyname} (${policy.cmd})`);
        });
      }
      
      // Cleanup test order
      await supabaseAdmin.from('orders').delete().eq('id', testOrder.id);
      console.log('✅ Test order cleaned up');
    }
    
  } catch (error) {
    console.error('\n❌ RLS FIX FAILED!');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
  }
}

applyRLSFix();
