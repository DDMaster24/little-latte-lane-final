import { getSupabaseClient } from '@/lib/supabase-client';
import { getSupabaseServer } from '@/lib/supabase-server';
import { Database } from '@/types/supabase';

type ThemeSettingInsert = Database['public']['Tables']['theme_settings']['Insert'];

export class ThemeQueries {
  /**
   * Get theme settings for a specific page and category
   */
  static async getPageThemeSettings(pageScope: string, category?: string) {
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('theme_settings')
      .select('*')
      .eq('page_scope', pageScope);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('setting_key');
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Get a specific theme setting by key and page
   */
  static async getThemeSetting(settingKey: string, pageScope: string) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('setting_key', settingKey)
      .eq('page_scope', pageScope)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  /**
   * Save or update a theme setting
   */
  static async saveThemeSetting(
    settingKey: string,
    settingValue: string,
    pageScope: string,
    options: {
      category?: string;
    } = {}
  ) {
    const supabase = getSupabaseClient();
    
    // Check if setting already exists
    const existing = await this.getThemeSetting(settingKey, pageScope);
    
    if (existing) {
      // Update existing setting
      const { data, error } = await supabase
        .from('theme_settings')
        .update({
          setting_value: settingValue,
          updated_at: new Date().toISOString(),
          category: options.category
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new setting
      const newSetting: ThemeSettingInsert = {
        setting_key: settingKey,
        setting_value: settingValue,
        category: options.category || 'content',
      };
      
      const { data, error } = await supabase
        .from('theme_settings')
        .insert(newSetting)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }

  /**
   * Delete a theme setting
   */
  static async deleteThemeSetting(settingKey: string, pageScope: string) {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('theme_settings')
      .delete()
      .eq('setting_key', settingKey)
      .eq('page_scope', pageScope);
    
    if (error) throw error;
  }

  /**
   * Get all theme settings grouped by category
   */
  static async getAllThemeSettings() {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
}

/**
 * Server-side theme queries (for use in Server Components and API routes)
 */
export class ServerThemeQueries {
  /**
   * Get theme settings for a specific page and category (server-side)
   */
  static async getPageThemeSettings(pageScope: string, category?: string) {
    const supabase = await getSupabaseServer();
    
    let query = supabase
      .from('theme_settings')
      .select('*')
      .eq('page_scope', pageScope);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('setting_key');
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Get a specific theme setting by key and page (server-side)
   */
  static async getThemeSetting(settingKey: string, pageScope: string) {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('setting_key', settingKey)
      .eq('page_scope', pageScope)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}
