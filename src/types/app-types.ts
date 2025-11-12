/**
 * Application Types - Using live database types with proper extensions
 * Generated from live Supabase database schema on August 18, 2025
 */

import { Database } from './supabase';

// Direct exports from live database
export type DbOrder = Database['public']['Tables']['orders']['Row'];
export type DbOrderItem = Database['public']['Tables']['order_items']['Row'];
export type DbMenuItem = Database['public']['Tables']['menu_items']['Row'];
export type DbBooking = Database['public']['Tables']['bookings']['Row'];
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
export type DbEvent = Database['public']['Tables']['events']['Row'];
export type DbMenuCategory = Database['public']['Tables']['menu_categories']['Row'];
export type DbStaffRequest = Database['public']['Tables']['staff_requests']['Row'];

// Use database types directly with proper relations
export interface Order extends DbOrder {
  order_items?: {
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

// Use database types directly - with extensions for enhanced functionality
export interface MenuItem extends DbMenuItem {
  menu_item_variations?: Array<{
    id: string;
    name: string;
    absolute_price?: number | null;
    price_adjustment?: number | null;
    is_available?: boolean | null;
    is_default?: boolean | null;
    display_order?: number | null;
  }>;
  available_addons?: Array<{
    id: string;
    name: string;
    description?: string | null;
    price: number;
    category?: string | null;
    is_required?: boolean;
    max_quantity?: number;
    addon_variations?: Array<{
      id: string;
      name: string;
      absolute_price?: number | null;
      is_available?: boolean | null;
      display_order?: number | null;
    }>;
  }>;
}
export type Profile = DbProfile;
export type Request = DbStaffRequest;

// Enhanced Category interface with hierarchical and image support
export interface Category extends DbMenuCategory {
  parent_name?: string | null; // For display purposes
  subcategories?: Category[]; // For hierarchical display
  items_count?: number; // For overview display
}

// Event interface with event_type mapped to type for component compatibility
export interface Event extends DbEvent {
  type?: 'event' | 'special' | 'news';
}

// Order creation interface matching live database structure
export interface OrderData {
  user_id: string;
  total_amount: number;
  special_instructions?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    price: number; // Use 'price' field from order_items table
    special_instructions?: string | null;
  }[];
}

// Booking slot interface for booking system
export interface BookingSlot {
  id: string;
  booking_date: string; // Use actual database field names
  booking_time: string;
  party_size: number; // Use actual database field name
}
