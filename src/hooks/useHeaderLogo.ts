import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';

/**
 * Hook to get the header logo URL from theme settings
 * Falls back to default if no custom logo is set
 */
export function useHeaderLogo() {
  const [logoUrl, setLogoUrl] = useState('/images/new-logo.png'); // Default fallback
  const [isLoading, setIsLoading] = useState(true);

  const fetchHeaderLogo = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseClient();
      
      // Look for header logo setting
      const { data, error } = await supabase
        .from('theme_settings')
        .select('setting_value')
        .eq('setting_key', 'header-logo_image')
        .eq('category', 'page_editor')
        .single();

      if (!error && data?.setting_value) {
        console.log('🖼️ Custom header logo found:', data.setting_value);
        setLogoUrl(data.setting_value);
      } else {
        console.log('🖼️ Using default header logo');
        setLogoUrl('/images/new-logo.png');
      }
      // If no custom logo found, keep the default
    } catch (error) {
      console.error('Error fetching header logo:', error);
      // Keep default logo on error
      setLogoUrl('/images/new-logo.png');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeaderLogo();
  }, [fetchHeaderLogo]);

  // Return refresh function to manually reload logo
  return { logoUrl, isLoading, refreshLogo: fetchHeaderLogo };
}
