import { NextRequest, NextResponse } from 'next/server';
import { confirmUserEmail } from '@/lib/authEmailService';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or email' },
        { status: 400 }
      );
    }

    const result = await confirmUserEmail(userId, email);
    
    if (result.success) {
      return NextResponse.json(
        { success: true, message: 'Email confirmed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to confirm email' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ Email confirmation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
