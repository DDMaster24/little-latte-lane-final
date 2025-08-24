-- Visual Theme Editor Database Schema
-- This creates the foundation for the customizable theme system

-- Create theme_settings table to store all visual customizations
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  setting_type text NOT NULL DEFAULT 'text', -- 'color', 'font', 'number', 'text', 'image', 'json'
  category text NOT NULL DEFAULT 'general', -- 'colors', 'typography', 'layout', 'content', 'images'
  page_scope text DEFAULT 'global', -- 'global', 'homepage', 'menu', 'admin' etc
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_theme_settings_key ON public.theme_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_theme_settings_category ON public.theme_settings(category);
CREATE INDEX IF NOT EXISTS idx_theme_settings_page ON public.theme_settings(page_scope);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can modify theme settings
CREATE POLICY "Admin can manage theme settings" ON public.theme_settings
  FOR ALL USING (public.is_admin());

CREATE POLICY "Everyone can view theme settings" ON public.theme_settings
  FOR SELECT USING (true);

-- Grant permissions
GRANT ALL ON public.theme_settings TO authenticated;
GRANT ALL ON public.theme_settings TO service_role;

-- Insert default theme settings
INSERT INTO public.theme_settings (setting_key, setting_value, setting_type, category, description) VALUES
-- Color Settings
('primary_color', '#00FFFF', 'color', 'colors', 'Primary neon cyan color'),
('secondary_color', '#FF00FF', 'color', 'colors', 'Secondary neon pink color'),
('accent_color', '#0066FF', 'color', 'colors', 'Accent neon blue color'),
('background_primary', '#111827', 'color', 'colors', 'Main background color'),
('background_secondary', '#1F2937', 'color', 'colors', 'Secondary background color'),
('text_primary', '#FFFFFF', 'color', 'colors', 'Primary text color'),
('text_secondary', '#9CA3AF', 'color', 'colors', 'Secondary text color'),

-- Typography Settings
('font_family_primary', 'Inter, system-ui, sans-serif', 'font', 'typography', 'Primary font family'),
('font_family_secondary', 'Inter, system-ui, sans-serif', 'font', 'typography', 'Secondary font family'),
('font_size_base', '16', 'number', 'typography', 'Base font size in pixels'),
('font_size_heading', '48', 'number', 'typography', 'Main heading font size'),
('line_height_base', '1.5', 'number', 'typography', 'Base line height'),

-- Layout Settings
('container_max_width', '1200', 'number', 'layout', 'Maximum container width'),
('section_padding', '96', 'number', 'layout', 'Section padding in pixels'),
('border_radius', '12', 'number', 'layout', 'Default border radius'),

-- Content Settings
('site_title', 'Little Latte Lane', 'text', 'content', 'Main site title'),
('site_tagline', 'Delicious Coffee & Authentic Flavors', 'text', 'content', 'Site tagline'),
('welcome_title', 'Welcome to Little Latte Lane', 'text', 'content', 'Homepage welcome title'),
('welcome_description', 'Experience the perfect blend of rich coffee and delicious food in our cozy café.', 'text', 'content', 'Homepage welcome description')

ON CONFLICT (setting_key) DO NOTHING;

-- Create update trigger
CREATE OR REPLACE FUNCTION update_theme_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_theme_settings_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.theme_settings IS 'Stores all visual theme customizations for the website';
COMMENT ON COLUMN public.theme_settings.setting_key IS 'Unique identifier for the setting (e.g., primary_color, font_size_base)';
COMMENT ON COLUMN public.theme_settings.setting_value IS 'The actual value of the setting (color hex, font name, pixel value, etc.)';
COMMENT ON COLUMN public.theme_settings.setting_type IS 'Data type of the setting for proper rendering in editor';
COMMENT ON COLUMN public.theme_settings.category IS 'Grouping category for organization in the editor';
COMMENT ON COLUMN public.theme_settings.page_scope IS 'Which pages this setting applies to (global, homepage, menu, etc.)';