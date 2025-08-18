/**
 * Application Types - Custom interfaces that match our actual database structure
 */

import { Database } from './supabase';

// Base types from database
export type DbOrder = Database['public']['Tables']['orders']['Row'];
export type DbOrderItem = Database['public']['Tables']['order_items']['Row'];
export type DbMenuItem = Database['public']['Tables']['menu_items']['Row'];
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbEvent = Database['public']['Tables']['events']['Row'];

// Extended types with relations that match our actual usage
export interface Order extends DbOrder {
  // Add relation types that components expect but aren't in base DB type
  order_items?: {
    quantity: number;
    menu_items: {
      name: string;
      price: number;
    } | null;
  }[];
  profiles?: {
    full_name: string;
  } | null;
}

export interface OrderWithItems extends DbOrder {
  order_items: {
    id: string;
    quantity: number;
    price: number;
    special_instructions: string | null;
    menu_items: {
      name: string;
      price: number;
    } | null;
  }[];
  profiles?: {
    full_name: string | null;
  } | null;
}

export interface Booking extends DbBooking {
  profiles?: {
    full_name: string | null;
  } | null;
}

export interface MenuItem extends DbMenuItem {
  // Components currently expect these but they're not in DB
  // Mark as optional and undefined so we can gradually remove references
  stock?: never;
  nutritional_info?: never;
  ingredients?: never;
  allergens?: never;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface Event extends DbEvent {
  // Components expect 'type' but database has 'event_type'
  type?: 'event' | 'special' | 'news';
}

export interface Profile extends DbProfile {
  // Components still expect 'username' but database has 'full_name'
  // Keep both during transition
  username?: never; // Mark as never to catch remaining usage
}

// Request types (using staff_requests table)
export interface Request {
  id: string;
  message: string;
  request_type: string | null;
  status: string | null;
  priority: string | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  assigned_to: string | null;
}

// Legacy interfaces for order creation (will be updated)
export interface OrderData {
  user_id: string;
  total_amount: number; // Use database field name
  special_instructions?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_requests?: string | null;
  }[];
}

// Booking slot interface for booking page
export interface BookingSlot {
  id: string;
  date_time: string; // Components expect this format
  number_of_people: number;
}
