// Manual order confirmation script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://awytuszmunxvthuizyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3eXR1c3ptdW54dnRodWl6eXVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI1MDQzMCwiZXhwIjoyMDcwODI2NDMwfQ.7wxcJMA35yK3x8lBc0Qr_qdsmPbnN6i4u5Dx66QkeoM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function confirmPaidOrders() {
  console.log('💰 Confirming orders that have been paid...');
  
  try {
    // Update the two most recent draft orders to confirmed status
    // These are the orders you paid for but didn't get confirmed due to webhook issue
    
    const orderIds = [
      '5f7bd755-f04b-44c9-94e4-9bad7055b964', // LL1032 - R6
      '11983b05-61b3-4514-9b9e-ccc3426b2991'  // LL1031 - R55
    ];
    
    for (const orderId of orderIds) {
      console.log(`\n🔄 Confirming order ${orderId}...`);
      
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select('id, order_number, status, payment_status, total_amount')
        .single();

      if (error) {
        console.error(`❌ Error confirming order ${orderId}:`, error);
        continue;
      }

      if (updatedOrder) {
        console.log(`✅ Order ${updatedOrder.order_number} confirmed successfully!`);
        console.log(`   Status: ${updatedOrder.status} | Payment: ${updatedOrder.payment_status}`);
        console.log(`   Amount: R${updatedOrder.total_amount}`);
      }
    }
    
    console.log('\n🎉 Order confirmation complete!');
    console.log('📱 Check your kitchen panel - the orders should now be visible');
    console.log('📧 The customer should see these orders in their account');
    
  } catch (error) {
    console.error('❌ Error in confirmation process:', error);
  }
}

confirmPaidOrders();
