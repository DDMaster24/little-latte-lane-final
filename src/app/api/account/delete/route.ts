import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Delete the user using admin client (this will cascade delete related data)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('❌ Delete user error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ User account deleted:', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Delete account API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
