'use client'

/**
 * Notification Permission Prompt Component
 * Modal/banner that asks users to enable push notifications
 */

import { useState, useEffect } from 'react'
import { Bell, Check, AlertCircle } from 'lucide-react'
import {
  checkPushSupport,
  getNotificationPermission,
  subscribeToPush,
  type PushSubscriptionResponse
} from '@/lib/pushNotificationHelpers'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface NotificationPermissionPromptProps {
  /** Show the prompt automatically on mount */
  autoShow?: boolean
  /** Callback when permission is granted */
  onPermissionGranted?: () => void
  /** Callback when prompt is dismissed */
  onDismiss?: () => void
  /** Custom trigger element (if not using autoShow) */
  trigger?: React.ReactNode
}

export function NotificationPermissionPrompt({
  autoShow = false,
  onPermissionGranted,
  onDismiss,
  trigger
}: NotificationPermissionPromptProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)
  const [pushSupported, setPushSupported] = useState(true)

  useEffect(() => {
    // Check if push notifications are supported
    const support = checkPushSupport()
    setPushSupported(support.supported)

    if (!support.supported) {
      setMessage({
        type: 'error',
        text: support.reason || 'Push notifications not supported'
      })
    }

    // Auto-show if enabled and not already granted/denied
    if (autoShow && support.supported) {
      const permission = getNotificationPermission()
      
      // CRITICAL FIX: Check actual permission status, not localStorage
      // This ensures prompt shows after app reinstall/permission reset
      if (permission === 'default') {
        // Check if user permanently dismissed (different from temporary dismiss)
        const neverAsk = localStorage.getItem('notification-prompt-never')
        if (neverAsk === 'true') {
          return // User clicked "Don't Ask Again"
        }
        
        // Always show if permission is 'default' (not yet decided)
        // Remove the 7-day throttle to ensure prompt shows after reinstall
        setIsOpen(true)
      }
    }
  }, [autoShow])

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result: PushSubscriptionResponse = await subscribeToPush()

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        })
        
        // Close dialog after short delay
        setTimeout(() => {
          setIsOpen(false)
          onPermissionGranted?.()
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: result.message
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to enable notifications'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    // Store dismissal timestamp
    localStorage.setItem('notification-prompt-dismissed', new Date().toISOString())
    setIsOpen(false)
    onDismiss?.()
  }

  const handleNeverAsk = () => {
    // Store permanent dismissal
    localStorage.setItem('notification-prompt-never', 'true')
    setIsOpen(false)
    onDismiss?.()
  }

  // If trigger provided, use controlled mode
  if (trigger) {
    return (
      <>
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
        <NotificationDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onEnable={handleEnableNotifications}
          onDismiss={handleDismiss}
          onNeverAsk={handleNeverAsk}
          isLoading={isLoading}
          message={message}
          pushSupported={pushSupported}
        />
      </>
    )
  }

  // Auto-show mode
  return (
    <NotificationDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onEnable={handleEnableNotifications}
      onDismiss={handleDismiss}
      onNeverAsk={handleNeverAsk}
      isLoading={isLoading}
      message={message}
      pushSupported={pushSupported}
    />
  )
}

function NotificationDialog({
  isOpen,
  onClose,
  onEnable,
  onDismiss,
  onNeverAsk,
  isLoading,
  message,
  pushSupported
}: {
  isOpen: boolean
  onClose: () => void
  onEnable: () => void
  onDismiss: () => void
  onNeverAsk: () => void
  isLoading: boolean
  message: { type: 'success' | 'error' | 'info'; text: string } | null
  pushSupported: boolean
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-darkBg border-neonCyan/20">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neonCyan/10">
            <Bell className="h-8 w-8 text-neonCyan" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-white">
            Stay Updated!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            Enable notifications to get real-time updates about your orders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits list */}
          <div className="space-y-3">
            <BenefitItem
              icon={<Check className="h-5 w-5 text-neonCyan" />}
              text="Know when your order is being prepared"
            />
            <BenefitItem
              icon={<Check className="h-5 w-5 text-neonCyan" />}
              text="Get notified when your order is ready"
            />
            <BenefitItem
              icon={<Check className="h-5 w-5 text-neonCyan" />}
              text="Receive exclusive offers and promotions"
            />
            <BenefitItem
              icon={<Check className="h-5 w-5 text-neonCyan" />}
              text="Stay informed about special events"
            />
          </div>

          {/* Message display */}
          {message && (
            <Alert
              className={
                message.type === 'success'
                  ? 'border-green-500/50 bg-green-500/10'
                  : message.type === 'error'
                  ? 'border-red-500/50 bg-red-500/10'
                  : 'border-blue-500/50 bg-blue-500/10'
              }
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white">
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Not supported warning */}
          {!pushSupported && (
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-white">
                Your browser doesn&apos;t support push notifications. Please try using a modern browser like Chrome, Firefox, or Safari.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onEnable}
            disabled={isLoading || !pushSupported || message?.type === 'success'}
            className="w-full bg-neonCyan text-darkBg font-bold hover:bg-neonCyan/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Enabling...
              </>
            ) : message?.type === 'success' ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Enabled!
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Enable Notifications
              </>
            )}
          </Button>
          
          <div className="flex w-full gap-2">
            <Button
              onClick={onDismiss}
              variant="outline"
              className="flex-1 border-gray-600 text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              Maybe Later
            </Button>
            <Button
              onClick={onNeverAsk}
              variant="ghost"
              className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              Don&apos;t Ask Again
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <p className="text-sm text-gray-300">{text}</p>
    </div>
  )
}

/**
 * Compact notification toggle for settings pages
 */
export function NotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check current subscription status
    const checkStatus = async () => {
      const permission = getNotificationPermission()
      setIsSubscribed(permission === 'granted')
    }
    checkStatus()
  }, [])

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (isSubscribed) {
        // Unsubscribe logic would go here
        // For now, just show info
        alert('To disable notifications, please use your browser settings')
      } else {
        const result = await subscribeToPush()
        if (result.success) {
          setIsSubscribed(true)
        }
      }
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isSubscribed ? 'outline' : 'default'}
      className={
        isSubscribed
          ? 'border-green-500 text-green-500 hover:bg-green-500/10'
          : 'bg-neonCyan text-darkBg hover:bg-neonCyan/90'
      }
    >
      {isLoading ? (
        'Loading...'
      ) : isSubscribed ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Notifications Enabled
        </>
      ) : (
        <>
          <Bell className="mr-2 h-4 w-4" />
          Enable Notifications
        </>
      )}
    </Button>
  )
}
