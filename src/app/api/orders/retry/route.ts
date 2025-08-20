import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { orderId, userId } = await request.json();

    if (!orderId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('🔄 API: Getting order for retry:', orderId, 'for user:', userId);
    
    const supabase = await getSupabaseServer();

    // Get the draft order with menu items
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        status,
        order_items (
          menu_item_id,
          quantity,
          price,
          menu_items (
            id,
            name,
            description,
            price
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('status', 'draft')
      .single();

    if (fetchError || !order) {
      console.error('❌ Order not found or not accessible:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Order not found or cannot be retried' },
        { status: 404 }
      );
    }

    console.log('✅ Found draft order for retry:', order.order_number);

    // Convert order items to cart format
    interface OrderItemWithMenu {
      menu_item_id: string | null;
      quantity: number;
      price: number;
      menu_items?: {
        id: string;
        name: string;
        description?: string | null;
        price: number;
      } | null;
    }
    
    const cartItems = order.order_items.map((item: OrderItemWithMenu) => ({
      id: item.menu_items?.id || item.menu_item_id || 'unknown',
      name: item.menu_items?.name || 'Unknown Item',
      price: item.price,
      quantity: item.quantity,
      description: item.menu_items?.description || undefined,
    }));

    return NextResponse.json({ 
      success: true, 
      orderItems: cartItems,
      orderNumber: order.order_number || undefined
    });

  } catch (error) {
    console.error('❌ Get order for retry API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
