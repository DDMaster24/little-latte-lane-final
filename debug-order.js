import { getSupabaseAdmin } from './src/lib/supabase-server.js';

async function debugOrder() {
  try {
    const supabase = await getSupabaseAdmin();
    
    // Check recent orders
    console.log('🔍 Checking recent orders...');
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ Error querying orders:', error);
    } else {
      console.log('📋 Recent orders:', orders);
    }
    
    // Check the specific order from the payment logs
    const orderId = 'aec0c812-2c9c-4e4c-9075-f87f5120635d';
    const userId = '2cb3a5a1-7a6c-4bde-afd6-a1ae107ca881';
    
    console.log('\n🎯 Looking for specific order:', { orderId, userId });
    const { data: specificOrder, error: specificError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (specificError) {
      console.log('❌ Specific order error:', specificError);
    } else {
      console.log('📋 Specific order found:', specificOrder);
    }
    
    // Check if order exists without user filter
    console.log('\n🔍 Checking order without user filter...');
    const { data: orderOnly, error: orderOnlyError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderOnlyError) {
      console.log('❌ Order-only query error:', orderOnlyError);
    } else {
      console.log('📋 Order-only result:', orderOnly);
    }
    
  } catch (err) {
    console.error('❌ Script error:', err);
  }
}

debugOrder();
