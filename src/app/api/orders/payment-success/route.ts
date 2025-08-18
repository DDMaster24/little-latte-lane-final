import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    console.log('🎉 === PAYMENT SUCCESS HANDLER ===');

    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    console.log('📝 Processing successful payment:', paymentId);

    // Find the order by payment reference
    // PayFast payment ID should match our m_payment_id format: LLL-{orderId}-{timestamp}
    const orderIdMatch = paymentId.match(/LLL-(\d+)-/);

    if (!orderIdMatch) {
      console.log('❌ Could not extract order ID from payment ID:', paymentId);
      return NextResponse.json(
        {
          error: 'Invalid payment ID format',
          success: false,
        },
        { status: 400 }
      );
    }

    const orderId = parseInt(orderIdMatch[1]);
    console.log('🔍 Extracted Order ID:', orderId);

    // Update order status from 'draft' to 'confirmed' and mark payment as 'paid'
    const { data: updatedOrder, error: updateError } = await supabaseServer
      .from('orders')
      .update({
        status: 'confirmed', // Convert from draft to confirmed (now ready for kitchen)
        payment_status: 'paid',
        payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'draft') // Only update if still in draft status
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating order:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to update order',
          success: false,
        },
        { status: 500 }
      );
    }

    console.log('✅ Order updated successfully:', updatedOrder);

    // Send confirmation notifications
    try {
      // Get user from the order's user_id
      const { data: profile } = await supabaseServer
        .from('profiles')
        .select('id, full_name')
        .eq('id', updatedOrder.user_id)
        .single();

      // Get the auth user email (this requires admin access in server-side)
      const userEmail = `customer-${updatedOrder.user_id}@example.com`; // Fallback since we can't access auth from server
      
      // Send order confirmation email
      const { sendOrderConfirmationEmail } = await import('@/lib/notifications');
      
      await sendOrderConfirmationEmail({
        orderId: updatedOrder.id,
        total: updatedOrder.total,
        userEmail,
        userName: profile?.full_name || 'Valued Customer',
        items: [], // TODO: Fetch order items from database
        deliveryType: updatedOrder.delivery_type,
        estimatedReadyTime: updatedOrder.estimated_ready_time 
          ? new Date(updatedOrder.estimated_ready_time).toLocaleString()
          : undefined,
      });

      console.log('📧 Order confirmation email sent successfully');
    } catch (notificationError) {
      // Don't fail the payment process if notifications fail
      console.error('⚠️ Failed to send notifications:', notificationError);
    }
    console.log('📊 Payment Analytics:', {
      orderId: updatedOrder.id,
      total: updatedOrder.total,
      paymentId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        total: updatedOrder.total,
        status: updatedOrder.status,
        paymentId,
      },
    });
  } catch (error) {
    console.error('❌ Payment success handler error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}
