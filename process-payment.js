require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function manuallyProcessPayment() {
  console.log('🔄 Manually processing confirmed PayFast payment...\n');
  
  const orderId = '98edec77-3e54-4be5-8441-4c478755346e';
  const paymentId = 'LLL-98edec77-3e54-4be5-8441-4c478755346e-1755677333531';
  const payfastPaymentId = '243623825';
  
  try {
    // 1. Check current order status
    console.log('1. 📋 Checking current order status...');
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, payment_status, total_amount, created_at')
      .eq('id', orderId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching order:', fetchError.message);
      return;
    }

    if (!currentOrder) {
      console.error('❌ Order not found:', orderId);
      return;
    }

    console.log('Current order status:');
    console.log(`   - Order ID: ${currentOrder.id}`);
    console.log(`   - Status: ${currentOrder.status}`);
    console.log(`   - Payment Status: ${currentOrder.payment_status}`);
    console.log(`   - Total: R${currentOrder.total_amount}`);
    console.log(`   - Created: ${currentOrder.created_at}`);
    console.log('');

    // 2. Update order status from 'draft' to 'confirmed'
    console.log('2. ✅ Updating order status to confirmed...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Error updating order:', updateError.message);
      return;
    }

    console.log('✅ Order status updated successfully!');
    console.log('   - Status: draft → confirmed');
    console.log('   - Payment Status: pending → paid');
    console.log('');

    // 3. Verify the update
    console.log('3. 🔍 Verifying order update...');
    const { data: updatedOrder, error: verifyError } = await supabase
      .from('orders')
      .select('id, status, payment_status, total_amount')
      .eq('id', orderId)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying order:', verifyError.message);
      return;
    }

    console.log('Updated order status:');
    console.log(`   - Order ID: ${updatedOrder.id}`);
    console.log(`   - Status: ${updatedOrder.status}`);
    console.log(`   - Payment Status: ${updatedOrder.payment_status}`);
    console.log(`   - Total: R${updatedOrder.total_amount}`);
    console.log('');

    // 4. Log payment details for records
    console.log('4. 📝 Payment processing completed:');
    console.log(`   - PayFast Payment ID: ${payfastPaymentId}`);
    console.log(`   - Merchant Payment ID: ${paymentId}`);
    console.log(`   - Amount: R37.00`);
    console.log(`   - Status: COMPLETE`);
    console.log('');

    console.log('🎉 SUCCESS: Your payment has been manually processed!');
    console.log('Your order is now visible to the kitchen and will be prepared.');

  } catch (error) {
    console.error('💥 Error processing payment manually:', error.message);
  }
}

manuallyProcessPayment();
