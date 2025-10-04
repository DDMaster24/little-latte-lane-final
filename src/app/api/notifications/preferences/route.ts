/**
 * Notification Preferences API
 * Allows users to view and update their notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

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

    // Get user's notification preferences
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no preferences exist yet, return defaults
      return NextResponse.json({
        success: true,
        data: {
          push_enabled: true,
          email_enabled: true,
          sms_enabled: false,
          order_updates_enabled: true,
          promotional_enabled: true,
          event_announcements_enabled: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        push_enabled: data.push_enabled,
        email_enabled: data.email_enabled,
        sms_enabled: data.sms_enabled,
        order_updates_enabled: data.order_updates_enabled,
        promotional_enabled: data.promotional_enabled,
        event_announcements_enabled: data.event_announcements_enabled,
      },
    });
  } catch (error) {
    console.error('❌ Get preferences error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

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
    const {
      push_enabled,
      email_enabled,
      sms_enabled,
      order_updates_enabled,
      promotional_enabled,
      event_announcements_enabled,
    } = body;

    console.log('⚙️ Updating notification preferences for user:', user.id);

    // Update preferences in database
    const { data, error: updateError } = await supabase
      .from('notifications')
      .upsert(
        {
          user_id: user.id,
          ...(push_enabled !== undefined && { push_enabled }),
          ...(email_enabled !== undefined && { email_enabled }),
          ...(sms_enabled !== undefined && { sms_enabled }),
          ...(order_updates_enabled !== undefined && { order_updates_enabled }),
          ...(promotional_enabled !== undefined && { promotional_enabled }),
          ...(event_announcements_enabled !== undefined && { event_announcements_enabled }),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating preferences:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update notification preferences' },
        { status: 500 }
      );
    }

    console.log('✅ Notification preferences updated successfully for user:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        push_enabled: data.push_enabled,
        email_enabled: data.email_enabled,
        sms_enabled: data.sms_enabled,
        order_updates_enabled: data.order_updates_enabled,
        promotional_enabled: data.promotional_enabled,
        event_announcements_enabled: data.event_announcements_enabled,
      },
    });
  } catch (error) {
    console.error('❌ Update preferences error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
