/**
 * Booking Management Queries
 * Centralized booking operations for tables, golf, and events
 */

import type { Database } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase-client';
import { getSupabaseServer } from '@/lib/supabase-server';

type Tables = Database['public']['Tables'];
type BookingRow = Tables['bookings']['Row'];
type BookingInsert = Tables['bookings']['Insert'];
type BookingUpdate = Tables['bookings']['Update'];
type EventRow = Tables['events']['Row'];

export type BookingWithEvent = BookingRow & {
  event?: EventRow | null;
};

export type CreateBookingData = Omit<BookingInsert, 'id' | 'created_at' | 'updated_at'>;

/**
 * Client-side booking queries
 */
export class BookingQueries {
  private client = getSupabaseClient();

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: string): Promise<BookingRow[]> {
    const { data, error } = await this.client
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('date_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get single booking
   */
  async getBooking(bookingId: string): Promise<BookingRow | null> {
    const { data, error } = await this.client
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  /**
   * Create new booking
   */
  async createBooking(bookingData: CreateBookingData): Promise<BookingRow> {
    const bookingInsert: BookingInsert = {
      ...bookingData,
      status: 'pending',
    };

    const { data, error } = await this.client
      .from('bookings')
      .insert(bookingInsert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update booking
   */
  async updateBooking(bookingId: string, updates: BookingUpdate): Promise<BookingRow> {
    const { data, error } = await this.client
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string): Promise<BookingRow> {
    return this.updateBooking(bookingId, { 
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Get available time slots for a date
   */
  async getAvailableTimeSlots(date: string, _type: 'table' | 'golf' | 'event'): Promise<string[]> {
    const { data: bookings, error } = await this.client
      .from('bookings')
      .select('booking_time')
      .eq('booking_date', date)
      .neq('status', 'cancelled');

    if (error) throw error;

    // Remove booked time slots from available slots
    const bookedTimes = bookings.map(b => b.booking_time);
    const allTimeSlots = this.generateTimeSlots();
    
    return allTimeSlots.filter(time => !bookedTimes.includes(time));
  }

  /**
   * Generate available time slots (can be customized per business hours)
   */
  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    // Business hours: 9 AM to 10 PM
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }
}

/**
 * Server-side booking queries
 */
export class ServerBookingQueries {
  /**
   * Get all bookings (admin view)
   */
  static async getAllBookings(): Promise<BookingRow[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get bookings by date range
   */
  static async getBookingsByDateRange(startDate: string, endDate: string): Promise<BookingRow[]> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .gte('date_time', `${startDate}T00:00:00.000Z`)
      .lte('date_time', `${endDate}T23:59:59.999Z`)
      .order('date_time');

    if (error) throw error;
    return data;
  }

  /**
   * Get today's bookings
   */
  static async getTodayBookings(): Promise<BookingRow[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getBookingsByDateRange(today, today);
  }

  /**
   * Update booking status (server-side)
   */
  static async updateBookingStatus(bookingId: string, status: BookingRow['status']): Promise<BookingRow> {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get booking analytics
   */
  static async getBookingAnalytics() {
    const supabase = await getSupabaseServer();
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's bookings count
    const { count: todayBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('date_time', `${today}T00:00:00.000Z`)
      .lt('date_time', `${today}T23:59:59.999Z`);

    // Get pending bookings
    const { count: pendingBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get confirmed bookings for today
    const { count: confirmedToday } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('date_time', `${today}T00:00:00.000Z`)
      .lt('date_time', `${today}T23:59:59.999Z`)
      .eq('status', 'confirmed');

    return {
      todayBookings: todayBookings || 0,
      pendingBookings: pendingBookings || 0,
      confirmedToday: confirmedToday || 0,
    };
  }
}

// Singleton instance for client-side usage
export const bookingQueries = new BookingQueries();
