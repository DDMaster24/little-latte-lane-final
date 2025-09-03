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
 * Save theme setting for image changes with proper category and page_scope support
 * @param setting Theme setting data with optional category and page_scope
 * @returns { success: boolean, data?: any, message?: string }
 */
export async function saveImageSetting(setting: {
  setting_key: string;
  setting_value: string;
  category?: string;
  page_scope?: string;
}) {
  console.log('🔍 DEBUG: saveImageSetting called with:', setting);
  
  // Use the full saveThemeSetting function for complete functionality
  return saveThemeSetting({
    setting_key: setting.setting_key,
    setting_value: setting.setting_value,
    category: setting.category || 'page_editor',
    page_scope: setting.page_scope || 'header'
  });
}

export async function saveThemeSetting(setting: {
  setting_key: string;
  setting_value: string;
  category?: string;
  page_scope?: string;
  created_by?: string;
}) {
  console.log('🔍 DEBUG: saveThemeSetting called with:', setting);
  
  const supabase = getSupabaseAdmin();
  
  try {
    // Check if setting already exists
    const { data: existing, error: selectError } = await supabase
      .from('theme_settings')
      .select('id')
      .eq('setting_key', setting.setting_key)
      .eq('category', setting.category || '')
      .single();

    console.log('🔍 DEBUG: Existing setting check:', { existing, selectError });

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not found
      console.log('🔍 DEBUG: Select error (not "not found"):', selectError);
      return { success: false, message: `Database query error: ${selectError.message}` };
    }

    let result;
    if (existing) {
      console.log('🔍 DEBUG: Updating existing setting with ID:', existing.id);
      // Update existing record
      result = await supabase
        .from('theme_settings')
        .update({
          setting_value: setting.setting_value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      console.log('🔍 DEBUG: Creating new setting');
      // Insert new record
      result = await supabase
        .from('theme_settings')
        .insert([{
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          category: setting.category || 'page_editor',
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
    }

    console.log('🔍 DEBUG: Save operation result:', result);

    if (result.error) {
      console.log('🔍 DEBUG: Save operation error:', result.error);
      return { success: false, message: `Save failed: ${result.error.message}` };
    }

    if (!result.data) {
      console.log('🔍 DEBUG: No data returned from save operation');
      return { success: false, message: 'No data returned from save operation' };
    }

    console.log('🔍 DEBUG: Save successful:', result.data);
    return { success: true, data: result.data };

  } catch (error) {
    console.log('🔍 DEBUG: Catch block error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Test database connection and theme_settings table
 * @returns { success: boolean, message?: string, details?: any }
 */
export async function testDatabaseConnection() {
  console.log('🔍 DEBUG: Testing database connection');
  
  const supabase = getSupabaseAdmin();
  
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('theme_settings')
      .select('id')
      .limit(1);

    if (connectionError) {
      console.log('🔍 DEBUG: Connection test failed:', connectionError);
      return { 
        success: false, 
        message: `Database connection failed: ${connectionError.message}`,
        details: { error: connectionError }
      };
    }

    // Test write access with a dummy setting
    const testSetting = {
      setting_key: 'connection_test_' + Date.now(),
      setting_value: 'test',
      category: 'test',
      page_scope: 'test'
    };

    const { data: writeTest, error: writeError } = await supabase
      .from('theme_settings')
      .insert([testSetting])
      .select()
      .single();

    if (writeError) {
      console.log('🔍 DEBUG: Write test failed:', writeError);
      return {
        success: false,
        message: `Write access failed: ${writeError.message}`,
        details: { error: writeError }
      };
    }

    // Clean up test setting
    await supabase
      .from('theme_settings')
      .delete()
      .eq('id', writeTest.id);

    console.log('🔍 DEBUG: Database test successful');
    return { 
      success: true, 
      message: 'Database connection and write access confirmed',
      details: { 
        readAccess: true, 
        writeAccess: true,
        recordCount: connectionTest?.length || 0
      }
    };

  } catch (error) {
    console.log('🔍 DEBUG: Database test catch error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown database error',
      details: { error }
    };
  }
}
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

  // Validate file size with more detailed feedback
  const fileSizeKB = Math.round(file.size / 1024);
  const fileSizeMB = Math.round((file.size / 1024 / 1024) * 100) / 100;
  
  console.log('🔍 DEBUG: File size details', { 
    bytes: file.size, 
    kilobytes: fileSizeKB, 
    megabytes: fileSizeMB 
  });
  
  // Increase limit to 10MB to handle larger images
  if (file.size > 10 * 1024 * 1024) {
    console.log('🔍 DEBUG: File too large', file.size);
    return { success: false, message: `File too large (${fileSizeMB}MB). Maximum size is 10MB.` };
  }
  
  // Warn for large files but allow them
  if (file.size > 2 * 1024 * 1024) {
    console.log('🔍 DEBUG: Large file detected', `${fileSizeMB}MB - processing may take longer`);
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

    // Determine bucket based on folder - use dedicated buckets for different content types
    let bucket: string;
    if (folder === 'logos' || folder === 'headers' || folder === 'icons') {
      bucket = 'header-assets'; // Dedicated bucket for header images
    } else if (folder === 'uploads') {
      bucket = 'page-editor'; // Dedicated bucket for page editor uploads
    } else {
      bucket = 'menu-images'; // Default for menu content
    }
    
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
