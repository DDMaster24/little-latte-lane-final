import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // PayFast will send these parameters on successful return
  const paymentId = searchParams.get('payment_id');
  const paymentStatus = searchParams.get('payment_status');

  console.log('PayFast return:', { paymentId, paymentStatus });

  // Redirect to menu page with success message
  if (paymentStatus === 'COMPLETE') {
    return redirect('/menu/modern?payment=success&payment_id=' + paymentId);
  } else {
    return redirect('/menu/modern?payment=error&reason=payment_incomplete');
  }
}

export async function POST(request: NextRequest) {
  // Handle POST method as well (PayFast can use either GET or POST)
  return GET(request);
}
