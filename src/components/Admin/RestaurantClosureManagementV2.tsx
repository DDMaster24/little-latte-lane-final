'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  CalendarClock,
  Power, 
  PowerOff,
  Clock,
  AlertTriangle,
  Calendar,
  Trash2,
  Plus
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  useRestaurantClosure, 
  RestaurantClosureManager,
} from '@/hooks/useRestaurantClosure'
import type { Database } from '@/types/supabase'

type RestaurantClosure = Database['public']['Tables']['restaurant_closures']['Row']

export default function RestaurantClosureManagement() {
  const { toast } = useToast()
  const { closureStatus, loading, error, refreshStatus, allClosures, scheduledClosures } = useRestaurantClosure()
  
  // State for manual closure
  const [manualClosureLoading, setManualClosureLoading] = useState(false)
  const [manualReason, setManualReason] = useState('')
  
  // State for new scheduled closure
  const [newClosureReason, setNewClosureReason] = useState('')
  const [newStartDate, setNewStartDate] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndDate, setNewEndDate] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [schedulingLoading, setSchedulingLoading] = useState(false)
  
  // Check if there's an active manual closure
  const activeManualClosure = allClosures.find(c => c.closure_type === 'manual' && c.is_active)
  const isManuallyClosedNow = !!activeManualClosure

  // Handle manual closure toggle
  const handleManualToggle = async () => {
    setManualClosureLoading(true)
    try {
      const newStatus = !isManuallyClosedNow
      const result = await RestaurantClosureManager.setManualClosure(
        newStatus,
        newStatus ? (manualReason || 'Manually closed by administrator') : undefined
      )
      
      if (result.success) {
        toast({
          title: newStatus ? 'Restaurant Closed' : 'Restaurant Opened',
          description: newStatus 
            ? 'Online ordering has been disabled manually'
            : 'Online ordering has been enabled',
          variant: newStatus ? 'destructive' : 'default'
        })
        
        setManualReason('') // Clear reason field
        await refreshStatus()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update closure status',
        variant: 'destructive'
      })
    } finally {
      setManualClosureLoading(false)
    }
  }

  // Handle adding new scheduled closure
  const handleAddScheduledClosure = async () => {
    if (!newStartDate || !newStartTime || !newEndDate || !newEndTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all date and time fields',
        variant: 'destructive'
      })
      return
    }

    if (!newClosureReason.trim()) {
      toast({
        title: 'Missing Reason',
        description: 'Please provide a reason for this closure',
        variant: 'destructive'
      })
      return
    }

    setSchedulingLoading(true)
    try {
      const startDateTime = `${newStartDate}T${newStartTime}:00`
      const endDateTime = `${newEndDate}T${newEndTime}:00`
      
      const startISO = new Date(startDateTime).toISOString()
      const endISO = new Date(endDateTime).toISOString()
      
      // Validate end time is after start time
      if (new Date(endISO) <= new Date(startISO)) {
        throw new Error('End time must be after start time')
      }
      
      const result = await RestaurantClosureManager.scheduleClosure(
        startISO,
        endISO,
        newClosureReason
      )
      
      if (result.success) {
        toast({
          title: 'Closure Scheduled',
          description: `Restaurant will close from ${new Date(startISO).toLocaleString()} to ${new Date(endISO).toLocaleString()}`,
        })
        
        // Clear form
        setNewClosureReason('')
        setNewStartDate('')
        setNewStartTime('')
        setNewEndDate('')
        setNewEndTime('')
        
        await refreshStatus()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to schedule closure',
        variant: 'destructive'
      })
    } finally {
      setSchedulingLoading(false)
    }
  }

  // Handle deleting a scheduled closure
  const handleDeleteClosure = async (closure: RestaurantClosure) => {
    try {
      const result = await RestaurantClosureManager.deleteClosure(closure.id)
      
      if (result.success) {
        toast({
          title: 'Closure Deleted',
          description: 'The scheduled closure has been removed',
        })
        
        await refreshStatus()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete closure',
        variant: 'destructive'
      })
    }
  }

  // Format date for display
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonCyan"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Restaurant Status Management</h2>
        <p className="text-gray-400 text-sm">Control when customers can place online orders</p>
      </div>

      {/* Current Status Banner */}
      <Card className={`border-2 ${
        closureStatus.is_closed 
          ? 'bg-red-500/10 border-red-500/30' 
          : 'bg-green-500/10 border-green-500/30'
      }`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg flex items-center gap-2 ${
            closureStatus.is_closed ? 'text-red-400' : 'text-green-400'
          }`}>
            {closureStatus.is_closed ? (
              <>
                <PowerOff className="h-5 w-5" />
                Restaurant Currently Closed
              </>
            ) : (
              <>
                <Power className="h-5 w-5" />
                Restaurant Currently Open
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className={`font-medium ${closureStatus.is_closed ? 'text-red-300' : 'text-green-300'}`}>
              {closureStatus.is_closed ? 'Online ordering is disabled' : 'Online ordering is active'}
            </p>
            {closureStatus.message && (
              <p className="text-gray-300 text-sm">{closureStatus.message}</p>
            )}
            {closureStatus.reason === 'scheduled' && closureStatus.scheduled_end && (
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Reopens: {formatDateTime(closureStatus.scheduled_end)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Manual Closure Control */}
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400 text-lg flex items-center gap-2">
              <Power className="h-5 w-5" />
              Manual Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Immediate Closure</Label>
                <p className="text-gray-400 text-sm">Toggle restaurant status instantly</p>
              </div>
              <Switch
                checked={isManuallyClosedNow}
                onCheckedChange={manualClosureLoading ? () => {} : handleManualToggle}
                className="data-[state=checked]:bg-red-500"
              />
            </div>
            
            {!isManuallyClosedNow && (
              <div className="space-y-2">
                <Label className="text-white text-sm">Closure Reason (Optional)</Label>
                <Textarea
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="e.g., Emergency maintenance, Staff training..."
                  className="bg-gray-800 border-gray-600 text-white resize-none"
                  rows={2}
                />
              </div>
            )}

            <Button
              onClick={handleManualToggle}
              disabled={manualClosureLoading}
              variant={isManuallyClosedNow ? "default" : "destructive"}
              className="w-full"
            >
              {manualClosureLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : isManuallyClosedNow ? (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  Reopen Restaurant
                </>
              ) : (
                <>
                  <PowerOff className="h-4 w-4 mr-2" />
                  Close Restaurant Now
                </>
              )}
            </Button>

            {isManuallyClosedNow && activeManualClosure && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-300 text-sm font-medium">Active Since:</p>
                <p className="text-red-200 text-xs">{formatDateTime(activeManualClosure.created_at || '')}</p>
                {activeManualClosure.reason && (
                  <p className="text-red-200 text-xs mt-1">Reason: {activeManualClosure.reason}</p>
                )}
              </div>
            )}

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-300 text-xs">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Manual closure overrides any scheduled closures
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Add New Scheduled Closure */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Schedule New Closure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">Reason for Closure</Label>
              <Input
                value={newClosureReason}
                onChange={(e) => setNewClosureReason(e.target.value)}
                placeholder="e.g., Christmas Holiday, Staff Event..."
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-white text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Start Time</Label>
                <Input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">End Date</Label>
                <Input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">End Time</Label>
                <Input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <Button
              onClick={handleAddScheduledClosure}
              disabled={schedulingLoading}
              className="w-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
            >
              {schedulingLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Scheduled Closure
                </>
              )}
            </Button>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-300 text-xs">
                <CalendarClock className="h-3 w-3 inline mr-1" />
                You can schedule multiple closures (holidays, events, etc.)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Closures List */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400 text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Closures ({scheduledClosures.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledClosures.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No scheduled closures. Use the form above to schedule holidays or maintenance periods.
            </p>
          ) : (
            <div className="space-y-3">
              {scheduledClosures.map((closure) => {
                const now = new Date()
                const start = new Date(closure.start_time!)
                const end = new Date(closure.end_time!)
                const isActive = start <= now && end >= now
                const isPast = end < now
                const isFuture = start > now

                return (
                  <div
                    key={closure.id}
                    className={`p-4 rounded-lg border-2 ${
                      isActive
                        ? 'bg-red-500/10 border-red-500/30'
                        : isPast
                        ? 'bg-gray-500/10 border-gray-500/20 opacity-60'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                              ACTIVE NOW
                            </span>
                          )}
                          {isFuture && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                              UPCOMING
                            </span>
                          )}
                          {isPast && (
                            <span className="px-2 py-0.5 bg-gray-500 text-white text-xs rounded-full font-medium">
                              PAST
                            </span>
                          )}
                        </div>
                        <p className="text-white font-medium">{closure.reason}</p>
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(closure.start_time!)} → {formatDateTime(closure.end_time!)}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteClosure(closure)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <p className="text-red-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
