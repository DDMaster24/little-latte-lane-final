-- Create events table with comprehensive admin editing features
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_type VARCHAR(50) DEFAULT 'event' CHECK (event_type IN ('event', 'special', 'news')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    background_image TEXT,
    background_color VARCHAR(7) DEFAULT '#1a1a1a',
    text_color VARCHAR(7) DEFAULT '#ffffff',
    button_text VARCHAR(100),
    button_link TEXT,
    priority INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample events for testing
INSERT INTO events (title, description, event_type, start_date, end_date, background_color, text_color, button_text, button_link, priority) VALUES
('Grand Opening Special', 'Join us for our grand opening celebration with 50% off all menu items!', 'special', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '#ff6b35', '#ffffff', 'Claim Offer', '/menu', 10),
('Live Jazz Night', 'Enjoy smooth jazz performances every Friday night starting at 8 PM.', 'event', CURRENT_DATE + INTERVAL '3 days', NULL, '#4a5568', '#ffffff', 'Reserve Table', '/reservations', 8),
('New Menu Launch', 'Discover our exciting new seasonal menu featuring fresh, local ingredients.', 'news', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', '#38a169', '#ffffff', 'View Menu', '/menu', 9);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for events table
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for events_section_settings
DROP TRIGGER IF EXISTS update_events_section_settings_updated_at ON events_section_settings;
CREATE TRIGGER update_events_section_settings_updated_at
    BEFORE UPDATE ON events_section_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some additional helpful indexes
CREATE INDEX IF NOT EXISTS idx_events_active_date ON events (is_active, start_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_priority ON events (priority DESC);

-- Add updated_at column to events_section_settings if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events_section_settings' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE events_section_settings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Insert default section settings if none exist
INSERT INTO events_section_settings (
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
) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM events_section_settings LIMIT 1);

-- Display what we created
SELECT 'Tables created successfully:' AS status;
\dt
SELECT 'Sample events:' AS status;
SELECT id, title, event_type, start_date, is_active FROM events;
SELECT 'Section settings:' AS status;
SELECT * FROM events_section_settings;
