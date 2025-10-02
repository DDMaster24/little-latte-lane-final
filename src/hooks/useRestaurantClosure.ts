import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Database } from '@/types/supabase'

type RestaurantClosure = Database['public']['Tables']['restaurant_closures']['Row']
type RestaurantClosureInsert = Database['public']['Tables']['restaurant_closures']['Insert']

export interface ClosureStatus {
  is_closed: boolean
  reason: 'none' | 'manual' | 'scheduled'
  message?: string
  scheduled_end?: string
  active_closure?: RestaurantClosure
}

export interface RestaurantClosureHook {
  closureStatus: ClosureStatus
  isClosed: boolean
  message?: string
  loading: boolean
  error: string | null
  refreshStatus: () => Promise<void>
  allClosures: RestaurantClosure[]
  scheduledClosures: RestaurantClosure[]
}

/**
 * Restaurant Closure Manager - Server-side operations
 * Handles database operations for manual and scheduled closures
 */
export const RestaurantClosureManager = {
  /**
   * Get all active closures (manual and scheduled)
   */
  async getAllClosures(): Promise<RestaurantClosure[]> {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('restaurant_closures')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching closures:', error)
      return []
    }
    
    return data || []
  },

  /**
   * Get only scheduled closures
   */
  async getScheduledClosures(): Promise<RestaurantClosure[]> {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('restaurant_closures')
      .select('*')
      .eq('closure_type', 'scheduled')
      .eq('is_active', true)
      .order('start_time', { ascending: true })
    
    if (error) {
      console.error('Error fetching scheduled closures:', error)
      return []
    }
    
    return data || []
  },

  /**
   * Check if restaurant is currently closed
   */
  async checkIfClosed(): Promise<ClosureStatus> {
    const closures = await this.getAllClosures()
    const now = new Date()

    // Check for active manual closure
    const manualClosure = closures.find(c => c.closure_type === 'manual' && c.is_active)
    if (manualClosure) {
      return {
        is_closed: true,
        reason: 'manual',
        message: manualClosure.reason || 'Restaurant is temporarily closed',
        active_closure: manualClosure
      }
    }

    // Check for active scheduled closures
    const scheduledClosures = closures.filter(c => 
      c.closure_type === 'scheduled' && 
      c.start_time && 
      c.end_time &&
      new Date(c.start_time) <= now &&
      new Date(c.end_time) >= now
    )

    if (scheduledClosures.length > 0) {
      const activeClosure = scheduledClosures[0]
      return {
        is_closed: true,
        reason: 'scheduled',
        message: activeClosure.reason || 'Restaurant is closed for a scheduled event',
        scheduled_end: activeClosure.end_time || undefined,
        active_closure: activeClosure
      }
    }

    return {
      is_closed: false,
      reason: 'none'
    }
  },

  /**
   * Toggle manual closure on/off
   * If turning on, creates new manual closure. If turning off, deactivates existing.
   */
  async setManualClosure(isClosed: boolean, reason?: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient()
    
    try {
      if (isClosed) {
        // Create new manual closure
        const newClosure: RestaurantClosureInsert = {
          closure_type: 'manual',
          reason: reason || 'Manually closed by administrator',
          is_active: true
        }
        
        const { error } = await supabase
          .from('restaurant_closures')
          .insert(newClosure)
        
        if (error) throw error
      } else {
        // Deactivate all manual closures
        const { error } = await supabase
          .from('restaurant_closures')
          .update({ is_active: false })
          .eq('closure_type', 'manual')
          .eq('is_active', true)
        
        if (error) throw error
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error setting manual closure:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update closure status' 
      }
    }
  },

  /**
   * Schedule a new closure period (supports multiple)
   */
  async scheduleClosure(
    startTime: string, 
    endTime: string, 
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient()
    
    try {
      const newClosure: RestaurantClosureInsert = {
        closure_type: 'scheduled',
        start_time: startTime,
        end_time: endTime,
        reason: reason || 'Scheduled closure',
        is_active: true
      }
      
      const { error } = await supabase
        .from('restaurant_closures')
        .insert(newClosure)
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Error scheduling closure:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to schedule closure' 
      }
    }
  },

  /**
   * Delete a specific closure by ID
   */
  async deleteClosure(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient()
    
    try {
      const { error } = await supabase
        .from('restaurant_closures')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting closure:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete closure' 
      }
    }
  },

  /**
   * Update a specific closure
   */
  async updateClosure(
    id: string, 
    updates: Partial<RestaurantClosureInsert>
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient()
    
    try {
      const { error } = await supabase
        .from('restaurant_closures')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Error updating closure:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update closure' 
      }
    }
  }
}

/**
 * Hook for restaurant closure status with real-time updates
 */
export function useRestaurantClosure(): RestaurantClosureHook {
  const [closureStatus, setClosureStatus] = useState<ClosureStatus>({
    is_closed: false,
    reason: 'none'
  })
  const [allClosures, setAllClosures] = useState<RestaurantClosure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  const refreshStatus = useCallback(async () => {
    try {
      // Get closure status and all closures
      const [status, closures] = await Promise.all([
        RestaurantClosureManager.checkIfClosed(),
        RestaurantClosureManager.getAllClosures()
      ])
      
      setClosureStatus(status)
      setAllClosures(closures)
      setError(null)
    } catch (err) {
      console.error('Error refreshing closure status:', err)
      setError(err instanceof Error ? err.message : 'Failed to load closure status')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  // Real-time subscription to closure changes
  useEffect(() => {
    const channel = supabase
      .channel('restaurant_closures_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_closures'
        },
        () => {
          // Refresh status when any closure changes
          refreshStatus()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, refreshStatus])

  // Filter scheduled closures from all closures
  const scheduledClosures = allClosures.filter(c => c.closure_type === 'scheduled')

  return {
    closureStatus,
    isClosed: closureStatus.is_closed,
    message: closureStatus.message,
    loading,
    error,
    refreshStatus,
    allClosures,
    scheduledClosures
  }
}
