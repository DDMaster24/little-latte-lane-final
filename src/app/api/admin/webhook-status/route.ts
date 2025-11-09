import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/adminAuth';
import { logger } from '@/lib/logger';

/**
 * Webhook Status Checker
 * Check orders that might have missed webhook updates
 * SECURITY: Admin-only endpoint
 */
export async function GET() {
  try {
    // SECURITY: Verify admin authentication
    const authError = await requireAdmin();
    if (authError) return authError;

    // Skip execution during build time or when using placeholder environment
    if (process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://build-placeholder.supabase.co') {
      return NextResponse.json({
        status: 'Webhook status checker not available during build time',
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Admin checking webhook status');
    
    const supabase = await getSupabaseServer();
    
    // Get orders from the last 24 hours that are still awaiting payment
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const { data: stuckOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'awaiting_payment')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error checking orders', error);
      return NextResponse.json(
        { error: 'Failed to check orders' },
        { status: 500 }
      );
    }

    const report = {
      timestamp: new Date().toISOString(),
      ordersChecked: stuckOrders?.length || 0,
      stuckOrders: stuckOrders?.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        amount: order.total_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        ageInMinutes: order.created_at ? Math.round((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60)) : 0
      })) || [],
      webhookInfo: {
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.littlelattelane.co.za'}/api/yoco/webhook`,
        testWebhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.littlelattelane.co.za'}/api/test/webhook`,
        simulatePaymentUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.littlelattelane.co.za'}/api/test/simulate-payment`,
      }
    };

    logger.debug('Webhook status report generated', { ordersChecked: report.ordersChecked });

    return NextResponse.json(report);

  } catch (error) {
    logger.error('Webhook status check error', error);
    return NextResponse.json(
      { error: 'Status check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Manually fix stuck orders
 * SECURITY: Admin-only endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify admin authentication
    const authError = await requireAdmin();
    if (authError) return authError;

    const { orderIds, action = 'complete' } = await request.json();
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { error: 'orderIds array is required' },
        { status: 400 }
      );
    }

    logger.info(`Admin manually ${action}ing orders`, { orderIds, action });
    
    const supabase = await getSupabaseServer();
    
    let updateData;
    if (action === 'complete') {
      updateData = {
        payment_status: 'completed',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      };
    } else if (action === 'cancel') {
      updateData = {
        payment_status: 'cancelled',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "complete" or "cancel"' },
        { status: 400 }
      );
    }

    const { data: updatedOrders, error } = await supabase
      .from('orders')
      .update(updateData)
      .in('id', orderIds)
      .select();

    if (error) {
      logger.error('Error updating orders', error);
      return NextResponse.json(
        { error: 'Failed to update orders' },
        { status: 500 }
      );
    }

    logger.info(`Successfully ${action}d orders`, {
      action,
      updatedCount: updatedOrders?.length || 0,
      orderNumbers: updatedOrders?.map(o => o.order_number),
    });

    return NextResponse.json({
      success: true,
      action,
      updatedCount: updatedOrders?.length || 0,
      updatedOrders: updatedOrders?.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status
      }))
    });

  } catch (error) {
    logger.error('Manual order update error', error);
    return NextResponse.json(
      { error: 'Manual update failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
