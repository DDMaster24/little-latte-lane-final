'use server';

import { getSupabaseAdmin } from '@/lib/supabase-server';
import { updateOrderStatusSimple } from '@/lib/orderStatusNotifications';

/**
 * Update the status of an order by ID with simple notifications (PWA push only)
 * @param id Order ID
 * @param status New status string (e.g. 'received', 'making', 'ready', 'completed', 'cancelled')
 * @param additionalData Optional additional data like estimated ready time
 * @returns { success: boolean, message?: string }
 */
export async function updateOrderStatus(
  id: string, 
  status: string,
  additionalData?: {
    estimatedReadyTime?: string;
    completionTime?: string;
  }
) {
  try {
    const success = await updateOrderStatusSimple(
      id,
      status as 'received' | 'making' | 'ready' | 'completed' | 'cancelled',
      additionalData
    );

    if (!success) {
      return { success: false, message: 'Failed to update order status' };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to update order status:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
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
 * @param categoryData Category data (name, description, display_order, is_active, parent_id, image_url)
 * @returns { success: boolean, data?: any, message?: string }
 */
export async function createMenuCategory(categoryData: {
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  parent_id?: string;
  image_url?: string;
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
  parent_id?: string;
  image_url?: string;
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

/**
 * Upload an image to Supabase Storage
 * @param formData FormData containing file and folder
 * @returns { success: boolean, data?: { url: string, path: string }, message?: string }
 */
export async function uploadImage(formData: FormData) {
  const supabase = getSupabaseAdmin();
  
  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string || 'categories';
  
  console.log('🔍 DEBUG: Upload started', { 
    fileName: file?.name, 
    fileSize: file?.size, 
    fileType: file?.type,
    folder 
  });
  
  if (!file) {
    return { success: false, message: 'No file provided' };
  }

  // Enhanced file validation
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];
  const fileType = file.type.toLowerCase();
  
  if (!allowedTypes.includes(fileType)) {
    console.log('🔍 DEBUG: Invalid file type', fileType);
    return { success: false, message: `Invalid file type "${fileType}". Please upload PNG, JPG, JPEG, GIF, or WebP images.` };
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    console.log('🔍 DEBUG: File too large', file.size);
    return { success: false, message: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is 5MB.` };
  }

  // Validate file is not corrupted (has actual content)
  if (file.size === 0) {
    console.log('🔍 DEBUG: Empty file');
    return { success: false, message: 'File appears to be empty or corrupted.' };
  }

  try {
    // Sanitize filename - remove special characters that might cause issues
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExt = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `${folder}/${timestamp}-${randomId}.${fileExt}`;

    console.log('🔍 DEBUG: Generated filename', fileName);

    // Determine bucket based on folder
    const bucket = folder === 'logos' || folder === 'icons' ? 'menu-images' : 'menu-images';
    
    console.log('🔍 DEBUG: Uploading to bucket', bucket);
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      });

    if (error) {
      console.log('🔍 DEBUG: Upload error', error);
      return { success: false, message: `Upload failed: ${error.message}` };
    }

    console.log('🔍 DEBUG: Upload successful, getting URL');

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('🔍 DEBUG: Public URL generated', urlData.publicUrl);

    return { 
      success: true, 
      data: { 
        url: urlData.publicUrl,
        path: fileName 
      } 
    };
  } catch (error) {
    console.log('🔍 DEBUG: Catch block error', error);
    return { success: false, message: error instanceof Error ? error.message : 'Upload failed' };
  }
}
