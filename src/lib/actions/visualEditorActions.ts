'use server';

import { revalidatePath } from 'next/cache';
import { authenticateForVisualEditor, getAuthenticatedSupabaseClient } from '@/lib/auth/visualEditorAuth';

/**
 * Enhanced save function for multiple style properties
 */
export async function saveVisualEdit(
  elementId: string,
  content: string,
  pageScope: string,
  elementType: 'text' | 'color' | 'background' | 'image' = 'text',
  styleProperties?: Record<string, string>
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
    
    // If we have style properties, save them as individual settings
    if (styleProperties && Object.keys(styleProperties).length > 0) {
      console.log('🎨 Saving style properties:', styleProperties);
      
      // Save each style property as a separate setting
      const stylePromises = Object.entries(styleProperties).map(async ([property, value]) => {
        const styleKey = `visual_style_${elementId}_${property}`;
        
        // Check if setting already exists
        const { data: existing, error: selectError } = await supabase
          .from('theme_settings')
          .select('*')
          .eq('setting_key', styleKey)
          .eq('page_scope', pageScope)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('❌ Style select error:', selectError);
          throw selectError;
        }

        if (existing) {
          // Update existing style setting
          const { error } = await supabase
            .from('theme_settings')
            .update({
              setting_value: value,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
          
          if (error) {
            console.error('❌ Style update error:', error);
            throw error;
          }
          console.log('✅ Updated style property:', property, '=', value);
        } else {
          // Create new style setting
          const { error } = await supabase
            .from('theme_settings')
            .insert({
              setting_key: styleKey,
              setting_value: value,
              page_scope: pageScope,
              category: 'visual_editor_styles'
            });
          
          if (error) {
            console.error('❌ Style insert error:', error);
            throw error;
          }
          console.log('✅ Created style property:', property, '=', value);
        }
      });
      
      await Promise.all(stylePromises);
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
    
    // Load both content and style settings
    const { data: settings, error } = await supabase
      .from('theme_settings')
      .select('setting_key, setting_value, category')
      .eq('page_scope', pageScope)
      .in('category', ['visual_editor', 'visual_editor_styles']);

    if (error) {
      console.error('❌ Error loading visual content:', error);
      return {
        success: false,
        error: error.message,
        data: {},
        styles: {}
      };
    }

    // Separate content and styles
    const contentMap: Record<string, string> = {};
    const stylesMap: Record<string, Record<string, string>> = {};
    
    settings?.forEach(setting => {
      if (setting.category === 'visual_editor') {
        contentMap[setting.setting_key] = setting.setting_value;
      } else if (setting.category === 'visual_editor_styles') {
        // Parse style key: visual_style_elementId_property
        const keyParts = setting.setting_key.split('_');
        if (keyParts.length >= 4 && keyParts[0] === 'visual' && keyParts[1] === 'style') {
          const elementId = keyParts.slice(2, -1).join('_');
          const property = keyParts[keyParts.length - 1];
          
          if (!stylesMap[elementId]) {
            stylesMap[elementId] = {};
          }
          stylesMap[elementId][property] = setting.setting_value;
        }
      }
    });
    
    console.log('✅ Loaded visual content:', Object.keys(contentMap).length, 'content items');
    console.log('✅ Loaded visual styles:', Object.keys(stylesMap).length, 'styled elements');
    
    return {
      success: true,
      data: contentMap,
      styles: stylesMap
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
