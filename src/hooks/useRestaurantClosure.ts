// Restaurant Closure Hook
// Provides closure status checking and management for frontend components

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

export type ClosureStatus = {
  is_closed: boolean
  reason: 'manual' | 'scheduled' | 'none'
  message?: string
  scheduled_end?: string | null
}

export type ClosureSettings = {
  is_manually_closed: boolean
  scheduled_closure_start: string | null
  scheduled_closure_end: string | null
}

/**
 * Hook to check and manage restaurant closure status
 */
export function useRestaurantClosure() {
  const [closureStatus, setClosureStatus] = useState<ClosureStatus>({
    is_closed: false,
    reason: 'none'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = getSupabaseClient()

  /**
   * Check if restaurant is currently closed based on settings
   */
  const checkClosureStatus = useCallback(async (): Promise<ClosureStatus> => {
    try {
      // Get closure settings from theme_settings table (temporary approach)
      const { data: settings, error } = await supabase
        .from('theme_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'restaurant_manually_closed',
          'restaurant_scheduled_start', 
          'restaurant_scheduled_end'
        ])

      if (error) {
        console.error('Error checking closure status:', error)
        return { is_closed: false, reason: 'none' }
      }

      // Parse settings into object
      const settingsObj: Record<string, string> = {}
      settings?.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value || ''
      })

      // Check manual closure first (highest priority)
      if (settingsObj.restaurant_manually_closed === 'true') {
        return {
          is_closed: true,
          reason: 'manual',
          message: 'We are temporarily closed. Please check back later.'
        }
      }

      // Check scheduled closure
      const scheduledStart = settingsObj.restaurant_scheduled_start
      const scheduledEnd = settingsObj.restaurant_scheduled_end

      if (scheduledStart && scheduledEnd) {
        const now = new Date()
        const startTime = new Date(scheduledStart)
        const endTime = new Date(scheduledEnd)

        if (now >= startTime && now <= endTime) {
          return {
            is_closed: true,
            reason: 'scheduled',
            message: 'We are closed as scheduled. We will reopen soon.',
            scheduled_end: scheduledEnd
          }
        }
      }

      // Restaurant is open
      return { is_closed: false, reason: 'none' }

    } catch (err) {
      console.error('Error in checkClosureStatus:', err)
      return { is_closed: false, reason: 'none' }
    }
  }, [supabase])

  /**
   * Load closure status on mount and set up real-time subscription
   */
  useEffect(() => {
    let mounted = true

    const loadStatus = async () => {
      setLoading(true)
      try {
        const status = await checkClosureStatus()
        if (mounted) {
          setClosureStatus(status)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load closure status')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadStatus()

    // Set up real-time subscription for closure setting changes
    const channel = supabase
      .channel('restaurant-closure-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'theme_settings',
          filter: 'setting_key=in.(restaurant_manually_closed,restaurant_scheduled_start,restaurant_scheduled_end)'
        },
        () => {
          // Refresh status when closure settings change
          loadStatus()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase, checkClosureStatus]) // Include both dependencies

  /**
   * Manually refresh closure status
   */
  const refreshStatus = async () => {
    setLoading(true)
    try {
      const status = await checkClosureStatus()
      setClosureStatus(status)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh closure status')
    } finally {
      setLoading(false)
    }
  }

  return {
    closureStatus,
    loading,
    error,
    refreshStatus,
    // Convenience properties
    isClosed: closureStatus.is_closed,
    isOpen: !closureStatus.is_closed,
    reason: closureStatus.reason,
    message: closureStatus.message,
    scheduledEnd: closureStatus.scheduled_end
  }
}

/**
 * Admin functions for managing closure settings
 * These work with the theme_settings table as a temporary solution
 */
export class RestaurantClosureManager {
  private static supabase = getSupabaseClient()

  /**
   * Set manual closure status (admin only)
   */
  static async setManualClosure(isClosed: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('theme_settings')
        .upsert({
          setting_key: 'restaurant_manually_closed',
          setting_value: isClosed.toString(),
          category: 'restaurant_closure'
        })

      if (error) {
        console.error('Error setting manual closure:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to set manual closure' 
      }
    }
  }

  /**
   * Schedule closure (admin only)
   */
  static async scheduleClosure(startTime: string, endTime: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate dates
      const start = new Date(startTime)
      const end = new Date(endTime)
      
      if (start >= end) {
        return { success: false, error: 'Start time must be before end time' }
      }

      // Insert both start and end times
      const { error } = await this.supabase
        .from('theme_settings')
        .upsert([
          {
            setting_key: 'restaurant_scheduled_start',
            setting_value: startTime,
            category: 'restaurant_closure'
          },
          {
            setting_key: 'restaurant_scheduled_end',
            setting_value: endTime,
            category: 'restaurant_closure'
          }
        ])

      if (error) {
        console.error('Error scheduling closure:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to schedule closure' 
      }
    }
  }

  /**
   * Clear scheduled closure (admin only)
   */
  static async clearScheduledClosure(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('theme_settings')
        .delete()
        .in('setting_key', ['restaurant_scheduled_start', 'restaurant_scheduled_end'])

      if (error) {
        console.error('Error clearing scheduled closure:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to clear scheduled closure' 
      }
    }
  }

  /**
   * Get current closure settings (admin only)
   */
  static async getClosureSettings(): Promise<ClosureSettings | null> {
    try {
      const { data: settings, error } = await this.supabase
        .from('theme_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'restaurant_manually_closed',
          'restaurant_scheduled_start', 
          'restaurant_scheduled_end'
        ])

      if (error) {
        console.error('Error getting closure settings:', error)
        return null
      }

      // Parse settings into structured object
      const settingsObj: Record<string, string> = {}
      settings?.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value || ''
      })

      return {
        is_manually_closed: settingsObj.restaurant_manually_closed === 'true',
        scheduled_closure_start: settingsObj.restaurant_scheduled_start || null,
        scheduled_closure_end: settingsObj.restaurant_scheduled_end || null
      }
    } catch (err) {
      console.error('Error getting closure settings:', err)
      return null
    }
  }
}