/**
 * Broadcast Notifications API Endpoint
 * Handles sending notifications to multiple users based on audience selection
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import webpush from 'web-push'
import { checkRateLimit, getClientIdentifier, RateLimitPresets, getRateLimitHeaders } from '@/lib/rate-limit'

// Configure web-push with VAPID details
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@littlelattelane.co.za',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

interface BroadcastPayload {
  title: string
  body: string
  image_url?: string
  target_audience: 'all' | 'customers' | 'staff'
  scheduled_for?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()

    // Verify admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Apply rate limiting for notifications
    const identifier = getClientIdentifier(request, user?.id);
    const rateLimitResult = checkRateLimit(identifier, {
      id: 'notifications-broadcast',
      ...RateLimitPresets.NOTIFICATIONS,
    });

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.resetAt).toISOString();
      return NextResponse.json(
        {
          error: 'Too many notification requests. Please try again later.',
          resetAt: resetTime,
        },
        {
          status: 429,
          headers: getRateLimitHeaders({
            ...rateLimitResult,
            limit: RateLimitPresets.NOTIFICATIONS.limit,
          }),
        }
      );
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const payload: BroadcastPayload = await request.json()

    // Validate payload
    if (!payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    // If scheduled, create broadcast record and return
    if (payload.scheduled_for) {
      const scheduledDate = new Date(payload.scheduled_for)
      
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      }

      const { data: broadcastMessage, error: insertError } = await supabase
        .from('broadcast_messages')
        .insert({
          created_by: user.id,
          title: payload.title,
          body: payload.body,
          image_url: payload.image_url || null,
          target_audience: payload.target_audience,
          scheduled_for: scheduledDate.toISOString(),
          status: 'scheduled',
        })
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create scheduled broadcast:', insertError)
        return NextResponse.json(
          { error: 'Failed to schedule broadcast' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Broadcast scheduled successfully',
        broadcastId: broadcastMessage.id,
        scheduledFor: scheduledDate.toISOString(),
      })
    }

    // Immediate send - Get target users with active push subscriptions
    let query = supabase
      .from('notifications')
      .select('user_id, push_subscription, profiles!inner(is_staff, is_admin)')
      .eq('push_enabled', true)
      .not('push_subscription', 'is', null)

    // Filter by audience
    if (payload.target_audience === 'customers') {
      query = query
        .eq('profiles.is_staff', false)
        .eq('profiles.is_admin', false)
    } else if (payload.target_audience === 'staff') {
      query = query.or('profiles.is_staff.eq.true,profiles.is_admin.eq.true')
    }

    const { data: recipients, error: recipientsError } = await query

    if (recipientsError) {
      console.error('Failed to fetch recipients:', recipientsError)
      return NextResponse.json(
        { error: 'Failed to fetch recipients' },
        { status: 500 }
      )
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with active subscriptions found',
        recipientCount: 0,
        deliveredCount: 0,
      })
    }

    console.log(`📣 Broadcasting to ${recipients.length} recipients`)

    // Create broadcast message record
    const { data: broadcastMessage, error: broadcastError } = await supabase
      .from('broadcast_messages')
      .insert({
        created_by: user.id,
        title: payload.title,
        body: payload.body,
        image_url: payload.image_url || null,
        target_audience: payload.target_audience,
        recipient_count: recipients.length,
        status: 'sending',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (broadcastError) {
      console.error('Failed to create broadcast record:', broadcastError)
      return NextResponse.json(
        { error: 'Failed to create broadcast record' },
        { status: 500 }
      )
    }

    // Send notifications to all recipients
    const sendPromises = recipients.map(async (recipient: {user_id: string; push_subscription: unknown}) => {
      try {
        const subscription = recipient.push_subscription as unknown as webpush.PushSubscription

        const notificationPayload = JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          image: payload.image_url || null,
          data: {
            notification_type: 'broadcast',
            category: 'announcement',
            action_url: '/',
            broadcast_id: broadcastMessage.id,
          },
        })

        await webpush.sendNotification(subscription, notificationPayload)

        // Record successful delivery in notification_history
        await supabase.from('notification_history').insert({
          user_id: recipient.user_id,
          notification_type: 'broadcast',
          category: 'announcement',
          title: payload.title,
          body: payload.body,
          image_url: payload.image_url || null,
          delivery_method: ['push'],
          delivery_status: 'delivered',
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
          data: {
            broadcast_id: broadcastMessage.id,
          },
        })

        return { success: true, userId: recipient.user_id }
      } catch (error) {
        console.error(
          `Failed to send to user ${recipient.user_id}:`,
          error
        )

        // Check if subscription is invalid (410 Gone or 404 Not Found)
        if (
          error instanceof Error &&
          (error.message.includes('410') || error.message.includes('404'))
        ) {
          // Remove invalid subscription
          await supabase
            .from('notifications')
            .update({
              push_subscription: null,
              push_enabled: false,
            })
            .eq('user_id', recipient.user_id)

          console.log(
            `Removed invalid subscription for user ${recipient.user_id}`
          )
        }

        // Record failed delivery
        await supabase.from('notification_history').insert({
          user_id: recipient.user_id,
          notification_type: 'broadcast',
          category: 'announcement',
          title: payload.title,
          body: payload.body,
          delivery_method: ['push'],
          delivery_status: 'failed',
          sent_at: new Date().toISOString(),
          data: {
            broadcast_id: broadcastMessage.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        })

        return { success: false, userId: recipient.user_id }
      }
    })

    const results = await Promise.all(sendPromises)
    const deliveredCount = results.filter((r: {success: boolean; userId: string}) => r.success).length

    // Update broadcast message with delivery stats
    await supabase
      .from('broadcast_messages')
      .update({
        delivered_count: deliveredCount,
        status: 'sent',
      })
      .eq('id', broadcastMessage.id)

    console.log(
      `✅ Broadcast complete: ${deliveredCount}/${recipients.length} delivered`
    )

    return NextResponse.json({
      success: true,
      message: 'Broadcast sent successfully',
      recipientCount: recipients.length,
      deliveredCount,
      broadcastId: broadcastMessage.id,
    })
  } catch (error) {
    console.error('Broadcast API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
