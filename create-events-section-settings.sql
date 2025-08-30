-- Create events_section_settings table
-- This table stores configuration for the events section on the homepage

CREATE TABLE IF NOT EXISTS public.events_section_settings (
    id SERIAL PRIMARY KEY,
    section_title TEXT DEFAULT 'Events & Specials',
    section_subtitle TEXT DEFAULT 'Stay updated with our latest happenings',
    section_background_color TEXT DEFAULT '#0f0f0f',
    section_text_color TEXT DEFAULT '#ffffff',
    title_gradient TEXT DEFAULT 'bg-neon-gradient',
    max_events_display INTEGER DEFAULT 6,
    layout_style TEXT DEFAULT 'grid',
    show_icons BOOLEAN DEFAULT true,
    show_dates BOOLEAN DEFAULT true,
    show_buttons BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE public.events_section_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.events_section_settings
    FOR SELECT USING (true);

-- Allow staff/admin write access  
CREATE POLICY "Allow staff/admin write access" ON public.events_section_settings
    FOR ALL USING (public.is_staff_or_admin());

-- Insert default settings
INSERT INTO public.events_section_settings (
    section_title,
    section_subtitle,
    section_background_color,
    section_text_color,
    title_gradient,
    max_events_display,
    layout_style,
    show_icons,
    show_dates,
    show_buttons
) VALUES (
    'Events & Specials',
    'Stay updated with our latest happenings',
    '#0f0f0f',
    '#ffffff', 
    'bg-neon-gradient',
    6,
    'grid',
    true,
    true,
    true
) ON CONFLICT DO NOTHING;

-- Create update trigger
CREATE OR REPLACE FUNCTION update_events_section_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_section_settings_updated_at
    BEFORE UPDATE ON public.events_section_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_events_section_settings_updated_at();
