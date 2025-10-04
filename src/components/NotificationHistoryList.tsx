'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Bell, 
  ShoppingBag, 
  Calendar, 
  Check, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Filter,
  Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NotificationHistory {
  id: string
  title: string
  body: string
  notification_type: string
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null
  clicked_at: string | null
  delivery_status: string | null
  action_url: string | null
  icon_url: string | null
  image_url: string | null
  created_at: string | null
}

type FilterType = 'all' | 'order_status' | 'promotional' | 'event_announcement'

export default function NotificationHistoryList() {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [error, setError] = useState<string | null>(null)

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = getSupabaseClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      // Query notification history
      let query = supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      // Apply filter
      if (filter !== 'all') {
        query = query.eq('notification_type', filter)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        console.error('Error loading notification history:', queryError)
        setError('Failed to load notification history')
        return
      }

      setNotifications(data || [])
    } catch (_error) {
      console.error('Error in loadNotifications:', _error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      const supabase = getSupabaseClient()
      const { error: updateError } = await supabase
        .from('notification_history')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (updateError) {
        console.error('Error marking notification as read:', updateError)
        return
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      )
    } catch (_error) {
      console.error('Error in markAsRead:', _error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return <ShoppingBag className="h-5 w-5 text-neonCyan" />
      case 'promotional':
        return <Bell className="h-5 w-5 text-neonPink" />
      case 'event_announcement':
        return <Calendar className="h-5 w-5 text-purple-400" />
      default:
        return <Bell className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (notification: NotificationHistory) => {
    if (notification.clicked_at) {
      return (
        <Badge className="bg-green-600 text-white flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Clicked
        </Badge>
      )
    }
    if (notification.read_at) {
      return (
        <Badge className="bg-blue-600 text-white flex items-center gap-1">
          <Check className="h-3 w-3" />
          Read
        </Badge>
      )
    }
    if (notification.delivered_at) {
      return (
        <Badge className="bg-yellow-600 text-white flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Delivered
        </Badge>
      )
    }
    if (notification.delivery_status === 'failed') {
      return (
        <Badge className="bg-red-600 text-white flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="border-gray-500 text-gray-400">
        Sent
      </Badge>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  const filterOptions = [
    { value: 'all' as FilterType, label: 'All Notifications', icon: Bell },
    { value: 'order_status' as FilterType, label: 'Order Updates', icon: ShoppingBag },
    { value: 'promotional' as FilterType, label: 'Promotions', icon: Bell },
    { value: 'event_announcement' as FilterType, label: 'Events', icon: Calendar },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-neonCyan animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-2">{error}</p>
        <Button
          onClick={loadNotifications}
          className="bg-neonCyan text-black hover:bg-cyan-400"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-400 mr-2">
          <Filter className="h-4 w-4" />
          Filter:
        </div>
        {filterOptions.map((option) => {
          const Icon = option.icon
          return (
            <Button
              key={option.value}
              onClick={() => setFilter(option.value)}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              className={
                filter === option.value
                  ? 'bg-neonCyan text-black hover:bg-cyan-400'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }
            >
              <Icon className="h-4 w-4 mr-1" />
              {option.label}
            </Button>
          )
        })}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No notifications yet</p>
          <p className="text-sm text-gray-500">
            {filter === 'all'
              ? 'Your notification history will appear here'
              : `No ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()} found`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border transition-all ${
                notification.read_at
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-750 border-neonCyan/30 shadow-sm shadow-neonCyan/10'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-white text-sm">
                        {notification.title}
                      </h4>
                      {getStatusBadge(notification)}
                    </div>

                    <p className="text-sm text-gray-300 mb-2">
                      {notification.body}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.sent_at || notification.created_at)}
                      </p>

                      <div className="flex items-center gap-2">
                        {!notification.read_at && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-neonCyan hover:text-cyan-400 hover:bg-gray-700"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        {notification.action_url && (
                          <Button
                            onClick={() => {
                              markAsRead(notification.id)
                              window.open(notification.action_url!, '_blank')
                            }}
                            size="sm"
                            className="h-7 text-xs bg-neonCyan text-black hover:bg-cyan-400"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {notifications.length >= 50 && (
        <div className="text-center">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
