// Optimized Real-time Hook - Reduces subscription overhead
// This replaces individual subscriptions with a single optimized channel

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface OptimizedOrder {
  id: string;
  status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  order_number: string | null;
  created_at: string | null;
  updated_at: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
}

export interface OptimizedBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  party_size: number;
  status: string | null;
  name: string;
  email: string;
  phone: string | null;
  special_requests: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OptimizedEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OptimizedRealtimeData {
  orders: OptimizedOrder[];
  bookings: OptimizedBooking[];
  events: OptimizedEvent[];
  lastUpdate: Date | null;
  isConnected: boolean;
}

export interface UseOptimizedRealtimeOptions {
  enableOrders?: boolean;
  enableBookings?: boolean; 
  enableEvents?: boolean;
  pollingInterval?: number; // Fallback polling interval in ms
}

/**
 * Optimized real-time hook that reduces database load
 * Features:
 * - Single subscription channel instead of multiple
 * - Intelligent polling fallback
 * - Connection state monitoring
 * - Automatic cleanup
 */
export function useOptimizedRealtime(options: UseOptimizedRealtimeOptions = {}) {
  const {
    enableOrders = true,
    enableBookings = true,
    enableEvents = true,
    pollingInterval = 30000, // 30 seconds fallback
  } = options;

  const [data, setData] = useState<OptimizedRealtimeData>({
    orders: [],
    bookings: [],
    events: [],
    lastUpdate: null,
    isConnected: false,
  });
  
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  // Optimized data fetching function
  const fetchAllData = useCallback(async () => {
    try {
      setError(null);
      
      const promises = [];
      
      // Only fetch enabled data types
      if (enableOrders) {
        promises.push(
          supabase
            .from('orders')
            .select(`
              id, status, payment_status, total_amount, order_number, created_at, updated_at,
              profiles!inner(full_name, email)
            `)
            .in('status', ['confirmed', 'preparing', 'ready'])
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: true })
            .limit(50) // Limit results to reduce overhead
        );
      } else {
        promises.push(Promise.resolve({ data: [], error: null }));
      }

      if (enableBookings) {
        const today = new Date().toISOString().split('T')[0];
        promises.push(
          supabase
            .from('bookings')
            .select('id, booking_date, booking_time, party_size, status, name, email, phone, special_requests, created_at, updated_at')
            .eq('booking_date', today)
            .order('booking_time', { ascending: true })
            .limit(50)
        );
      } else {
        promises.push(Promise.resolve({ data: [], error: null }));
      }

      if (enableEvents) {
        promises.push(
          supabase
            .from('events')
            .select('id, title, description, event_type, start_date, end_date, is_active, image_url, created_at, updated_at')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(20)
        );
      } else {
        promises.push(Promise.resolve({ data: [], error: null }));
      }

      const results = await Promise.all(promises);

      // Check for errors
      if (results[0]?.error) throw results[0].error;
      if (results[1]?.error) throw results[1].error;
      if (results[2]?.error) throw results[2].error;

      setData({
        orders: (results[0]?.data as OptimizedOrder[]) || [],
        bookings: (results[1]?.data as OptimizedBooking[]) || [],
        events: (results[2]?.data as OptimizedEvent[]) || [],
        lastUpdate: new Date(),
        isConnected: true,
      });

    } catch (err) {
      console.error('❌ Optimized Realtime: Error fetching data:', err);
      setError((err as Error).message);
      setData(prev => ({ ...prev, isConnected: false }));
    }
  }, [supabase, enableOrders, enableBookings, enableEvents]);

  useEffect(() => {
    let subscription: RealtimeChannel | null = null;
    let pollingTimer: NodeJS.Timeout | null = null;
    let isSubscriptionActive = false;

    const setupRealtimeSubscription = () => {
      try {
        console.log('🔄 Setting up optimized real-time subscription...');
        
        // Create a single channel for all subscriptions
        subscription = supabase.channel('optimized-realtime');

        // Add order subscriptions if enabled
        if (enableOrders) {
          subscription = subscription.on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'orders',
              filter: 'status=in.(confirmed,preparing,ready)'
            },
            (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
              console.log('📦 Order change detected:', payload.eventType);
              fetchAllData();
            }
          );
        }

        // Add booking subscriptions if enabled
        if (enableBookings) {
          subscription = subscription.on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'bookings'
            },
            (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
              console.log('📅 Booking change detected:', payload.eventType);
              fetchAllData();
            }
          );
        }

        // Add event subscriptions if enabled
        if (enableEvents) {
          subscription = subscription.on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'events',
              filter: 'is_active=eq.true'
            },
            (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
              console.log('🎉 Event change detected:', payload.eventType);
              fetchAllData();
            }
          );
        }

        // Subscribe and handle connection status
        subscription
          .subscribe((status: string) => {
            console.log(`🔗 Optimized Realtime Status: ${status}`);
            isSubscriptionActive = status === 'SUBSCRIBED';
            
            setData(prev => ({ 
              ...prev, 
              isConnected: status === 'SUBSCRIBED' 
            }));

            // If subscription fails, fall back to polling
            if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.log('⚠️ Real-time subscription failed, falling back to polling');
              setupPollingFallback();
            }
          });

      } catch (err) {
        console.error('❌ Failed to setup real-time subscription:', err);
        setupPollingFallback();
      }
    };

    const setupPollingFallback = () => {
      console.log(`🔄 Setting up polling fallback (${pollingInterval}ms)`);
      
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
      
      pollingTimer = setInterval(() => {
        if (!isSubscriptionActive) {
          fetchAllData();
        }
      }, pollingInterval);
    };

    // Initial data fetch
    fetchAllData();
    
    // Setup real-time subscription
    setupRealtimeSubscription();
    
    // Setup polling fallback
    setupPollingFallback();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up optimized real-time subscription');
      
      if (subscription) {
        subscription.unsubscribe();
      }
      
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
    };
  }, [fetchAllData, pollingInterval, enableOrders, enableBookings, enableEvents, supabase]);

  // Manual refresh function
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchAllData();
  }, [fetchAllData]);

  return {
    ...data,
    error,
    refresh,
    loading: data.lastUpdate === null && !error,
  };
}

export default useOptimizedRealtime;
