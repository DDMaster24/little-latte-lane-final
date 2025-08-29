-- Enhance Events & Specials System for Admin Editing
-- This script ensures the events table has all necessary fields and creates supporting infrastructure

-- First, check the current events table structure and enhance if needed
DO $$ 
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='background_image') THEN
    ALTER TABLE events ADD COLUMN background_image TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='background_color') THEN
    ALTER TABLE events ADD COLUMN background_color TEXT DEFAULT '#1a1a1a';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='text_color') THEN
    ALTER TABLE events ADD COLUMN text_color TEXT DEFAULT '#ffffff';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='button_text') THEN
    ALTER TABLE events ADD COLUMN button_text TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='button_link') THEN
    ALTER TABLE events ADD COLUMN button_link TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='priority') THEN
    ALTER TABLE events ADD COLUMN priority INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='display_order') THEN
    ALTER TABLE events ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create events_section_settings table for section-level customization
CREATE TABLE IF NOT EXISTS events_section_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title TEXT DEFAULT 'Events & Specials',
  section_subtitle TEXT DEFAULT 'Stay updated with our latest happenings',
  section_background_image TEXT,
  section_background_color TEXT DEFAULT '#0f0f0f',
  section_text_color TEXT DEFAULT '#ffffff',
  title_gradient TEXT DEFAULT 'bg-neon-gradient',
  max_events_display INTEGER DEFAULT 6,
  layout_style TEXT DEFAULT 'grid' CHECK (layout_style IN ('grid', 'carousel', 'list')),
  show_icons BOOLEAN DEFAULT true,
  show_dates BOOLEAN DEFAULT true,
  show_buttons BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings if table is empty
INSERT INTO events_section_settings (section_title, section_subtitle)
SELECT 'Events & Specials', 'Stay updated with our latest happenings'
WHERE NOT EXISTS (SELECT 1 FROM events_section_settings);

-- Enable RLS for events_section_settings
ALTER TABLE events_section_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events_section_settings (admin only)
CREATE POLICY "Admin users can manage events section settings"
  ON events_section_settings
  FOR ALL
  USING (public.is_staff_or_admin());

-- Update existing RLS policies for events table to ensure admin access
DROP POLICY IF EXISTS "Admin users can manage events" ON events;
CREATE POLICY "Admin users can manage events"
  ON events
  FOR ALL
  USING (public.is_staff_or_admin());

-- Create policy for public to view active events
DROP POLICY IF EXISTS "Public can view active events" ON events;
CREATE POLICY "Public can view active events"
  ON events
  FOR SELECT
  USING (is_active = true);

-- Insert sample events for testing (only if events table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM events LIMIT 1) THEN
    INSERT INTO events (
      title, 
      description, 
      event_type, 
      start_date, 
      end_date, 
      is_active, 
      background_color, 
      text_color, 
      button_text, 
      button_link, 
      priority,
      display_order
    ) VALUES 
    (
      'Welcome Special', 
      'Get 20% off your first order! Perfect for new customers trying our amazing food and coffee.',
      'special',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      true,
      '#ff6b35',
      '#ffffff',
      'Claim Special',
      '/menu',
      10,
      1
    ),
    (
      'Live Music Night', 
      'Join us every Friday evening for live acoustic performances by local artists. Great music, great food!',
      'event',
      CURRENT_DATE + INTERVAL '2 days',
      CURRENT_DATE + INTERVAL '32 days',
      true,
      '#8b5cf6',
      '#ffffff',
      'Reserve Table',
      '/bookings',
      8,
      2
    ),
    (
      'Coffee Cupping Session', 
      'Learn about coffee with our expert baristas. Discover the flavors and aromas of our premium beans.',
      'event',
      CURRENT_DATE + INTERVAL '7 days',
      CURRENT_DATE + INTERVAL '7 days',
      true,
      '#06b6d4',
      '#ffffff',
      'Join Session',
      '/bookings',
      7,
      3
    );
  END IF;
END $$;

-- Create function to automatically update display_order when events are inserted
CREATE OR REPLACE FUNCTION update_events_display_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_order IS NULL OR NEW.display_order = 0 THEN
    NEW.display_order := COALESCE((SELECT MAX(display_order) FROM events) + 1, 1);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating display_order
DROP TRIGGER IF EXISTS trigger_update_events_display_order ON events;
CREATE TRIGGER trigger_update_events_display_order
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_display_order();

-- Create function to update updated_at timestamp for events_section_settings
CREATE OR REPLACE FUNCTION update_events_section_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on events_section_settings
DROP TRIGGER IF EXISTS update_events_section_settings_updated_at ON events_section_settings;
CREATE TRIGGER update_events_section_settings_updated_at
  BEFORE UPDATE ON events_section_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_events_section_settings_updated_at();
