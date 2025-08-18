// CLIENT-SIDE ACTION - Use client auth instead of server auth
import { supabase } from '@/lib/supabaseClient';

export async function performCheckout(
  userId: string,
  items: {
    id: string;
    quantity: number;
    price?: number; // Optional price for customized items
    name?: string; // Optional name for logging
    customization?: Record<string, unknown>; // Optional customization data - using proper typing
  }[],
  total: number,
  deliveryType: string,
  _email: string,
  _userDetails?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  }
) {
  try {
    console.log('🔄 Starting checkout process for user:', userId);
    
    // Verify user authentication and session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Get session separately
    const { data: { session } } = await supabase.auth.getSession();

    console.log('🔍 Auth check result:', {
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? 'present' : 'missing',
      authError: authError?.message,
      expectedUserId: userId
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!user) {
      console.error('❌ No user found in session');
      throw new Error('Authentication error: Auth session missing!');
    }

    if (user.id !== userId) {
      console.error('❌ User ID mismatch:', { sessionUserId: user.id, expectedUserId: userId });
      throw new Error(
        `Authentication mismatch: Please ensure you are logged in correctly`
      );
    }

    console.log('✅ Authentication verified for user:', user.id);

    // Separate regular items from customized items (timestamp IDs are longer than regular IDs)
    const regularItems = items.filter((item) => String(item.id).length <= 10);
    const customizedItems = items.filter((item) => String(item.id).length > 10);

    // Create order (pending status until payment is confirmed)
    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total,
        delivery_type: deliveryType,
        status: 'pending', // Pending status - will be confirmed after payment
        payment_status: 'pending',
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    const orderId = orderRecord.id;

    // Check stock only for regular menu items (not customized)
    for (const item of regularItems) {
      // Fetch current stock for the menu item
      const { data: menuItem, error: stockError } = await supabase
        .from('menu_items')
        .select('stock, name')
        .eq('id', item.id)
        .single();

      if (stockError) {
        throw new Error(`Failed to check stock for item ${item.id}: ${stockError.message}`);
      }

      if (!menuItem) {
        throw new Error(`Menu item with ID ${item.id} not found in database`);
      }

      // Check if enough stock
      if (menuItem.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${menuItem.name}. Available: ${menuItem.stock}, Requested: ${item.quantity}`
        );
      }
    }

    // Create order items for both regular and customized items
    const orderItems = [];

    // Process regular menu items
    for (const item of regularItems) {
      // Fetch the menu item to get the price
      const { data: menuItem, error: priceError } = await supabase
        .from('menu_items')
        .select('price, name')
        .eq('id', item.id)
        .single();

      if (priceError || !menuItem) {
        throw new Error(
          `Menu item with ID ${item.id} not found when fetching price`
        );
      }

      const unitPrice = parseFloat(menuItem.price.toString());

      orderItems.push({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: unitPrice,
      });
    }

    // Process customized items (pizzas) - these don't have menu_item_id
    for (const item of customizedItems) {
      // Get the item from the cart to extract the correct price
      const cartItem = items.find((cartItem) => cartItem.id === item.id);
      const unitPrice =
        cartItem && cartItem.price ? parseFloat(cartItem.price.toString()) : 0;

      orderItems.push({
        order_id: orderId,
        menu_item_id: null, // Customized items don't reference a menu item
        quantity: item.quantity,
        unit_price: unitPrice, // Use the actual price from the cart
        customization: JSON.stringify({
          type: 'pizza',
          customized_id: item.id,
          name: cartItem?.name || 'Custom Pizza',
          customization_details: cartItem?.customization || {},
        }),
      });
    }

    if (orderItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;
    }

    // Don't send confirmation email yet - wait for payment confirmation
    // Email will be sent from PayFast notification handler

    return { success: true, orderId };
  } catch (err: unknown) {
    console.error('Checkout error:', err);

    // Better error logging with full details
    if (err && typeof err === 'object' && 'message' in err) {
      console.error('Database error details:', {
        message: err.message,
        code: (err as Record<string, unknown>).code,
        details: (err as Record<string, unknown>).details,
        hint: (err as Record<string, unknown>).hint,
        full_error: err,
      });
    }

    console.error('Error details:', {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : 'No stack trace',
    });

    // Return more specific error information
    let errorMessage = 'Unknown error';
    if (err && typeof err === 'object' && 'message' in err) {
      errorMessage = String((err as Record<string, unknown>).message);
    } else if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }

    return { success: false, error: errorMessage };
  }
}

// New function to handle payment confirmation and stock decrement
export async function confirmPaymentAndDecrementStock(orderId: number) {
  try {
    // Get order items - only those with menu_item_id (regular items, not customized)
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('menu_item_id, quantity')
      .eq('order_id', orderId)
      .not('menu_item_id', 'is', null); // Only get items that have a menu_item_id

    if (orderItemsError || !orderItems) {
      throw new Error('Failed to fetch order items');
    }

    // Decrement stock for each regular menu item (customized items don't have stock)
    for (const item of orderItems) {
      const { data: menuItem, error: stockError } = await supabase
        .from('menu_items')
        .select('stock')
        .eq('id', item.menu_item_id)
        .single();

      if (stockError || !menuItem) {
        throw new Error(`Failed to fetch stock for item ${item.menu_item_id}`);
      }

      const newStock = menuItem.stock - item.quantity;

      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ stock: newStock })
        .eq('id', item.menu_item_id);

      if (updateError) {
        throw updateError;
      }
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('Stock decrement error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
