import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // PayFast may send various parameters on return
  const paymentId = searchParams.get('payment_id') || searchParams.get('pf_payment_id');
  const paymentStatus = searchParams.get('payment_status');
  const orderId = searchParams.get('custom_str1');

  console.log('🔄 PayFast return:', { paymentId, paymentStatus, orderId, allParams: Object.fromEntries(searchParams) });

  // PayFast return doesn't always have reliable status info
  // So we'll assume success unless explicitly told otherwise
  if (paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED') {
    console.log('❌ PayFast explicitly indicated failure:', paymentStatus);
    return redirect('/menu/modern?payment=error&reason=payment_cancelled');
  } else {
    // Default to success - the webhook will handle the actual payment verification
    console.log('✅ PayFast return - assuming success, webhook will verify');
    return redirect(`/menu/modern?payment=success${paymentId ? '&payment_id=' + paymentId : ''}${orderId ? '&order_id=' + orderId : ''}`);
  }
}

export async function POST(request: NextRequest) {
  // Handle POST method as well (PayFast can use either GET or POST)
  return GET(request);
}
