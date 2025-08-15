import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  console.log('PayFast cancel:', Object.fromEntries(searchParams));

  // Redirect to menu page with cancellation message
  return redirect('/menu/modern?payment=cancelled');
}

export async function POST(request: NextRequest) {
  // Handle POST method as well
  return GET(request);
}
