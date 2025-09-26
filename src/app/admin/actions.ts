'use server';

import { getSupabaseAdmin } from '@/lib/supabase-server';

// Order status management function
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('❌ Staff: Error updating order status:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Staff: Updated order ${orderId} status to ${status}`);
    return { success: true };
  } catch (error) {
    console.error('💥 Staff: Unexpected error updating order status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Stub implementations for menu management
export async function createMenuCategory(_categoryData: Record<string, unknown>) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function updateMenuCategory(_id: string, _categoryData: Record<string, unknown>) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function deleteMenuCategory(_id: string) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function createMenuItem(_menuItem: Record<string, unknown>) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function updateMenuItem(_id: string, _menuItem: Record<string, unknown>) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function deleteMenuItem(_id: string) {
  return { success: false, message: 'Menu management moved to React Bricks CMS' };
}

export async function getBookingInquiries() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: inquiries, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, data: inquiries };
  } catch (error) {
    console.error('Error fetching booking inquiries:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch inquiries' 
    };
  }
}

export async function uploadImage(formData: FormData) {
  try {
    const supabase = getSupabaseAdmin();
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, message: 'No file provided' };
    }

    const fileName = `uploads/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return { success: true, data: { path: data.path, url: urlData.publicUrl } };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}