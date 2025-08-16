import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🧹 === CLEANING UP UNPAID DRAFT ORDERS ===');

    // Dynamic import to avoid build-time execution issues
    const { supabaseServer } = await import('@/lib/supabaseServer');

    // Delete draft orders older than 1 hour (never paid)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: draftOrders, error: fetchError } = await supabaseServer
      .from('orders')
      .select('id')
      .eq('status', 'draft')
      .eq('payment_status', 'pending')
      .lt('created_at', oneHourAgo);

    if (fetchError) {
      console.error('❌ Error fetching draft orders:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch draft orders' },
        { status: 500 }
      );
    }

    if (!draftOrders || draftOrders.length === 0) {
      console.log('✅ No draft orders to clean up');
      return NextResponse.json({
        success: true,
        message: 'No draft orders to clean up',
        deleted: 0,
      });
    }

    console.log(`🗑️ Found ${draftOrders.length} draft orders to delete`);

    // Delete order items first (foreign key constraint)
    const orderIds = draftOrders.map((order) => order.id);

    const { error: itemsDeleteError } = await supabaseServer
      .from('order_items')
      .delete()
      .in('order_id', orderIds);

    if (itemsDeleteError) {
      console.error('❌ Error deleting order items:', itemsDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete order items' },
        { status: 500 }
      );
    }

    // Delete draft orders
    const { error: ordersDeleteError } = await supabaseServer
      .from('orders')
      .delete()
      .in('id', orderIds);

    if (ordersDeleteError) {
      console.error('❌ Error deleting draft orders:', ordersDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete draft orders' },
        { status: 500 }
      );
    }

    console.log(
      `✅ Successfully deleted ${draftOrders.length} unpaid draft orders`
    );

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${draftOrders.length} unpaid orders`,
      deleted: draftOrders.length,
    });
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing
export async function GET() {
  return POST();
}
