'use server';

import { getSupabaseAdmin } from '@/lib/supabase-server';

/**
 * Update the status of an order by ID
 * @param id Order ID
 * @param status New status string (e.g. 'pending', 'done', 'cancelled')
 * @returns { success: boolean, message?: string }
 */
export async function updateOrderStatus(id: string, status: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

// Future actions can be added below, like:
// export async function updateMenuItem(...) { ... }
// export async function deleteBooking(...) { ... }
/**
 * Update the status of a booking by ID
 * @param id Booking ID
 * @param status New status string ('pending', 'confirmed', 'cancelled')
 * @returns { success: boolean, message?: string }
 */
export async function updateBookingStatus(id: string, status: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

/**
 * Create a new menu category
 * @param categoryData Category data (name, description, display_order, is_active)
 * @returns { success: boolean, data?: any, message?: string }
 */
export async function createMenuCategory(categoryData: {
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('menu_categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

/**
 * Update an existing menu category
 * @param id Category ID
 * @param categoryData Updated category data
 * @returns { success: boolean, data?: any, message?: string }
 */
export async function updateMenuCategory(id: string, categoryData: {
  name?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('menu_categories')
    .update(categoryData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

/**
 * Delete a menu category
 * @param id Category ID
 * @returns { success: boolean, message?: string }
 */
export async function deleteMenuCategory(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

/**
 * Create a new menu item
 * @param itemData Item data
 * @returns { success: boolean, data?: any, message?: string }
 */
export async function createMenuItem(itemData: {
  category_id: string;
  name: string;
  description?: string;
  price: number;
  is_available?: boolean;
  image_url?: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('menu_items')
    .insert(itemData)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

/**
 * Update an existing menu item
 * @param id Item ID
 * @param itemData Updated item data
 * @returns { success: boolean, data?: any, message?: string }
 */
export async function updateMenuItem(id: string, itemData: {
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  is_available?: boolean;
  image_url?: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('menu_items')
    .update(itemData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, data };
}

/**
 * Delete a menu item
 * @param id Item ID
 * @returns { success: boolean, message?: string }
 */
export async function deleteMenuItem(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
