'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Filter,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface BroadcastMessage {
  id: string
  title: string
  body: string
  image_url: string | null
  status: string | null
  target_audience: string | null
  recipient_count: number | null
  delivered_count: number | null
  read_count: number | null
  scheduled_for: string | null
  sent_at: string | null
  created_at: string | null
  created_by: string | null
  error_message: string | null
}

type StatusFilter = 'all' | 'sent' | 'scheduled' | 'failed'
type AudienceFilter = 'all' | 'customers' | 'staff' | 'everyone'

export default function NotificationHistoryView() {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('all')

  const loadBroadcasts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = getSupabaseClient()

      // Query broadcast messages
      let query = supabase
        .from('broadcast_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Apply audience filter
      if (audienceFilter !== 'all') {
        if (audienceFilter === 'everyone') {
          query = query.eq('target_audience', 'all')
        } else {
          query = query.eq('target_audience', audienceFilter)
        }
      }

      const { data, error: queryError } = await query

      if (queryError) {
        console.error('Error loading broadcast history:', queryError)
        setError('Failed to load broadcast history')
        return
      }

      setBroadcasts(data || [])
    } catch (_error) {
      console.error('Error in loadBroadcasts:', _error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, audienceFilter])

  useEffect(() => {
    loadBroadcasts()
  }, [loadBroadcasts])

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-green-600 text-white flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Sent
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge className="bg-blue-600 text-white flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Scheduled
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-600 text-white flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-400">
            Unknown
          </Badge>
        )
    }
  }

  const getAudienceBadge = (audience: string | null) => {
    const colors = {
      all: 'bg-purple-600',
      customers: 'bg-neonCyan',
      staff: 'bg-neonPink',
    }
    const color = colors[audience as keyof typeof colors] || 'bg-gray-600'
    const displayText = audience === 'all' ? 'Everyone' : audience ? (audience.charAt(0).toUpperCase() + audience.slice(1)) : 'Unknown'
    
    return (
      <Badge className={`${color} text-white`}>
        <Users className="h-3 w-3 mr-1" />
        {displayText}
      </Badge>
    )
  }

  const calculateDeliveryRate = (delivered: number | null, total: number | null) => {
    if (!delivered || !total || total === 0) return 0
    return Math.round((delivered / total) * 100)
  }

  const calculateReadRate = (read: number | null, delivered: number | null) => {
    if (!read || !delivered || delivered === 0) return 0
    return Math.round((read / delivered) * 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a')
    } catch {
      return 'Invalid date'
    }
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  const statusOptions = [
    { value: 'all' as StatusFilter, label: 'All Status' },
    { value: 'sent' as StatusFilter, label: 'Sent' },
    { value: 'scheduled' as StatusFilter, label: 'Scheduled' },
    { value: 'failed' as StatusFilter, label: 'Failed' },
  ]

  const audienceOptions = [
    { value: 'all' as AudienceFilter, label: 'All Audiences' },
    { value: 'everyone' as AudienceFilter, label: 'Everyone' },
    { value: 'customers' as AudienceFilter, label: 'Customers' },
    { value: 'staff' as AudienceFilter, label: 'Staff' },
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
          onClick={loadBroadcasts}
          className="bg-neonCyan text-black hover:bg-cyan-400"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Status:</span>
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              variant={statusFilter === option.value ? 'default' : 'outline'}
              size="sm"
              className={
                statusFilter === option.value
                  ? 'bg-neonCyan text-black hover:bg-cyan-400'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Audience Filter */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Audience:</span>
          {audienceOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setAudienceFilter(option.value)}
              variant={audienceFilter === option.value ? 'default' : 'outline'}
              size="sm"
              className={
                audienceFilter === option.value
                  ? 'bg-neonPink text-black hover:bg-pink-400'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Broadcast List */}
      {broadcasts.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No broadcasts found</p>
          <p className="text-sm text-gray-500">
            {statusFilter === 'all' && audienceFilter === 'all'
              ? 'Broadcast history will appear here'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((broadcast) => {
            const isExpanded = expandedIds.has(broadcast.id)
            const deliveryRate = calculateDeliveryRate(broadcast.delivered_count, broadcast.recipient_count)
            const readRate = calculateReadRate(broadcast.read_count, broadcast.delivered_count)

            return (
              <Card key={broadcast.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-white text-base">
                          {broadcast.title}
                        </CardTitle>
                        {getStatusBadge(broadcast.status)}
                        {getAudienceBadge(broadcast.target_audience)}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {broadcast.body}
                      </p>
                    </div>
                    <Button
                      onClick={() => toggleExpanded(broadcast.id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Recipients</p>
                      <p className="text-lg font-bold text-white">
                        {broadcast.recipient_count || 0}
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Delivered</p>
                      <p className="text-lg font-bold text-green-400">
                        {broadcast.delivered_count || 0}
                        <span className="text-xs text-gray-400 ml-1">
                          ({deliveryRate}%)
                        </span>
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Read</p>
                      <p className="text-lg font-bold text-blue-400">
                        {broadcast.read_count || 0}
                        <span className="text-xs text-gray-400 ml-1">
                          ({readRate}%)
                        </span>
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">
                        {broadcast.status === 'scheduled' ? 'Scheduled For' : 'Sent'}
                      </p>
                      <p className="text-sm font-medium text-white">
                        {formatRelativeTime(
                          broadcast.status === 'scheduled' 
                            ? broadcast.scheduled_for 
                            : broadcast.sent_at
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">Created:</p>
                          <p className="text-white">{formatDate(broadcast.created_at)}</p>
                        </div>
                        {broadcast.sent_at && (
                          <div>
                            <p className="text-gray-400 mb-1">Sent:</p>
                            <p className="text-white">{formatDate(broadcast.sent_at)}</p>
                          </div>
                        )}
                        {broadcast.scheduled_for && broadcast.status === 'scheduled' && (
                          <div>
                            <p className="text-gray-400 mb-1">Scheduled For:</p>
                            <p className="text-white">{formatDate(broadcast.scheduled_for)}</p>
                          </div>
                        )}
                        {broadcast.image_url && (
                          <div className="md:col-span-2">
                            <p className="text-gray-400 mb-1">Image URL:</p>
                            <p className="text-neonCyan text-xs break-all">{broadcast.image_url}</p>
                          </div>
                        )}
                      </div>

                      {broadcast.error_message && (
                        <div className="bg-red-900/20 border border-red-600 rounded p-3">
                          <p className="text-red-400 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Error:</span>
                            {broadcast.error_message}
                          </p>
                        </div>
                      )}

                      {/* Performance Indicator */}
                      {broadcast.status === 'sent' && (
                        <div className="bg-gray-700 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Performance</span>
                            <TrendingUp className="h-4 w-4 text-neonCyan" />
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Delivery Rate</span>
                                <span className="text-white font-medium">{deliveryRate}%</span>
                              </div>
                              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500"
                                  style={{ width: `${deliveryRate}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Read Rate</span>
                                <span className="text-white font-medium">{readRate}%</span>
                              </div>
                              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500"
                                  style={{ width: `${readRate}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Load More (placeholder for future pagination) */}
      {broadcasts.length >= 50 && (
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
