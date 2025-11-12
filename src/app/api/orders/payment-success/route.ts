import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Payment success handler invoked');

    // SECURITY: Authenticate the user first
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized payment success attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      );
    }

    logger.debug('Processing payment success', { paymentId, userId: user.id });

    // Extract order ID from payment reference
    const orderIdMatch = paymentId.match(/LLL-(\d+)-/);

    if (!orderIdMatch) {
      logger.warn('Invalid payment ID format', { paymentId });
      return NextResponse.json(
        {
          error: 'Invalid payment ID format',
          success: false,
        },
        { status: 400 }
      );
    }

    const orderId = orderIdMatch[1];
    logger.debug('Extracted order ID', { orderId });

    // SECURITY: Verify user owns this order before proceeding
    const adminSupabase = getSupabaseAdmin();
    const { data: existingOrder, error: fetchError } = await adminSupabase
      .from('orders')
      .select('id, user_id, status, payment_status')
      .eq('id', orderId)
      .single();

    if (fetchError || !existingOrder) {
      logger.error('Order not found', fetchError);
      return NextResponse.json(
        { error: 'Order not found', success: false },
        { status: 404 }
      );
    }

    // SECURITY: Ensure user owns the order
    if (existingOrder.user_id !== user.id) {
      logger.warn('User attempted to access another user\'s order', {
        userId: user.id,
        orderUserId: existingOrder.user_id,
        orderId,
      });
      return NextResponse.json(
        { error: 'Forbidden', success: false },
        { status: 403 }
      );
    }

    // Update order status from 'draft' to 'confirmed' and mark payment as 'paid'
    const { data: updatedOrder, error: updateError } = await adminSupabase
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
      logger.error('Failed to update order', updateError);
      return NextResponse.json(
        {
          error: 'Failed to update order',
          success: false,
        },
        { status: 500 }
      );
    }

    logger.info('Order updated successfully', { orderId, status: updatedOrder.status });

    // Send confirmation notifications
    try {
      if (updatedOrder.user_id) {
        // Get user from the order's user_id
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', updatedOrder.user_id)
          .single();

        // Fetch order items with menu item details
        const { data: orderItems, error: itemsError } = await adminSupabase
          .from('order_items')
          .select(`
            id,
            quantity,
            price,
            special_instructions,
            menu_item_id,
            menu_items!inner (
              name,
              description
            )
          `)
          .eq('order_id', updatedOrder.id);

        if (itemsError) {
          logger.error('Failed to fetch order items', itemsError);
        }

        // Transform items for email
        const items = (orderItems || []).map((item: {
          id: string;
          quantity: number;
          price: number;
          special_instructions?: string | null;
          menu_items: { name: string; description?: string | null };
        }) => ({
          id: item.id,
          name: item.menu_items.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.special_instructions || undefined,
        }));

        // Send order confirmation email
        const { sendOrderConfirmationEmail } = await import('@/lib/notifications');

        await sendOrderConfirmationEmail({
          orderId: updatedOrder.id,
          total: updatedOrder.total_amount || 0,
          userEmail: profile?.email || `customer-${updatedOrder.user_id}@example.com`,
          userName: profile?.full_name || 'Valued Customer',
          items,
          deliveryType: 'delivery', // Default value since field doesn't exist in database
          estimatedReadyTime: undefined, // Field doesn't exist in current database schema
        });

        logger.info('Order confirmation email sent successfully', { orderId: updatedOrder.id });
      }
    } catch (notificationError) {
      // Don't fail the payment process if notifications fail
      logger.error('Failed to send notifications', notificationError);
    }

    logger.info('Payment analytics recorded', {
      orderId: updatedOrder.id,
      total: updatedOrder.total_amount,
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
    logger.error('Payment success handler error', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}
