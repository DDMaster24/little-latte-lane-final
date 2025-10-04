/**
 * Scheduled Notifications Processor API
 * Processes and sends scheduled broadcast notifications
 * This endpoint should be called by a cron job or scheduled task
 */

import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'
import webpush from 'web-push'

// Configure web-push with VAPID details
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:support@littlelattelane.co.za',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function POST() {
  try {
    const supabase = await getSupabaseServer()
    
    console.log('🕒 Starting scheduled notification processor...')

    // Get all scheduled broadcasts that are due
    const { data: scheduledBroadcasts, error: queryError } = await supabase
      .from('broadcast_messages')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })

    if (queryError) {
      console.error('❌ Error querying scheduled broadcasts:', queryError)
      return NextResponse.json(
        { success: false, error: 'Failed to query scheduled broadcasts' },
        { status: 500 }
      )
    }

    if (!scheduledBroadcasts || scheduledBroadcasts.length === 0) {
      console.log('✅ No scheduled broadcasts due for processing')
      return NextResponse.json({
        success: true,
        message: 'No scheduled broadcasts to process',
        processedCount: 0,
      })
    }

    console.log(`📋 Found ${scheduledBroadcasts.length} scheduled broadcast(s) to process`)

    const results = []

    // Process each scheduled broadcast
    for (const broadcast of scheduledBroadcasts) {
      try {
        console.log(`📣 Processing broadcast: ${broadcast.title}`)

        // Update status to 'sending'
        await supabase
          .from('broadcast_messages')
          .update({ status: 'sending' })
          .eq('id', broadcast.id)

        // Get target users with active push subscriptions
        let query = supabase
          .from('notifications')
          .select('user_id, push_subscription, profiles!inner(is_staff, is_admin)')
          .eq('push_enabled', true)
          .not('push_subscription', 'is', null)

        // Filter by audience
        if (broadcast.target_audience === 'customers') {
          query = query
            .eq('profiles.is_staff', false)
            .eq('profiles.is_admin', false)
        } else if (broadcast.target_audience === 'staff') {
          query = query.or('profiles.is_staff.eq.true,profiles.is_admin.eq.true')
        }

        const { data: recipients, error: recipientsError } = await query

        if (recipientsError) {
          console.error(`❌ Failed to fetch recipients for ${broadcast.id}:`, recipientsError)
          
          // Mark broadcast as failed
          await supabase
            .from('broadcast_messages')
            .update({
              status: 'failed',
              error_message: `Failed to fetch recipients: ${recipientsError.message}`,
            })
            .eq('id', broadcast.id)

          results.push({
            broadcastId: broadcast.id,
            success: false,
            error: 'Failed to fetch recipients',
          })
          continue
        }

        if (!recipients || recipients.length === 0) {
          console.log(`⚠️ No active recipients found for broadcast ${broadcast.id}`)
          
          // Update broadcast as sent but with 0 recipients
          await supabase
            .from('broadcast_messages')
            .update({
              status: 'sent',
              recipient_count: 0,
              delivered_count: 0,
              sent_at: new Date().toISOString(),
            })
            .eq('id', broadcast.id)

          results.push({
            broadcastId: broadcast.id,
            success: true,
            recipientCount: 0,
            deliveredCount: 0,
          })
          continue
        }

        console.log(`👥 Sending to ${recipients.length} recipient(s)`)

        // Send notifications to all recipients
        const sendPromises = recipients.map(async (recipient: {user_id: string; push_subscription: unknown}) => {
          try {
            const subscription = recipient.push_subscription as unknown as webpush.PushSubscription

            const notificationPayload = JSON.stringify({
              title: broadcast.title,
              body: broadcast.body,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              image: broadcast.image_url || null,
              data: {
                notification_type: 'broadcast',
                category: 'announcement',
                action_url: '/',
                broadcast_id: broadcast.id,
              },
            })

            await webpush.sendNotification(subscription, notificationPayload)

            // Record successful delivery in notification_history
            await supabase.from('notification_history').insert({
              user_id: recipient.user_id,
              notification_type: 'broadcast',
              category: 'announcement',
              title: broadcast.title,
              body: broadcast.body,
              image_url: broadcast.image_url || null,
              delivery_method: ['push'],
              delivery_status: 'delivered',
              sent_at: new Date().toISOString(),
              delivered_at: new Date().toISOString(),
              data: {
                broadcast_id: broadcast.id,
              },
            })

            return { success: true, userId: recipient.user_id }
          } catch (error) {
            console.error(`❌ Failed to send to user ${recipient.user_id}:`, error)

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

              console.log(`🗑️ Removed invalid subscription for user ${recipient.user_id}`)
            }

            // Record failed delivery
            await supabase.from('notification_history').insert({
              user_id: recipient.user_id,
              notification_type: 'broadcast',
              category: 'announcement',
              title: broadcast.title,
              body: broadcast.body,
              delivery_method: ['push'],
              delivery_status: 'failed',
              sent_at: new Date().toISOString(),
              data: {
                broadcast_id: broadcast.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            })

            return { success: false, userId: recipient.user_id }
          }
        })

        const sendResults = await Promise.all(sendPromises)
        const successCount = sendResults.filter((r) => r.success).length

        // Update broadcast record with final counts
        await supabase
          .from('broadcast_messages')
          .update({
            status: 'sent',
            recipient_count: recipients.length,
            delivered_count: successCount,
            sent_at: new Date().toISOString(),
          })
          .eq('id', broadcast.id)

        console.log(`✅ Broadcast ${broadcast.id} sent: ${successCount}/${recipients.length} delivered`)

        results.push({
          broadcastId: broadcast.id,
          success: true,
          recipientCount: recipients.length,
          deliveredCount: successCount,
        })
      } catch (error) {
        console.error(`❌ Error processing broadcast ${broadcast.id}:`, error)

        // Mark broadcast as failed
        await supabase
          .from('broadcast_messages')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', broadcast.id)

        results.push({
          broadcastId: broadcast.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const successfulBroadcasts = results.filter((r) => r.success).length
    const totalRecipients = results.reduce((sum, r) => sum + (r.recipientCount || 0), 0)
    const totalDelivered = results.reduce((sum, r) => sum + (r.deliveredCount || 0), 0)

    console.log(`🎉 Processed ${scheduledBroadcasts.length} broadcast(s):`)
    console.log(`   ✅ ${successfulBroadcasts} successful`)
    console.log(`   👥 ${totalRecipients} total recipients`)
    console.log(`   📨 ${totalDelivered} delivered`)

    return NextResponse.json({
      success: true,
      message: 'Scheduled broadcasts processed successfully',
      processedCount: scheduledBroadcasts.length,
      successfulCount: successfulBroadcasts,
      totalRecipients,
      totalDelivered,
      results,
    })
  } catch (error) {
    console.error('❌ Scheduled processor error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
