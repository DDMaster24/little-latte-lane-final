'use client';

import { getSupabaseClient } from '@/lib/supabase-client';

export interface ElementStyle {
  setting_key: string;
  setting_value: Record<string, string | number | boolean>;
  created_at?: string;
  updated_at?: string;
}

export class PageEditorQueries {
  private supabase = getSupabaseClient();

  /**
   * Get all styles for a specific page using theme_settings table
   */
  async getPageStyles(pageName: string): Promise<ElementStyle[]> {
    try {
      const { data, error } = await this.supabase
        .from('theme_settings')
        .select('*')
        .like('setting_key', `page_${pageName}_%`);

      if (error) throw error;
      
      // Parse JSON values and transform to ElementStyle format
      return (data || []).map(item => ({
        setting_key: item.setting_key,
        setting_value: typeof item.setting_value === 'string' 
          ? JSON.parse(item.setting_value) 
          : item.setting_value,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching page styles:', error);
      return [];
    }
  }

  /**
   * Get styles for a specific element using theme_settings table
   */
  async getElementStyles(pageName: string, elementId: string): Promise<ElementStyle | null> {
    try {
      const settingKey = `page_${pageName}_${elementId}`;
      const { data, error } = await this.supabase
        .from('theme_settings')
        .select('*')
        .eq('setting_key', settingKey)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;
      
      return {
        setting_key: data.setting_key,
        setting_value: typeof data.setting_value === 'string' 
          ? JSON.parse(data.setting_value) 
          : data.setting_value,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching element styles:', error);
      return null;
    }
  }

  /**
   * Save or update element styles using theme_settings table
   */
  async saveElementStyles(pageName: string, elementId: string, styles: Record<string, string | number | boolean>): Promise<boolean> {
    try {
      const settingKey = `page_${pageName}_${elementId}`;
      const { error } = await this.supabase
        .from('theme_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: JSON.stringify(styles),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving element styles:', error);
      return false;
    }
  }

  /**
   * Delete element styles using theme_settings table
   */
  async deleteElementStyles(pageName: string, elementId: string): Promise<boolean> {
    try {
      const settingKey = `page_${pageName}_${elementId}`;
      const { error } = await this.supabase
        .from('theme_settings')
        .delete()
        .eq('setting_key', settingKey);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting element styles:', error);
      return false;
    }
  }
}
