'use server';

import { revalidatePath } from 'next/cache';
import { authenticateForVisualEditor, getAuthenticatedSupabaseClient } from '@/lib/auth/visualEditorAuth';

/**
 * Save a visual content edit to the database
 */
export async function saveVisualEdit(
  elementId: string,
  content: string,
  pageScope: string,
  elementType: 'text' | 'color' | 'background' | 'image' = 'text'
) {
  console.log('🔍 saveVisualEdit called with:', {
    elementId,
    content: content.substring(0, 50) + '...',
    pageScope,
    elementType
  });

  try {
    console.log('🔍 saveVisualEdit called with:', {
      elementId,
      content: content.substring(0, 50) + '...',
      pageScope,
      elementType
    });

    // Use robust authentication system
    console.log('🔒 STARTING ROBUST AUTHENTICATION CHECK');
    const authResult = await authenticateForVisualEditor();
    
    console.log('🔐 ROBUST AUTH RESULT:', {
      isAuthenticated: authResult.isAuthenticated,
      isAdmin: authResult.isAdmin,
      method: authResult.method,
      hasUser: !!authResult.user,
      error: authResult.error
    });
    
    let supabase;
    
    if (authResult.isAuthenticated && authResult.isAdmin) {
      // Use robust authentication
      supabase = await getAuthenticatedSupabaseClient();
      console.log('✅ Using robust authentication');
    } else {
      // Fallback to direct admin client
      console.log('🔄 Robust auth failed, using direct admin client fallback');
      const { getSupabaseAdmin } = await import('@/lib/supabase-server');
      supabase = getSupabaseAdmin();
      console.log('✅ Using direct admin client as fallback');
    }
    
    // Generate a unique setting key based on element identification
    const settingKey = `visual_${elementType}_${elementId}`;
    console.log('🔑 Generated setting key:', settingKey);
    
    // Check if setting already exists
    console.log('🔍 Checking for existing setting...');
    const { data: existing, error: selectError } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('setting_key', settingKey)
      .eq('page_scope', pageScope)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Select error:', selectError);
      throw selectError;
    }
    
    console.log('📋 Existing setting result:', existing ? 'Found' : 'Not found');
    
    if (existing) {
      console.log('🔄 Updating existing setting with ID:', existing.id);
      // Update existing setting
      const { data, error } = await supabase
        .from('theme_settings')
        .update({
          setting_value: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }
      console.log('✅ Update successful:', data);
      
      // Revalidate the page to show changes
      revalidatePath(pageScope === 'homepage' ? '/' : `/${pageScope}`);
      
      return {
        success: true,
        data,
        message: 'Content updated successfully!'
      };
    } else {
      console.log('➕ Creating new setting...');
      // Create new setting
      const insertData = {
        setting_key: settingKey,
        setting_value: content,
        page_scope: pageScope,
        category: 'visual_editor'
      };
      console.log('📝 Insert data:', insertData);

      const { data, error } = await supabase
        .from('theme_settings')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Insert error:', error);
        console.error('❌ Insert error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      console.log('✅ Insert successful:', data);
      
      // Revalidate the page to show changes
      revalidatePath(pageScope === 'homepage' ? '/' : `/${pageScope}`);
      
      return {
        success: true,
        data,
        message: 'Content saved successfully!'
      };
    }
  } catch (error) {
    console.error('❌ FULL ERROR in saveVisualEdit:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error constructor:', error?.constructor?.name);
    
    // More detailed error information
    if (error && typeof error === 'object') {
      console.error('❌ Error properties:', Object.keys(error));
      const errorObj = error as Record<string, unknown>;
      console.error('❌ Error details:', {
        message: errorObj.message,
        code: errorObj.code,
        details: errorObj.details,
        hint: errorObj.hint,
        stack: errorObj.stack
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: `Failed to save content: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Load visual content for a specific page (public access)
 */
export async function loadVisualContent(pageScope: string) {
  try {
    // This is a public function that anyone can use to load visual content
    // We don't need admin authentication for reading visual content
    const { getSupabaseClient } = await import('@/lib/supabase-client');
    const supabase = getSupabaseClient();
    
    console.log('📖 Loading visual content for page:', pageScope);
    
    const { data: settings, error } = await supabase
      .from('theme_settings')
      .select('setting_key, setting_value')
      .eq('page_scope', pageScope)
      .eq('category', 'visual_editor');

    if (error) {
      console.error('❌ Error loading visual content:', error);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }

    // Convert to a map for easy lookup
    const contentMap: Record<string, string> = {};
    settings?.forEach(setting => {
      contentMap[setting.setting_key] = setting.setting_value;
    });
    
    console.log('✅ Loaded visual content:', Object.keys(contentMap).length, 'items');
    
    return {
      success: true,
      data: contentMap
    };
  } catch (error) {
    console.error('Error loading visual content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load content',
      data: {}
    };
  }
}

/**
 * Delete a visual content setting
 */
export async function deleteVisualEdit(elementId: string, pageScope: string, elementType: string = 'text') {
  try {
    // Use robust authentication
    const authResult = await authenticateForVisualEditor();
    
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      throw new Error(`Access denied: ${authResult.error || 'Admin authentication required'}`);
    }
    
    const supabase = await getAuthenticatedSupabaseClient();
    const settingKey = `visual_${elementType}_${elementId}`;
    
    const { error } = await supabase
      .from('theme_settings')
      .delete()
      .eq('setting_key', settingKey)
      .eq('page_scope', pageScope);
    
    if (error) throw error;
    
    // Revalidate the page
    revalidatePath(pageScope === 'homepage' ? '/' : `/${pageScope}`);
    
    return {
      success: true,
      message: 'Content deleted successfully!'
    };
  } catch (error) {
    console.error('Error deleting visual edit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete content'
    };
  }
}
