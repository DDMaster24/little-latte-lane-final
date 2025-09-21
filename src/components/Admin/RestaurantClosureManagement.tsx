'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  CalendarClock,
  Power, 
  PowerOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Eye
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  useRestaurantClosure, 
  RestaurantClosureManager,
  type ClosureSettings 
} from '@/hooks/useRestaurantClosure'

export default function RestaurantClosureManagement() {
  const { toast } = useToast()
  const { closureStatus, loading, error, refreshStatus } = useRestaurantClosure()
  
  // State for manual closure
  const [manualClosureLoading, setManualClosureLoading] = useState(false)
  
  // State for scheduled closure
  const [scheduledStartDate, setScheduledStartDate] = useState('')
  const [scheduledStartTime, setScheduledStartTime] = useState('')
  const [scheduledEndDate, setScheduledEndDate] = useState('')
  const [scheduledEndTime, setScheduledEndTime] = useState('')
  const [schedulingLoading, setSchedulingLoading] = useState(false)
  
  // State for current settings
  const [currentSettings, setCurrentSettings] = useState<ClosureSettings | null>(null)

  // Load current settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await RestaurantClosureManager.getClosureSettings()
      setCurrentSettings(settings)
      
      // Pre-fill scheduled dates if they exist
      if (settings?.scheduled_closure_start && settings?.scheduled_closure_end) {
        const startDate = new Date(settings.scheduled_closure_start)
        const endDate = new Date(settings.scheduled_closure_end)
        
        setScheduledStartDate(startDate.toISOString().split('T')[0])
        setScheduledStartTime(startDate.toTimeString().slice(0, 5))
        setScheduledEndDate(endDate.toISOString().split('T')[0])
        setScheduledEndTime(endDate.toTimeString().slice(0, 5))
      }
    }
    
    loadSettings()
  }, [closureStatus])

  // Handle manual closure toggle
  const handleManualToggle = async () => {
    setManualClosureLoading(true)
    try {
      const newStatus = !currentSettings?.is_manually_closed
      const result = await RestaurantClosureManager.setManualClosure(newStatus)
      
      if (result.success) {
        toast({
          title: newStatus ? 'Restaurant Closed' : 'Restaurant Opened',
          description: newStatus 
            ? 'Online ordering has been disabled manually'
            : 'Online ordering has been enabled',
          variant: newStatus ? 'destructive' : 'default'
        })
        
        // Refresh status and settings
        await refreshStatus()
        const settings = await RestaurantClosureManager.getClosureSettings()
        setCurrentSettings(settings)
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

  // Handle scheduled closure
  const handleScheduleClosure = async () => {
    if (!scheduledStartDate || !scheduledStartTime || !scheduledEndDate || !scheduledEndTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all date and time fields',
        variant: 'destructive'
      })
      return
    }

    setSchedulingLoading(true)
    try {
      // Create datetime strings in local timezone (no Z suffix)
      const startDateTime = `${scheduledStartDate}T${scheduledStartTime}:00`
      const endDateTime = `${scheduledEndDate}T${scheduledEndTime}:00`
      
      // Convert to ISO strings which will preserve local timezone
      const startISO = new Date(startDateTime).toISOString()
      const endISO = new Date(endDateTime).toISOString()
      
      const result = await RestaurantClosureManager.scheduleClosure(startISO, endISO)
      
      if (result.success) {
        toast({
          title: 'Closure Scheduled',
          description: `Restaurant will close from ${new Date(startISO).toLocaleString()} to ${new Date(endISO).toLocaleString()}`,
        })
        
        // Refresh status and settings
        await refreshStatus()
        const settings = await RestaurantClosureManager.getClosureSettings()
        setCurrentSettings(settings)
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

  // Handle clear scheduled closure
  const handleClearSchedule = async () => {
    setSchedulingLoading(true)
    try {
      const result = await RestaurantClosureManager.clearScheduledClosure()
      
      if (result.success) {
        toast({
          title: 'Schedule Cleared',
          description: 'Scheduled closure has been removed',
        })
        
        // Clear form fields
        setScheduledStartDate('')
        setScheduledStartTime('')
        setScheduledEndDate('')
        setScheduledEndTime('')
        
        // Refresh status and settings
        await refreshStatus()
        const settings = await RestaurantClosureManager.getClosureSettings()
        setCurrentSettings(settings)
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to clear schedule',
        variant: 'destructive'
      })
    } finally {
      setSchedulingLoading(false)
    }
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

      {/* Current Status */}
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
                Reopens: {new Date(closureStatus.scheduled_end).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
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
                checked={currentSettings?.is_manually_closed || false}
                onCheckedChange={handleManualToggle}
                className="data-[state=checked]:bg-red-500"
              />
            </div>
            
            <Button
              onClick={handleManualToggle}
              disabled={manualClosureLoading}
              variant={currentSettings?.is_manually_closed ? "default" : "destructive"}
              className="w-full"
            >
              {manualClosureLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : currentSettings?.is_manually_closed ? (
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

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-300 text-xs">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Manual closure overrides any scheduled closures
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Closure */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-lg flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Scheduled Closure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-white text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={scheduledStartDate}
                  onChange={(e) => setScheduledStartDate(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Start Time</Label>
                <Input
                  type="time"
                  value={scheduledStartTime}
                  onChange={(e) => setScheduledStartTime(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">End Date</Label>
                <Input
                  type="date"
                  value={scheduledEndDate}
                  onChange={(e) => setScheduledEndDate(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">End Time</Label>
                <Input
                  type="time"
                  value={scheduledEndTime}
                  onChange={(e) => setScheduledEndTime(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleScheduleClosure}
                disabled={schedulingLoading}
                className="flex-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
              >
                {schedulingLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </>
                )}
              </Button>
              
              {(currentSettings?.scheduled_closure_start || currentSettings?.scheduled_closure_end) && (
                <Button
                  onClick={handleClearSchedule}
                  disabled={schedulingLoading}
                  variant="outline"
                  className="border-gray-600"
                >
                  Clear
                </Button>
              )}
            </div>

            {currentSettings?.scheduled_closure_start && currentSettings?.scheduled_closure_end && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-300 text-xs flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Scheduled: {new Date(currentSettings.scheduled_closure_start).toLocaleString()} - {new Date(currentSettings.scheduled_closure_end).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Create Closure Banner</p>
                <p className="text-gray-400 text-xs">Add a closure banner brick to your homepage and menu page in the React Bricks editor</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 border border-green-500/30 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Customize Message</p>
                <p className="text-gray-400 text-xs">Use the ClosureBanner component to create custom closure messages with images</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-full p-1 mt-0.5">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Test the System</p>
                <p className="text-gray-400 text-xs">Toggle closure status and verify that ordering is properly disabled</p>
              </div>
            </div>
          </div>
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