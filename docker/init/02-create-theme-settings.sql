-- Create theme_settings table for visual editor
-- This will be automatically executed when Docker container starts

CREATE TABLE IF NOT EXISTS public.theme_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    page_scope TEXT DEFAULT 'global',
    category TEXT DEFAULT 'visual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    CONSTRAINT unique_setting_per_page UNIQUE(setting_key, page_scope)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_theme_settings_key_page ON public.theme_settings(setting_key, page_scope);
CREATE INDEX IF NOT EXISTS idx_theme_settings_category ON public.theme_settings(category);
CREATE INDEX IF NOT EXISTS idx_theme_settings_created_at ON public.theme_settings(created_at);

-- Update function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS theme_settings_updated_at ON public.theme_settings;
CREATE TRIGGER theme_settings_updated_at
    BEFORE UPDATE ON public.theme_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comment
COMMENT ON TABLE public.theme_settings IS 'Stores visual editor settings and customizations for local development';

-- Insert sample data for testing
INSERT INTO public.theme_settings (setting_key, setting_value, page_scope, category) VALUES
('homepage_welcome_text', 'Welcome to Little Latte Lane!', 'homepage', 'content'),
('global_theme_color', 'neon-cyan', 'global', 'visual'),
('menu_layout_style', 'grid', 'menu', 'layout')
ON CONFLICT (setting_key, page_scope) DO NOTHING;
