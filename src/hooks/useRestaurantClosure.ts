import { useState, useEffect, useCallback } from 'react'

export interface ClosureStatus {
  is_closed: boolean
  reason: 'none' | 'manual' | 'scheduled'
  message?: string
  scheduled_end?: string
}

export interface RestaurantClosureHook {
  closureStatus: ClosureStatus
  isClosed: boolean
  message?: string
  loading: boolean
  error: string | null
  refreshStatus: () => Promise<void>
  toggleManualClosure: (message?: string) => Promise<boolean>
  setScheduledClosure: (startTime: string, endTime: string) => Promise<boolean>
  clearScheduledClosure: () => Promise<boolean>
}

export interface ClosureSettings {
  is_manually_closed: boolean
  scheduled_closure_start: string | null
  scheduled_closure_end: string | null
}

export const RestaurantClosureManager = {
  async getClosureSettings(): Promise<ClosureSettings> {
    // Theme settings functionality removed - return default settings
    return {
      is_manually_closed: false,
      scheduled_closure_start: null,
      scheduled_closure_end: null
    }
  },

  async setManualClosure(_isManuallySealed: boolean): Promise<{ success: boolean; error?: string }> {
    // Theme settings functionality removed - no manual closure available
    return { success: false, error: 'Restaurant closure functionality disabled' }
  },

  async scheduleClosure(_startTime: string, _endTime: string): Promise<{ success: boolean; error?: string }> {
    // Theme settings functionality removed - no scheduled closure available
    return { success: false, error: 'Restaurant closure functionality disabled' }
  },

  async clearScheduledClosure(): Promise<{ success: boolean; error?: string }> {
    // Theme settings functionality removed - no scheduled closure available
    return { success: false, error: 'Restaurant closure functionality disabled' }
  }
}

export function useRestaurantClosure(): RestaurantClosureHook {
  const [closureStatus, setClosureStatus] = useState<ClosureStatus>({
    is_closed: false,
    reason: 'none'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkClosureStatus = useCallback(async (): Promise<ClosureStatus> => {
    return { is_closed: false, reason: 'none' }
  }, [])

  const refreshStatus = useCallback(async () => {
    setLoading(true)
    try {
      const status = await checkClosureStatus()
      setClosureStatus(status)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load closure status')
    } finally {
      setLoading(false)
    }
  }, [checkClosureStatus])

  const toggleManualClosure = useCallback(async (_message?: string): Promise<boolean> => {
    return false
  }, [])

  const setScheduledClosure = useCallback(async (_startTime: string, _endTime: string): Promise<boolean> => {
    return false
  }, [])

  const clearScheduledClosure = useCallback(async (): Promise<boolean> => {
    return false
  }, [])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  return {
    closureStatus,
    isClosed: closureStatus.is_closed,
    message: closureStatus.message,
    loading,
    error,
    refreshStatus,
    toggleManualClosure,
    setScheduledClosure,
    clearScheduledClosure
  }
}
