export interface PanelComponent {
  enabled: boolean;
  [key: string]: unknown;
}

export interface PanelConfig {
  title: PanelComponent & { text: string };
  description: PanelComponent & { text: string };
  bgColor: string;
  borderColor: string;
  icon?: PanelComponent & { name: string };
  image?: PanelComponent & { src: string; alt: string };
  badge?: PanelComponent & { text: string; color: string };
  schedule?: PanelComponent & { items: Array<{ day: string; hours: string }> };
  featureGrid?: PanelComponent & { items: Array<{ icon: string; text: string; enabled: boolean }> };
  featureList?: PanelComponent & { items: Array<{ text: string; enabled: boolean }> };
  eventCards?: PanelComponent & { items: Array<{ title: string; detail: string; enabled: boolean }> };
  socialGrid?: PanelComponent & { items: Array<{ text: string; enabled: boolean }> };
  handle?: PanelComponent & { text: string };
  customHtml?: PanelComponent & { content: string };
}

export interface CarouselPanel {
  id: string;
  panel_order: number;
  template_id: string;
  panel_id: string;
  is_active: boolean;
  config: PanelConfig;
  created_at: string;
  updated_at: string;
}

export interface PanelTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  components: string[];
  defaultConfig: PanelConfig;
}

export const PANEL_TEMPLATES: PanelTemplate[] = [
  {
    id: 'opening-hours',
    name: 'Opening Hours',
    description: 'Display business hours and status',
    icon: 'Clock',
    components: ['title', 'description', 'icon', 'schedule', 'badge'],
    defaultConfig: {
      title: { enabled: true, text: 'Opening Hours' },
      description: { enabled: true, text: 'We\'re here when you need us' },
      icon: { enabled: true, name: 'Clock' },
      bgColor: 'from-blue-900/50 to-cyan-900/50',
      borderColor: 'border-neonCyan',
      schedule: {
        enabled: true,
        items: [
          { day: 'Mon - Fri', hours: '06:00 - 18:00' },
          { day: 'Saturday', hours: '08:00 - 15:00' },
          { day: 'Sunday', hours: '08:00 - 13:00' }
        ]
      },
      badge: { enabled: true, text: 'Now Open', color: 'bg-green-500' }
    }
  },
  {
    id: 'menu-showcase',
    name: 'Menu & Food',
    description: 'Showcase menu items and features',
    icon: 'Utensils',
    components: ['title', 'description', 'image', 'featureGrid'],
    defaultConfig: {
      title: { enabled: true, text: 'Menu & Ordering' },
      description: { enabled: true, text: 'Delicious food, premium coffee' },
      image: { enabled: true, src: '/images/food-drinks-neon-wp.png', alt: 'Menu Items' },
      bgColor: 'from-pink-900/50 to-rose-900/50',
      borderColor: 'border-neonPink',
      featureGrid: {
        enabled: true,
        items: [
          { icon: 'Coffee', text: 'Premium Coffee', enabled: true },
          { icon: 'Utensils', text: 'Fresh Meals', enabled: true },
          { icon: 'Star', text: 'Daily Specials', enabled: true },
          { icon: 'Wifi', text: 'Quick Orders', enabled: true }
        ]
      }
    }
  },
  {
    id: 'image-showcase',
    name: 'Image Gallery',
    description: 'Feature images with text overlay',
    icon: 'ImageIcon',
    components: ['title', 'description', 'image', 'badge', 'featureList'],
    defaultConfig: {
      title: { enabled: true, text: 'Image Showcase' },
      description: { enabled: true, text: 'Beautiful visuals' },
      image: { enabled: true, src: '/images/placeholder.jpg', alt: 'Showcase Image' },
      bgColor: 'from-green-900/50 to-emerald-900/50',
      borderColor: 'border-yellow-500',
      badge: { enabled: true, text: 'Featured!', color: 'bg-gradient-to-r from-neonPink to-neonCyan' },
      featureList: {
        enabled: true,
        items: [
          { text: '⚡ Amazing Feature 1', enabled: true },
          { text: '⚡ Amazing Feature 2', enabled: true },
          { text: '⚡ Amazing Feature 3', enabled: true },
          { text: '⚡ Amazing Feature 4', enabled: true }
        ]
      }
    }
  },
  {
    id: 'events-promo',
    name: 'Events & Promotions',
    description: 'Showcase events and special offers',
    icon: 'Calendar',
    components: ['title', 'description', 'icon', 'eventCards'],
    defaultConfig: {
      title: { enabled: true, text: 'Events & Promotions' },
      description: { enabled: true, text: 'Stay updated with our latest' },
      icon: { enabled: true, name: 'Calendar' },
      bgColor: 'from-purple-900/50 to-violet-900/50',
      borderColor: 'border-yellow-500',
      eventCards: {
        enabled: true,
        items: [
          { title: 'Special Event', detail: 'Coming Soon', enabled: true },
          { title: 'Daily Special', detail: 'Check In-Store', enabled: true }
        ]
      }
    }
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Connect with social media accounts',
    icon: 'Camera',
    components: ['title', 'description', 'icon', 'handle', 'socialGrid'],
    defaultConfig: {
      title: { enabled: true, text: 'Social Media' },
      description: { enabled: true, text: 'Follow our journey' },
      icon: { enabled: true, name: 'Camera' },
      bgColor: 'from-pink-900/50 to-purple-900/50',
      borderColor: 'border-neonPink',
      handle: { enabled: true, text: '@YourHandle' },
      socialGrid: {
        enabled: true,
        items: [
          { text: '📸 Daily Posts', enabled: true },
          { text: '☕ Behind Scenes', enabled: true },
          { text: '🎉 Events', enabled: true },
          { text: '👥 Community', enabled: true }
        ]
      }
    }
  },
  {
    id: 'contact-info',
    name: 'Contact & Location',
    description: 'Display contact information',
    icon: 'MapPin',
    components: ['title', 'description', 'icon', 'featureGrid', 'badge'],
    defaultConfig: {
      title: { enabled: true, text: 'Contact Us' },
      description: { enabled: true, text: 'Get in touch' },
      icon: { enabled: true, name: 'MapPin' },
      bgColor: 'from-cyan-900/50 to-blue-900/50',
      borderColor: 'border-neonCyan',
      featureGrid: {
        enabled: true,
        items: [
          { icon: 'Phone', text: '123-456-7890', enabled: true },
          { icon: 'Mail', text: 'info@example.com', enabled: true },
          { icon: 'MapPin', text: 'Your Address', enabled: true },
          { icon: 'Clock', text: 'Open Daily', enabled: true }
        ]
      },
      badge: { enabled: true, text: 'Visit Us', color: 'bg-neonCyan' }
    }
  },
  {
    id: 'custom-content',
    name: 'Custom Content',
    description: 'Create custom content panel',
    icon: 'Edit',
    components: ['title', 'description', 'customHtml', 'badge'],
    defaultConfig: {
      title: { enabled: true, text: 'Custom Panel' },
      description: { enabled: true, text: 'Your custom content' },
      bgColor: 'from-gray-900/50 to-slate-900/50',
      borderColor: 'border-gray-500',
      customHtml: { enabled: true, content: '<p class="text-center">Add your custom content here</p>' },
      badge: { enabled: false, text: 'Custom', color: 'bg-gray-500' }
    }
  }
];

// Helper function to get template by ID
export function getTemplateById(templateId: string): PanelTemplate | undefined {
  return PANEL_TEMPLATES.find(template => template.id === templateId);
}

// Helper function to create new panel with template
export function createPanelFromTemplate(
  templateId: string, 
  panelId: string, 
  order: number,
  customConfig?: Partial<PanelConfig>
): Omit<CarouselPanel, 'id' | 'created_at' | 'updated_at'> {
  const template = getTemplateById(templateId);
  
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  return {
    panel_order: order,
    template_id: templateId,
    panel_id: panelId,
    is_active: true,
    config: {
      ...template.defaultConfig,
      ...customConfig
    }
  };
}
