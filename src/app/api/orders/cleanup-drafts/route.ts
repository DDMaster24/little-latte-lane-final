import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST() {
  try {
    console.log('🧹 === CLEANING UP UNPAID DRAFT ORDERS ===');

    const supabase = getSupabaseAdmin();

    // Delete draft orders older than 6 hours (never paid)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data: draftOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'draft')
      .eq('payment_status', 'pending')
      .lt('created_at', sixHoursAgo);

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
    const orderIds = draftOrders.map((order: { id: string }) => order.id);

    const { error: itemsDeleteError } = await supabase
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
    const { error: ordersDeleteError } = await supabase
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
      `✅ Successfully deleted ${draftOrders.length} unpaid draft orders (older than 6 hours)`
    );

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${draftOrders.length} unpaid orders (older than 6 hours)`,
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
