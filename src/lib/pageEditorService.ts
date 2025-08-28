import { getSupabaseAdmin } from '@/lib/supabase-server';

export interface ElementStyle {
  elementId: string;
  styles: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: string;
  };
}

export class PageEditorService {
  private static async getSupabase() {
    return getSupabaseAdmin();
  }

  static async saveElementStyles(pageId: string, elementId: string, styles: ElementStyle['styles']) {
    try {
      const supabase = await this.getSupabase();
      
      // Check if element style already exists
      const { data: existing } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('page_id', pageId)
        .eq('element_id', elementId)
        .single();

      const styleData = {
        page_id: pageId,
        element_id: elementId,
        styles: styles,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('theme_settings')
          .update(styleData)
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('theme_settings')
          .insert(styleData);
        
        if (error) throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving element styles:', error);
      return { success: false, error: String(error) };
    }
  }

  static async getElementStyles(pageId: string): Promise<Record<string, ElementStyle['styles']>> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('page_id', pageId);

      if (error) throw error;

      // Transform data into a lookup object
      const styles: Record<string, ElementStyle['styles']> = {};
      data?.forEach((item: any) => {
        styles[item.element_id] = item.styles;
      });

      return styles;
    } catch (error) {
      console.error('Error fetching element styles:', error);
      return {};
    }
  }
}
