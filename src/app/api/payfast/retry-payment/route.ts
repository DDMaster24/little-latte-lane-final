import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import { payfast } from '@/lib/payfast';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    console.error('❌ Retry Payment: No order ID provided');
    return redirect('/account?error=missing_order_id');
  }

  try {
    console.log('🔄 Retry Payment: Processing retry for order:', orderId);

    const supabase = await getSupabaseServer();

    // Get the draft order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          menu_item_id,
          quantity,
          price,
          menu_items (name)
        ),
        profiles (
          full_name,
          phone,
          address
        )
      `)
      .eq('id', orderId)
      .eq('status', 'draft')
      .single();

    if (orderError || !order) {
      console.error('❌ Retry Payment: Order not found or not draft:', orderError);
      return redirect('/account?error=order_not_found');
    }

    // Verify ownership (auth check)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || order.user_id !== user.id) {
      console.error('❌ Retry Payment: Unauthorized access:', authError);
      return redirect('/account?error=unauthorized');
    }

    console.log('✅ Retry Payment: Order found:', {
      id: order.id,
      total: order.total_amount,
      items: order.order_items.length,
      user: order.user_id
    });

    // Calculate base URL for callbacks
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Prepare item details for PayFast
    interface OrderItem {
      menu_items?: { name: string } | null;
      quantity: number;
      price: number;
    }

    const itemNames = order.order_items
      .map((item: OrderItem) => `${item.menu_items?.name || 'Menu Item'} x${item.quantity}`)
      .join(', ');

    const itemDescription = order.special_instructions 
      ? `${itemNames} - ${order.special_instructions}`
      : itemNames;

    // Create payment data using the existing order
    const paymentData = payfast.createPaymentData({
      orderId: Date.now(), // Use timestamp as numeric ID (PayFast requirement)
      userId: order.user_id,
      amount: order.total_amount || 0,
      itemName: `${itemNames} (Order #${order.id})`,
      itemDescription,
      userEmail: user.email || undefined,
      userFirstName: order.profiles?.full_name?.split(' ')[0] || 'Customer',
      userLastName: order.profiles?.full_name?.split(' ').slice(1).join(' ') || '',
      userPhone: order.profiles?.phone || undefined,
      deliveryType: 'pickup', // Default for existing orders
      deliveryAddress: order.profiles?.address || undefined,
      returnUrl: `${baseUrl}/api/payfast/return`,
      cancelUrl: `${baseUrl}/api/payfast/cancel`,
      notifyUrl: `${baseUrl}/api/payfast/notify`,
    });

    // Override the order UUID in custom_str1 for webhook processing
    paymentData.custom_str1 = order.id;

    console.log('✅ Retry Payment: PayFast data prepared for order:', orderId);

    // Generate the PayFast form HTML
    const payfastUrl = payfast.getPaymentUrl();
    
    const formHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Processing Payment - Little Latte Lane</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          background: rgba(0,0,0,0.8);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #333;
          text-align: center;
          max-width: 400px;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(45deg, #00ffff, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-top: 4px solid #00ffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 1rem auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .order-info {
          background: rgba(255,255,255,0.1);
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: left;
        }
        .order-info h3 {
          margin: 0 0 0.5rem 0;
          color: #00ffff;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Little Latte Lane</div>
        <h2>Completing Your Payment</h2>
        <div class="spinner"></div>
        <div class="order-info">
          <h3>Order #${order.id}</h3>
          <p><strong>Total:</strong> R${(order.total_amount || 0).toFixed(2)}</p>
          <p><strong>Items:</strong> ${itemNames}</p>
        </div>
        <p>Redirecting to PayFast secure payment...</p>
        <form id="payfast-form" action="${payfastUrl}" method="POST">
          ${Object.entries(paymentData)
            .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
            .join('')}
        </form>
        <script>
          // Auto-submit the form
          setTimeout(() => {
            document.getElementById('payfast-form').submit();
          }, 2000);
        </script>
      </div>
    </body>
    </html>`;

    return new Response(formHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('❌ Retry Payment: Unexpected error:', error);
    return redirect('/account?error=payment_retry_failed');
  }
}
