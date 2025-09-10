import { getSupabaseClient } from '@/lib/supabase-client';
import { Database } from '@/types/supabase';

type ThemeSettingInsert = Database['public']['Tables']['theme_settings']['Insert'];

// Homepage content type definitions
export interface HomepageContentData {
  // Welcome Section
  mainHeading: string;
  heroSubheading: string;
  nowOpenBadge: string;
  serviceOptionsBadge: string;
  ctaHeading: string;
  ctaDescription: string;
  qualityFeatureText: string;
  locationFeatureText: string;
  parkingFeatureText: string;
  backgroundColor: string;
}

export interface HomepageContentKeys {
  'homepage-main-heading': string;
  'homepage-hero-subheading': string;
  'homepage-now-open-badge': string;
  'homepage-service-options-badge': string;
  'homepage-cta-heading': string;
  'homepage-cta-description': string;
  'homepage-quality-feature-text': string;
  'homepage-location-feature-text': string;
  'homepage-parking-feature-text': string;
  'homepage-background-color': string;
}

// Default homepage content
export const DEFAULT_HOMEPAGE_CONTENT: HomepageContentData = {
  mainHeading: 'Welcome to Little Latte Lane',
  heroSubheading: 'Café & Deli - Where Great Food Meets Amazing Experiences',
  nowOpenBadge: 'Now Open',
  serviceOptionsBadge: 'Dine In • Takeaway • Delivery',
  ctaHeading: 'Ready to Experience Little Latte Lane?',
  ctaDescription: "Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you're catching up with friends, having a business meeting, or enjoying a quiet moment, we're here to make your experience memorable.",
  qualityFeatureText: 'Exceptional Quality',
  locationFeatureText: 'Prime Location',
  parkingFeatureText: 'Easy Parking',
  backgroundColor: 'from-darkBg via-gray-900 to-darkBg'
};

// Mapping between content properties and database keys
const CONTENT_KEY_MAPPING: Record<keyof HomepageContentData, keyof HomepageContentKeys> = {
  mainHeading: 'homepage-main-heading',
  heroSubheading: 'homepage-hero-subheading',
  nowOpenBadge: 'homepage-now-open-badge',
  serviceOptionsBadge: 'homepage-service-options-badge',
  ctaHeading: 'homepage-cta-heading',
  ctaDescription: 'homepage-cta-description',
  qualityFeatureText: 'homepage-quality-feature-text',
  locationFeatureText: 'homepage-location-feature-text',
  parkingFeatureText: 'homepage-parking-feature-text',
  backgroundColor: 'homepage-background-color'
};

/**
 * Service for managing homepage content persistence to database
 */
export class HomepageContentService {
  private static readonly PAGE_SCOPE = 'homepage';
  private static readonly CATEGORY = 'content';

  /**
   * Load all homepage content from database
   * Returns default content if no database values exist
   */
  static async loadHomepageContent(): Promise<HomepageContentData> {
    try {
      console.log('🔄 Loading homepage content from database...');
      
      const supabase = getSupabaseClient();
      
      // Load all homepage settings from database
      const { data: settings, error } = await supabase
        .from('theme_settings')
        .select('*')
        .like('setting_key', `${this.PAGE_SCOPE}-%`)
        .eq('category', this.CATEGORY)
        .order('setting_key');

      if (error) throw error;

      console.log(`📊 Found ${settings?.length || 0} homepage settings in database`);

      // Build content object from database values, falling back to defaults
      const content: HomepageContentData = { ...DEFAULT_HOMEPAGE_CONTENT };

      // Map database values to content properties
      for (const [contentKey, dbKey] of Object.entries(CONTENT_KEY_MAPPING)) {
        const typedContentKey = contentKey as keyof HomepageContentData;
        const setting = settings?.find((s: Database['public']['Tables']['theme_settings']['Row']) => s.setting_key === dbKey);
        if (setting && setting.setting_value) {
          content[typedContentKey] = setting.setting_value;
          console.log(`✅ Loaded ${contentKey}: ${setting.setting_value.substring(0, 50)}...`);
        } else {
          const defaultValue = content[typedContentKey];
          console.log(`📋 Using default ${contentKey}: ${defaultValue.substring(0, 50)}...`);
        }
      }

      console.log('✅ Homepage content loaded successfully');
      return content;

    } catch (error) {
      console.error('❌ Error loading homepage content:', error);
      console.log('🔄 Falling back to default content');
      return DEFAULT_HOMEPAGE_CONTENT;
    }
  }

  /**
   * Save a single homepage content field to database
   */
  static async saveHomepageContentField(
    contentKey: keyof HomepageContentData,
    value: string
  ): Promise<void> {
    try {
      const dbKey = CONTENT_KEY_MAPPING[contentKey];
      
      console.log(`💾 Saving ${contentKey} to database as ${dbKey}...`);
      console.log(`📝 Value: ${value.substring(0, 100)}...`);

      const supabase = getSupabaseClient();

      // Check if setting already exists
      const { data: existing, error: selectError } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('setting_key', dbKey)
        .single();

      if (selectError && selectError.code !== 'PGRST116') throw selectError;

      if (existing) {
        // Update existing setting
        const { error } = await supabase
          .from('theme_settings')
          .update({
            setting_value: value,
            updated_at: new Date().toISOString(),
            category: this.CATEGORY
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Create new setting
        const newSetting: ThemeSettingInsert = {
          setting_key: dbKey,
          setting_value: value,
          category: this.CATEGORY,
        };
        
        const { error } = await supabase
          .from('theme_settings')
          .insert(newSetting);
        
        if (error) throw error;
      }

      console.log(`✅ Successfully saved ${contentKey} to database`);

    } catch (error) {
      console.error(`❌ Error saving ${contentKey}:`, error);
      throw error;
    }
  }

  /**
   * Save multiple homepage content fields to database
   */
  static async saveHomepageContent(content: Partial<HomepageContentData>): Promise<void> {
    try {
      console.log(`💾 Saving ${Object.keys(content).length} homepage content fields...`);

      // Save each field individually
      const savePromises = Object.entries(content).map(([key, value]) =>
        this.saveHomepageContentField(key as keyof HomepageContentData, value)
      );

      await Promise.all(savePromises);

      console.log('✅ All homepage content saved successfully');

    } catch (error) {
      console.error('❌ Error saving homepage content:', error);
      throw error;
    }
  }

  /**
   * Reset homepage content to defaults
   */
  static async resetHomepageContent(): Promise<void> {
    try {
      console.log('🔄 Resetting homepage content to defaults...');

      await this.saveHomepageContent(DEFAULT_HOMEPAGE_CONTENT);

      console.log('✅ Homepage content reset to defaults');

    } catch (error) {
      console.error('❌ Error resetting homepage content:', error);
      throw error;
    }
  }

  /**
   * Get a specific homepage content value from database
   */
  static async getHomepageContentField(
    contentKey: keyof HomepageContentData
  ): Promise<string> {
    try {
      const dbKey = CONTENT_KEY_MAPPING[contentKey];
      
      const supabase = getSupabaseClient();
      
      const { data: setting, error } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('setting_key', dbKey)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (setting && setting.setting_value) {
        return setting.setting_value;
      }

      // Return default if not found
      return DEFAULT_HOMEPAGE_CONTENT[contentKey];

    } catch (error) {
      console.error(`❌ Error getting ${contentKey}:`, error);
      // Return default on error
      return DEFAULT_HOMEPAGE_CONTENT[contentKey];
    }
  }

  /**
   * Check if any homepage content exists in database
   */
  static async hasCustomHomepageContent(): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      
      const { data: settings, error } = await supabase
        .from('theme_settings')
        .select('*')
        .like('setting_key', `${this.PAGE_SCOPE}-%`)
        .eq('category', this.CATEGORY);

      if (error) throw error;

      return (settings?.length || 0) > 0;

    } catch (error) {
      console.error('❌ Error checking for custom homepage content:', error);
      return false;
    }
  }
}
