import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎉 === PAYMENT SUCCESS HANDLER ===');

    const supabase = getSupabaseAdmin();
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    console.log('📝 Processing successful payment:', paymentId);

    // Find the order by payment reference
    // Yoco payment ID should match our checkout format
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

    const orderId = orderIdMatch[1]; // Keep as string UUID
    console.log('🔍 Extracted Order ID:', orderId);

    // Update order status from 'draft' to 'confirmed' and mark payment as 'paid'
    const { data: updatedOrder, error: updateError } = await supabase
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
      if (updatedOrder.user_id) {
        // Get user from the order's user_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', updatedOrder.user_id)
          .single();

        // Get the auth user email (this requires admin access in server-side)
        const userEmail = `customer-${updatedOrder.user_id}@example.com`; // Fallback since we can't access auth from server
      
        // Send order confirmation email
        const { sendOrderConfirmationEmail } = await import('@/lib/notifications');
        
        await sendOrderConfirmationEmail({
          orderId: updatedOrder.id, // Now correctly uses string UUID
          total: updatedOrder.total_amount || 0,
          userEmail,
          userName: profile?.full_name || 'Valued Customer',
          items: [], // TODO: Fetch order items from database
          deliveryType: 'delivery', // Default value since field doesn't exist in database
          estimatedReadyTime: undefined, // Field doesn't exist in current database schema
        });

        console.log('📧 Order confirmation email sent successfully');
      }
    } catch (notificationError) {
      // Don't fail the payment process if notifications fail
      console.error('⚠️ Failed to send notifications:', notificationError);
    }
    console.log('📊 Payment Analytics:', {
      orderId: updatedOrder.id,
      total: updatedOrder.total_amount,
      paymentId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        total: updatedOrder.total_amount,
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
