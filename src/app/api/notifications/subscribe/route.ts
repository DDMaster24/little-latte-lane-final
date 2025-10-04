/**
 * Push Notification Subscription API
 * Saves user's push subscription to enable web push notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { subscription, deviceType = 'web' } = body;

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Push subscription data is required' },
        { status: 400 }
      );
    }

    console.log('📱 Saving push subscription for user:', user.id);

    // Save or update push subscription in database
    const { error: upsertError } = await supabase
      .from('notifications')
      .upsert(
        {
          user_id: user.id,
          push_subscription: subscription,
          push_enabled: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('❌ Error saving push subscription:', upsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to save push subscription' },
        { status: 500 }
      );
    }

    console.log('✅ Push subscription saved successfully for user:', user.id);

    // Record subscription event in notification history
    await supabase.from('notification_history').insert({
      user_id: user.id,
      notification_type: 'system',
      category: 'subscription_enabled',
      title: 'Push Notifications Enabled',
      body: `Push notifications enabled on ${deviceType}`,
      delivery_status: 'delivered',
      data: { device_type: deviceType },
    });

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully',
      data: {
        user_id: user.id,
        push_enabled: true,
      },
    });
  } catch (error) {
    console.error('❌ Push subscription error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    // Get user's notification settings
    const { data, error } = await supabase
      .from('notifications')
      .select('push_enabled, push_subscription')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no settings exist yet, return default
      return NextResponse.json({
        success: true,
        data: {
          push_enabled: false,
          has_subscription: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        push_enabled: data.push_enabled,
        has_subscription: !!data.push_subscription,
      },
    });
  } catch (error) {
    console.error('❌ Get subscription error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
