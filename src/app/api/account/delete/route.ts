import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabaseServer } from '@/lib/supabase-server';
import { checkRateLimit, getClientIdentifier, RateLimitPresets, getRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // First, authenticate the requesting user
    const supabaseServer = await getSupabaseServer();
    const { data: { user: authenticatedUser }, error: authError } = await supabaseServer.auth.getUser();

    // Apply rate limiting (very strict for account deletion)
    const identifier = getClientIdentifier(request, authenticatedUser?.id);
    const rateLimitResult = checkRateLimit(identifier, {
      id: 'account-delete',
      ...RateLimitPresets.ACCOUNT_OPERATIONS,
    });

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.resetAt).toISOString();
      return NextResponse.json(
        {
          success: false,
          error: 'Too many account deletion requests. Please try again later.',
          resetAt: resetTime,
        },
        {
          status: 429,
          headers: getRateLimitHeaders({
            ...rateLimitResult,
            limit: RateLimitPresets.ACCOUNT_OPERATIONS.limit,
          }),
        }
      );
    }

    if (authError || !authenticatedUser) {
      console.error('Unauthorized account deletion attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // SECURITY: Verify the authenticated user can only delete their own account
    if (userId !== authenticatedUser.id) {
      console.error('Forbidden account deletion attempt - user mismatch');
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only delete your own account' },
        { status: 403 }
      );
    }

    // Use admin client to delete the user (bypasses RLS for cascade deletion)
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Delete user error:', error.message);
      return NextResponse.json(
        { success: false, error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    console.log('User account deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
