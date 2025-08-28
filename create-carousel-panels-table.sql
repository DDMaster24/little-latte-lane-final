-- Create carousel_panels table for dynamic carousel management
CREATE TABLE IF NOT EXISTS carousel_panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_order INTEGER NOT NULL,
  template_id TEXT NOT NULL,
  panel_id TEXT NOT NULL, -- unique identifier for this panel instance
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB NOT NULL DEFAULT '{}', -- All customizable content
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(panel_id)
);

-- Create RLS policies for carousel_panels
ALTER TABLE carousel_panels ENABLE ROW LEVEL SECURITY;

-- Allow admin users to manage carousel panels
CREATE POLICY "Admin users can manage carousel panels"
  ON carousel_panels
  FOR ALL
  USING (public.is_staff_or_admin());

-- Insert default panels based on current carousel
INSERT INTO carousel_panels (panel_order, template_id, panel_id, config) VALUES
(1, 'opening-hours', 'opening-hours', '{
  "title": {"enabled": true, "text": "Opening Hours"},
  "description": {"enabled": true, "text": "We''re here when you need us"},
  "icon": {"enabled": true, "name": "Clock"},
  "bgColor": "from-blue-900/50 to-cyan-900/50",
  "borderColor": "border-neonCyan",
  "schedule": {
    "enabled": true,
    "items": [
      {"day": "Mon - Fri", "hours": "06:00 - 22:00"},
      {"day": "Saturday", "hours": "07:00 - 23:00"},
      {"day": "Sunday", "hours": "08:00 - 21:00"}
    ]
  },
  "badge": {"enabled": true, "text": "Now Open", "color": "bg-green-500"}
}'),

(2, 'menu-showcase', 'menu-ordering', '{
  "title": {"enabled": true, "text": "Menu & Ordering"},
  "description": {"enabled": true, "text": "Delicious food, premium coffee"},
  "image": {"enabled": true, "src": "/images/food-drinks-neon-wp.png", "alt": "Menu Items"},
  "bgColor": "from-pink-900/50 to-rose-900/50",
  "borderColor": "border-neonPink",
  "featureGrid": {
    "enabled": true,
    "items": [
      {"icon": "Coffee", "text": "Premium Coffee", "enabled": true},
      {"icon": "Utensils", "text": "Fresh Meals", "enabled": true},
      {"icon": "Star", "text": "Daily Specials", "enabled": true},
      {"icon": "Wifi", "text": "Quick Orders", "enabled": true}
    ]
  }
}'),

(3, 'image-showcase', 'virtual-golf', '{
  "title": {"enabled": true, "text": "Virtual Golf"},
  "description": {"enabled": true, "text": "Coming Soon - Golf Simulator"},
  "image": {"enabled": true, "src": "/images/golf-coming-soon-wp.png", "alt": "Virtual Golf Coming Soon"},
  "bgColor": "from-green-900/50 to-emerald-900/50",
  "borderColor": "border-yellow-500",
  "badge": {"enabled": true, "text": "Coming This Year!", "color": "bg-gradient-to-r from-neonPink to-neonCyan"},
  "featureList": {
    "enabled": true,
    "items": [
      {"text": "⚡ Professional Simulator", "enabled": true},
      {"text": "⚡ Famous Golf Courses", "enabled": true},
      {"text": "⚡ Private Bookings", "enabled": true},
      {"text": "⚡ Tournament Events", "enabled": true}
    ]
  }
}'),

(4, 'events-promo', 'events-news', '{
  "title": {"enabled": true, "text": "Events & News"},
  "description": {"enabled": true, "text": "Stay updated with our latest"},
  "icon": {"enabled": true, "name": "Calendar"},
  "bgColor": "from-purple-900/50 to-violet-900/50",
  "borderColor": "border-yellow-500",
  "eventCards": {
    "enabled": true,
    "items": [
      {"title": "Live Music Night", "detail": "Every Friday 19:00", "enabled": true},
      {"title": "Coffee Cupping", "detail": "Saturdays 10:00", "enabled": true}
    ]
  }
}'),

(5, 'social-media', 'social-instagram', '{
  "title": {"enabled": true, "text": "Social / Instagram"},
  "description": {"enabled": true, "text": "Follow our journey"},
  "icon": {"enabled": true, "name": "Camera"},
  "bgColor": "from-pink-900/50 to-purple-900/50",
  "borderColor": "border-neonPink",
  "handle": {"enabled": true, "text": "@LittleLatteLane"},
  "socialGrid": {
    "enabled": true,
    "items": [
      {"text": "📸 Daily Specials", "enabled": true},
      {"text": "☕ Latte Art", "enabled": true},
      {"text": "🎉 Events", "enabled": true},
      {"text": "👥 Community", "enabled": true}
    ]
  }
}')

ON CONFLICT (panel_id) DO NOTHING;

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_carousel_panels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_carousel_panels_updated_at ON carousel_panels;
CREATE TRIGGER update_carousel_panels_updated_at
  BEFORE UPDATE ON carousel_panels
  FOR EACH ROW
  EXECUTE FUNCTION update_carousel_panels_updated_at();
