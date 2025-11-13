'use client'

/**
 * Admin Notifications Tab Component
 * Allows admins to send broadcast notifications to customers/staff
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, Send, Users, CheckCircle, AlertCircle, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSupabaseClient } from '@/lib/supabase-client'
import NotificationHistoryView from './NotificationHistoryView'

interface BroadcastPayload {
  title: string
  body: string
  target_audience: 'all' | 'customers' | 'staff'
}

export default function AdminNotificationsTab() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetAudience, setTargetAudience] = useState<'all' | 'customers' | 'staff'>('all')
  const [isSending, setIsSending] = useState(false)
  const [lastResult, setLastResult] = useState<{
    success: boolean
    message: string
    recipientCount?: number
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose')

  const handleSendNow = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter both title and message')
      return
    }

    // Verify client-side authentication first
    console.log('🔍 Checking client auth state...')
    const supabase = getSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    console.log('🔍 Client session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      error: sessionError?.message
    })

    if (!session) {
      toast.error('You are not logged in. Please refresh the page.')
      return
    }

    setIsSending(true)
    setLastResult(null)

    try {
      const payload: BroadcastPayload = {
        title: title.trim(),
        body: body.trim(),
        target_audience: targetAudience,
      }

      console.log('📤 Sending broadcast request...', payload)

      const response = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      console.log('📥 Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send notification')
      }

      const data = await response.json()

      setLastResult({
        success: true,
        message: `Notification sent to ${data.recipientCount || 0} users`,
        recipientCount: data.recipientCount,
      })

      toast.success(`📣 Broadcast sent to ${data.recipientCount || 0} users!`, {
        duration: 5000,
      })

      // Clear form
      setTitle('')
      setBody('')
    } catch (error) {
      console.error('Failed to send broadcast:', error)

      setLastResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send notification',
      })

      toast.error('Failed to send broadcast notification')
    } finally {
      setIsSending(false)
    }
  }

  const getAudienceDescription = () => {
    switch (targetAudience) {
      case 'all':
        return 'All users with notifications enabled'
      case 'customers':
        return 'Only customers (non-staff users)'
      case 'staff':
        return 'Only staff and admin users'
      default:
        return ''
    }
  }

  const getCharacterCount = (text: string) => {
    return text.length
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <Button
          onClick={() => setActiveTab('compose')}
          variant={activeTab === 'compose' ? 'default' : 'ghost'}
          className={activeTab === 'compose' ? 'bg-neonCyan text-black hover:bg-cyan-400' : 'text-gray-400 hover:text-white'}
        >
          <Send className="h-4 w-4 mr-2" />
          Compose Broadcast
        </Button>
        <Button
          onClick={() => setActiveTab('history')}
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          className={activeTab === 'history' ? 'bg-neonPink text-black hover:bg-pink-400' : 'text-gray-400 hover:text-white'}
        >
          <History className="h-4 w-4 mr-2" />
          Broadcast History
        </Button>
      </div>

      {/* Compose Tab Content */}
      {activeTab === 'compose' && (
        <>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Send Broadcast Notification</h2>
        <p className="text-gray-400">
          Send push notifications to users. Messages are sent to all users with notifications enabled.
        </p>
      </div>

      {/* Composer Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-neonCyan" />
            Compose Notification
          </CardTitle>
          <CardDescription className="text-gray-400">
            Create a notification message to send to your users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Notification Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Special Offer Today!"
              maxLength={100}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400">
              {getCharacterCount(title)}/100 characters
            </p>
          </div>

          {/* Body Textarea */}
          <div className="space-y-2">
            <Label htmlFor="body" className="text-white">
              Message <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your notification message here..."
              rows={4}
              maxLength={500}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 resize-none"
            />
            <p className="text-xs text-gray-400">
              {getCharacterCount(body)}/500 characters
            </p>
          </div>

          {/* Target Audience Selector */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Users className="h-4 w-4" />
              Target Audience
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => setTargetAudience('all')}
                variant={targetAudience === 'all' ? 'default' : 'outline'}
                className={
                  targetAudience === 'all'
                    ? 'bg-neonCyan text-darkBg hover:bg-neonCyan/90'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }
              >
                All Users
              </Button>
              <Button
                onClick={() => setTargetAudience('customers')}
                variant={targetAudience === 'customers' ? 'default' : 'outline'}
                className={
                  targetAudience === 'customers'
                    ? 'bg-neonCyan text-darkBg hover:bg-neonCyan/90'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }
              >
                Customers
              </Button>
              <Button
                onClick={() => setTargetAudience('staff')}
                variant={targetAudience === 'staff' ? 'default' : 'outline'}
                className={
                  targetAudience === 'staff'
                    ? 'bg-neonCyan text-darkBg hover:bg-neonCyan/90'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }
              >
                Staff Only
              </Button>
            </div>
            <p className="text-xs text-gray-400">{getAudienceDescription()}</p>
          </div>

          {/* Last Result Display */}
          {lastResult && (
            <Alert
              className={
                lastResult.success
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-red-500/50 bg-red-500/10'
              }
            >
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className="text-white">
                {lastResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={handleSendNow}
              disabled={isSending || !title.trim() || !body.trim()}
              className="w-full bg-neonCyan text-darkBg font-bold hover:bg-neonCyan/90 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(title || body) && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Notification Preview</CardTitle>
            <CardDescription className="text-gray-400">
              How your notification will appear to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 max-w-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-neonCyan/20 rounded-full flex items-center justify-center">
                  <Bell className="h-5 w-5 text-neonCyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-white font-semibold text-sm">
                      {title || 'Notification Title'}
                    </h4>
                    <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/50 text-xs">
                      now
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm break-words">
                    {body || 'Your notification message will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">📋 Broadcast Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-400">
          <p>• Notifications are sent only to users who have enabled push notifications</p>
          <p>• Keep messages clear and concise for better engagement</p>
          <p>• Test notifications are recommended before sending to all users</p>
          <p>• Users can disable notifications in their account settings</p>
        </CardContent>
      </Card>
        </>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && <NotificationHistoryView />}
    </div>
  )
}
