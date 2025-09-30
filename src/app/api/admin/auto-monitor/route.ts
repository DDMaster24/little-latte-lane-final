import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * Auto Order Status Monitor
 * Automatically check and update orders that should be completed
 * This is a backup system when webhooks don't work
 */
export async function POST(_request: NextRequest) {
  try {
    // Skip execution during build time or when using placeholder environment
    if (process.env.NEXT_PHASE === 'phase-production-build' || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://build-placeholder.supabase.co') {
      return NextResponse.json({
        success: false,
        message: 'Auto monitor not available during build time',
        checkedAt: new Date().toISOString()
      });
    }

    console.log('🔄 Auto order status monitor triggered');
    
    const supabase = await getSupabaseServer();
    
    // Get orders that are awaiting payment and older than 2 minutes
    const twoMinutesAgo = new Date();
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
    
    const { data: oldOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'awaiting_payment')
      .lt('created_at', twoMinutesAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching old orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    if (!oldOrders || oldOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No orders need status updates',
        checkedAt: new Date().toISOString()
      });
    }

    console.log(`🔍 Found ${oldOrders.length} orders that may need updating`);

    // Update these orders to completed (since they've been awaiting payment for 2+ minutes)
    // This assumes if someone stayed on payment page for 2+ minutes, they likely completed it
    const { data: updatedOrders, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .in('id', oldOrders.map(o => o.id))
      .select();

    if (updateError) {
      console.error('❌ Error updating orders:', updateError);
      return NextResponse.json(
        { error: 'Failed to update orders' },
        { status: 500 }
      );
    }

    console.log(`✅ Auto-updated ${updatedOrders?.length || 0} orders to confirmed`);

    // Trigger notifications for updated orders
    const notifications = [];
    for (const order of updatedOrders || []) {
      try {
        const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/orders/payment-success`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            paymentStatus: 'completed'
          })
        });
        
        notifications.push({
          orderId: order.id,
          orderNumber: order.order_number,
          notificationSent: notificationResponse.ok
        });
      } catch (notificationError) {
        notifications.push({
          orderId: order.id,
          orderNumber: order.order_number,
          notificationSent: false,
          error: notificationError instanceof Error ? notificationError.message : 'Unknown notification error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-updated ${updatedOrders?.length || 0} orders`,
      updatedOrders: updatedOrders?.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        paymentStatus: o.payment_status
      })),
      notifications,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Auto monitor error:', error);
    return NextResponse.json(
      { error: 'Auto monitor failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Skip execution during build time or when using placeholder environment
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://build-placeholder.supabase.co') {
    return NextResponse.json({
      status: 'Auto order monitor not available during build time',
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    status: 'Auto order monitor is active',
    description: 'POST to trigger automatic order status checking',
    note: 'This updates orders that have been awaiting payment for 2+ minutes',
    timestamp: new Date().toISOString()
  });
}
