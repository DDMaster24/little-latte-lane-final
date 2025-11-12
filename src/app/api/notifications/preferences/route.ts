/**
 * Notification Preferences API
 * Allows users to view and update their notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// TypeScript types for notification preferences
interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  order_updates_enabled: boolean;
  promotional_enabled: boolean;
  event_announcements_enabled: boolean;
}

// Default preferences for new users
const DEFAULT_PREFERENCES: NotificationPreferences = {
  push_enabled: true,
  email_enabled: true,
  sms_enabled: false,
  order_updates_enabled: true,
  promotional_enabled: true,
  event_announcements_enabled: true,
};

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
      console.log('ℹ️ No existing preferences found for user, returning defaults:', user.id);
      return NextResponse.json({
        success: true,
        data: DEFAULT_PREFERENCES,
        isDefault: true, // Flag to indicate these are defaults
      });
    }

    // Merge existing data with defaults to ensure all fields are present
    const preferences: NotificationPreferences = {
      push_enabled: data.push_enabled ?? DEFAULT_PREFERENCES.push_enabled,
      email_enabled: data.email_enabled ?? DEFAULT_PREFERENCES.email_enabled,
      sms_enabled: data.sms_enabled ?? DEFAULT_PREFERENCES.sms_enabled,
      order_updates_enabled: data.order_updates_enabled ?? DEFAULT_PREFERENCES.order_updates_enabled,
      promotional_enabled: data.promotional_enabled ?? DEFAULT_PREFERENCES.promotional_enabled,
      event_announcements_enabled: data.event_announcements_enabled ?? DEFAULT_PREFERENCES.event_announcements_enabled,
    };

    return NextResponse.json({
      success: true,
      data: preferences,
      isDefault: false,
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

    // Validate at least one preference field is being updated
    const hasValidFields = [
      push_enabled,
      email_enabled,
      sms_enabled,
      order_updates_enabled,
      promotional_enabled,
      event_announcements_enabled,
    ].some(field => field !== undefined);

    if (!hasValidFields) {
      return NextResponse.json(
        { success: false, error: 'No valid preference fields provided' },
        { status: 400 }
      );
    }

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

    // Return merged preferences to ensure all fields are present
    const updatedPreferences: NotificationPreferences = {
      push_enabled: data.push_enabled ?? DEFAULT_PREFERENCES.push_enabled,
      email_enabled: data.email_enabled ?? DEFAULT_PREFERENCES.email_enabled,
      sms_enabled: data.sms_enabled ?? DEFAULT_PREFERENCES.sms_enabled,
      order_updates_enabled: data.order_updates_enabled ?? DEFAULT_PREFERENCES.order_updates_enabled,
      promotional_enabled: data.promotional_enabled ?? DEFAULT_PREFERENCES.promotional_enabled,
      event_announcements_enabled: data.event_announcements_enabled ?? DEFAULT_PREFERENCES.event_announcements_enabled,
    };

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedPreferences,
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
