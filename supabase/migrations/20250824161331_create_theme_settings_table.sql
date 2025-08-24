-- Create theme_settings table for visual editor
-- This table stores customizable content and theme settings

CREATE TABLE IF NOT EXISTS public.theme_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    page_scope TEXT DEFAULT 'global',
    category TEXT DEFAULT 'general',
    setting_type TEXT DEFAULT 'text',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to prevent duplicate settings
CREATE UNIQUE INDEX IF NOT EXISTS idx_theme_settings_unique 
ON public.theme_settings (setting_key, page_scope);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_theme_settings_page_scope 
ON public.theme_settings (page_scope);

CREATE INDEX IF NOT EXISTS idx_theme_settings_category 
ON public.theme_settings (category);

-- Enable RLS (Row Level Security)
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for theme_settings access
-- Allow admins to do everything
CREATE POLICY "Admins can manage theme settings" ON public.theme_settings
    FOR ALL USING (public.is_staff_or_admin());

-- Allow everyone to read theme settings (for displaying content)
CREATE POLICY "Everyone can read theme settings" ON public.theme_settings
    FOR SELECT USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_theme_settings_updated_at
    BEFORE UPDATE ON public.theme_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.theme_settings (setting_key, setting_value, page_scope, category, setting_type, description)
VALUES 
    ('site_title', 'Little Latte Lane', 'global', 'branding', 'text', 'Main site title'),
    ('welcome_message', 'Welcome to Little Latte Lane - Your cozy neighborhood café!', 'homepage', 'content', 'text', 'Homepage welcome message')
ON CONFLICT (setting_key, page_scope) DO NOTHING;