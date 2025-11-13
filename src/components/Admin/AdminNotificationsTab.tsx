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
import { Bell, Send, Clock, Users, Image as ImageIcon, X, CheckCircle, AlertCircle, History } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import NotificationHistoryView from './NotificationHistoryView'

interface BroadcastPayload {
  title: string
  body: string
  image_url?: string
  target_audience: 'all' | 'customers' | 'staff'
  scheduled_for?: string | null
}

export default function AdminNotificationsTab() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [targetAudience, setTargetAudience] = useState<'all' | 'customers' | 'staff'>('all')
  const [scheduledFor, setScheduledFor] = useState<string>('')
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

    setIsSending(true)
    setLastResult(null)

    try {
      const payload: BroadcastPayload = {
        title: title.trim(),
        body: body.trim(),
        image_url: imageUrl.trim() || undefined,
        target_audience: targetAudience,
        scheduled_for: null,
      }

      const response = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for authentication
        body: JSON.stringify(payload),
      })

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
      setImageUrl('')
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

  const handleSchedule = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter both title and message')
      return
    }

    if (!scheduledFor) {
      toast.error('Please select a date and time to schedule')
      return
    }

    const scheduledDate = new Date(scheduledFor)
    if (scheduledDate <= new Date()) {
      toast.error('Scheduled time must be in the future')
      return
    }

    setIsSending(true)
    setLastResult(null)

    try {
      const payload: BroadcastPayload = {
        title: title.trim(),
        body: body.trim(),
        image_url: imageUrl.trim() || undefined,
        target_audience: targetAudience,
        scheduled_for: scheduledDate.toISOString(),
      }

      const response = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for authentication
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to schedule notification')
      }

      await response.json()

      setLastResult({
        success: true,
        message: `Notification scheduled for ${scheduledDate.toLocaleString()}`,
      })

      toast.success('📅 Notification scheduled successfully!', {
        duration: 5000,
      })

      // Clear form
      setTitle('')
      setBody('')
      setImageUrl('')
      setScheduledFor('')
    } catch (error) {
      console.error('Failed to schedule broadcast:', error)
      
      setLastResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to schedule notification',
      })

      toast.error('Failed to schedule notification')
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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="imageUpload" className="text-white flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Upload Image (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  // Validate file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('Image must be less than 5MB')
                    e.target.value = ''
                    return
                  }

                  // Validate file type
                  if (!file.type.startsWith('image/')) {
                    toast.error('Please select an image file')
                    e.target.value = ''
                    return
                  }

                  try {
                    toast.loading('Uploading image...')
                    
                    // Create a unique filename
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
                    const filePath = `notification-images/${fileName}`

                    // Upload to Supabase storage
                    const { getSupabaseClient } = await import('@/lib/supabase-client')
                    const supabase = getSupabaseClient()
                    
                    const { data, error } = await supabase.storage
                      .from('public-assets')
                      .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                      })

                    if (error) {
                      console.error('Upload error:', error)
                      toast.dismiss()
                      toast.error('Failed to upload image: ' + error.message)
                      e.target.value = ''
                      return
                    }

                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                      .from('public-assets')
                      .getPublicUrl(data.path)

                    setImageUrl(publicUrl)
                    toast.dismiss()
                    toast.success('Image uploaded successfully!')
                    e.target.value = '' // Reset file input
                  } catch (error) {
                    console.error('Upload exception:', error)
                    toast.dismiss()
                    toast.error('Failed to upload image')
                    e.target.value = ''
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-neonCyan file:text-black hover:file:bg-cyan-400"
              />
            </div>
            <p className="text-xs text-gray-400">
              Upload an image (max 5MB, JPG/PNG/GIF/WebP)
            </p>
          </div>

          {/* Image URL Input (Alternative) */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-white flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Or Enter Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
              {imageUrl && (
                <Button
                  onClick={() => setImageUrl('')}
                  variant="outline"
                  size="icon"
                  className="border-gray-600 text-gray-400 hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {imageUrl && (
              <div className="mt-2 p-2 bg-gray-700 rounded border border-gray-600">
                <p className="text-xs text-gray-400 mb-2">Image Preview:</p>
                <div className="relative w-full h-40">
                  <Image
                    src={imageUrl}
                    alt="Notification preview"
                    fill
                    className="object-contain rounded"
                    onError={() => {
                      toast.error('Failed to load image')
                    }}
                  />
                </div>
              </div>
            )}
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

          {/* Schedule Section */}
          <div className="space-y-2">
            <Label htmlFor="scheduledFor" className="text-white flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule (Optional)
            </Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400">
              Leave empty to send immediately, or select a date/time to schedule
            </p>
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={handleSendNow}
              disabled={isSending || !title.trim() || !body.trim()}
              className="flex-1 bg-neonCyan text-darkBg font-bold hover:bg-neonCyan/90 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Now
                </>
              )}
            </Button>
            
            {scheduledFor && (
              <Button
                onClick={handleSchedule}
                disabled={isSending || !title.trim() || !body.trim()}
                variant="outline"
                className="flex-1 border-neonPink text-neonPink hover:bg-neonPink/20 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule
                  </>
                )}
              </Button>
            )}
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
                  {imageUrl && (
                    <div className="relative w-full h-32 mt-2">
                      <Image
                        src={imageUrl}
                        alt="Notification"
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  )}
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
          <p>• Keep titles concise and engaging (max 100 characters)</p>
          <p>• Messages should be clear and actionable (max 500 characters)</p>
          <p>• Upload images directly (max 5MB) or provide a public URL (HTTPS recommended)</p>
          <p>• Uploaded images are stored in Supabase storage</p>
          <p>• Scheduled notifications will be sent at the specified time</p>
          <p>• Failed deliveries are logged and can be reviewed in the history</p>
        </CardContent>
      </Card>
        </>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <NotificationHistoryView />
      )}
    </div>
  )
}
