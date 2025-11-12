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
    const { subscription, fcm_token, apns_token, deviceType = 'web' } = body;

    // Validate that at least one subscription method is provided
    if (!subscription && !fcm_token && !apns_token) {
      return NextResponse.json(
        { success: false, error: 'At least one subscription method (web push, FCM token, or APNS token) is required' },
        { status: 400 }
      );
    }

    console.log('📱 Saving push subscription for user:', user.id, '- Device:', deviceType);

    // Build update object dynamically based on what was provided
    const updateData: {
      user_id: string;
      push_enabled: boolean;
      updated_at: string;
      push_subscription?: typeof subscription;
      fcm_token?: string;
      apns_token?: string;
    } = {
      user_id: user.id,
      push_enabled: true,
      updated_at: new Date().toISOString(),
    };

    // Add subscription data based on device type
    if (subscription) updateData.push_subscription = subscription;
    if (fcm_token) updateData.fcm_token = fcm_token;
    if (apns_token) updateData.apns_token = apns_token;

    // Save or update push subscription in database
    const { error: upsertError } = await supabase
      .from('notifications')
      .upsert(updateData, { onConflict: 'user_id' })
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
