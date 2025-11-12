'use client'

/**
 * Notification Settings Panel Component
 * Allows users to manage their notification preferences
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Bell, BellOff, TestTube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  checkPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/pushNotificationHelpers'

interface NotificationPreferences {
  push_enabled: boolean
  email_enabled: boolean
  sms_enabled: boolean
  order_updates_enabled: boolean
  promotional_enabled: boolean
  event_announcements_enabled: boolean
}

export default function NotificationSettingsPanel() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: false,
    email_enabled: false,
    sms_enabled: false,
    order_updates_enabled: true,
    promotional_enabled: true,
    event_announcements_enabled: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // Check push subscription status
      const subscriptionStatus = await checkPushSubscription()
      setIsSubscribed(subscriptionStatus.subscribed)

      // Load preferences from API
      const preferencesResult = await getNotificationPreferences()
      if (preferencesResult.success && preferencesResult.preferences) {
        setPreferences(preferencesResult.preferences)
      }
    } catch (_error) {
      console.error('Failed to load notification settings:', _error)
      toast.error('Failed to load notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePushToggle = async () => {
    setIsSaving(true)
    try {
      if (isSubscribed) {
        const result = await unsubscribeFromPush()
        if (result.success) {
          setIsSubscribed(false)
          toast.success('Push notifications disabled')
        } else {
          toast.error(result.message)
        }
      } else {
        const result = await subscribeToPush()
        if (result.success) {
          setIsSubscribed(true)
          toast.success('Push notifications enabled!')
        } else {
          toast.error(result.message)
        }
      }
    } catch (_error) {
      toast.error('Failed to update push notification settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferenceChange = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    // Optimistic update
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)

    setIsSaving(true)
    try {
      const result = await updateNotificationPreferences({ [key]: value })
      if (!result.success) {
        // Revert on failure
        setPreferences(preferences)
        toast.error(result.message)
      } else {
        toast.success('Preference updated')
      }
    } catch (_error) {
      // Revert on error
      setPreferences(preferences)
      toast.error('Failed to update preference')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestNotification = async () => {
    if (!isSubscribed) {
      toast.error('Please enable push notifications first')
      return
    }

    setIsSaving(true)
    try {
      const result = await sendTestNotification()
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (_error) {
      toast.error('Failed to send test notification')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-neonCyan animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Push Notification Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isSubscribed ? (
            <Bell className="h-6 w-6 text-green-500 flex-shrink-0" />
          ) : (
            <BellOff className="h-6 w-6 text-gray-500 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm sm:text-base">
              Push Notifications
            </h4>
            <p className="text-xs sm:text-sm text-gray-400">
              {isSubscribed
                ? 'Enable to receive real-time updates'
                : 'Disabled'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
          <Badge
            className={`text-xs ${
              isSubscribed
                ? 'bg-green-600/20 text-green-300 border-green-600/50'
                : 'bg-gray-600/20 text-gray-300 border-gray-600/50'
            }`}
          >
            {isSubscribed ? 'Enabled' : 'Disabled'}
          </Badge>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handlePushToggle}
            className="data-[state=checked]:bg-neonCyan"
          />
        </div>
      </div>

        {/* Notification Channels */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm sm:text-base">Notification Channels</h4>
          
          {/* Push Enabled */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-3 sm:p-4 bg-gray-900/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <Label htmlFor="push_enabled" className="text-white font-medium text-sm">
                Push Notifications
              </Label>
              <p className="text-xs sm:text-sm text-gray-400">
                Receive notifications in your browser
              </p>
            </div>
            <Switch
              checked={preferences.push_enabled}
              onCheckedChange={(checked) =>
                handlePreferenceChange('push_enabled', checked)
              }
              className="data-[state=checked]:bg-neonCyan self-end xs:self-center"
            />
          </div>

          {/* Email Enabled */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-3 sm:p-4 bg-gray-900/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <Label htmlFor="email_enabled" className="text-white font-medium text-sm">
                Email Notifications
              </Label>
              <p className="text-xs sm:text-sm text-gray-400">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.email_enabled}
              onCheckedChange={(checked) =>
                handlePreferenceChange('email_enabled', checked)
              }
              className="data-[state=checked]:bg-neonCyan self-end xs:self-center"
            />
          </div>

          {/* SMS Enabled */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-3 sm:p-4 bg-gray-900/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <Label htmlFor="sms_enabled" className="text-white font-medium text-sm">
                SMS Notifications
              </Label>
              <p className="text-xs sm:text-sm text-gray-400">
                Receive notifications via text message
              </p>
            </div>
            <Switch
              checked={preferences.sms_enabled}
              onCheckedChange={(checked) =>
                handlePreferenceChange('sms_enabled', checked)
              }
              className="data-[state=checked]:bg-neonCyan self-end xs:self-center"
            />
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4 pt-4 border-t border-gray-700">
          <h4 className="text-white font-semibold text-sm sm:text-base">Notification Types</h4>
          
          {/* Order Updates */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-3 sm:p-4 bg-gray-900/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <Label htmlFor="order_updates" className="text-white font-medium text-sm">
                Order Updates
              </Label>
              <p className="text-xs sm:text-sm text-gray-400">
                Get notified when your order is being prepared and ready
              </p>
            </div>
            <Switch
              checked={preferences.order_updates_enabled}
              onCheckedChange={(checked) =>
                handlePreferenceChange('order_updates_enabled', checked)
              }
              className="data-[state=checked]:bg-neonCyan self-end xs:self-center"
            />
          </div>

          {/* Promotional */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-3 sm:p-4 bg-gray-900/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <Label htmlFor="promotional" className="text-white font-medium text-sm">
                Promotions & Offers
              </Label>
              <p className="text-xs sm:text-sm text-gray-400">
                Receive exclusive deals and special offers
              </p>
            </div>
            <Switch
              checked={preferences.promotional_enabled}
              onCheckedChange={(checked) =>
                handlePreferenceChange('promotional_enabled', checked)
              }
              className="data-[state=checked]:bg-neonCyan self-end xs:self-center"
            />
          </div>

          {/* Event Announcements */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-3 sm:p-4 bg-gray-900/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <Label
                htmlFor="events"
                className="text-white font-medium text-sm"
              >
                Event Announcements
              </Label>
              <p className="text-xs sm:text-sm text-gray-400">
                Stay informed about special events and news
              </p>
            </div>
            <Switch
              checked={preferences.event_announcements_enabled}
              onCheckedChange={(checked) =>
                handlePreferenceChange('event_announcements_enabled', checked)
              }
              className="data-[state=checked]:bg-neonCyan self-end xs:self-center"
            />
          </div>
        </div>

        {/* Test Notification Button */}
        {isSubscribed && (
          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={handleTestNotification}
              disabled={isSaving}
              variant="outline"
              className="w-full border-neonCyan text-neonCyan hover:bg-neonCyan/20 text-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Send Test Notification
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info Alert */}
        {!isSubscribed && (
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-white text-xs sm:text-sm">
              Enable push notifications to receive real-time updates about your orders.
              You can customize which types of notifications you want to receive above.
            </AlertDescription>
          </Alert>
        )}

        {isSubscribed && preferences.push_enabled && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-white text-xs sm:text-sm">
              You&apos;re all set! You&apos;ll receive notifications based on your preferences.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }
