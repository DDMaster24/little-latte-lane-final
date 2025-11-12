/**
 * Push Notification Unsubscribe API
 * Removes user's push subscription to disable web push notifications
 */

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = await getSupabaseServer();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('📱 Removing push subscription for user:', user.id);

    // Remove push subscription from database
    const { error: updateError } = await supabase
      .from('notifications')
      .update({
        push_subscription: null,
        push_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Error removing push subscription:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to remove push subscription' },
        { status: 500 }
      );
    }

    console.log('✅ Push subscription removed successfully for user:', user.id);

    // Record unsubscription event in notification history
    await supabase.from('notification_history').insert({
      user_id: user.id,
      notification_type: 'system',
      category: 'subscription_disabled',
      title: 'Push Notifications Disabled',
      body: 'Push notifications have been disabled',
      delivery_status: 'delivered',
    });

    return NextResponse.json({
      success: true,
      message: 'Push notifications disabled successfully',
      data: {
        user_id: user.id,
        push_enabled: false,
      },
    });
  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
