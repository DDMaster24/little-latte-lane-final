// Component type definitions for the page editor
export type ComponentType = 'text' | 'background' | 'badge' | 'section' | 'image' | 'button';

export interface EditableComponent {
  id: string;
  name: string;
  type: ComponentType;
  allowedTools: ('text' | 'color' | 'background' | 'image')[];
  dbKey: string; // Database key for persistence
  description: string;
}

export interface ComponentTypeConfig {
  type: ComponentType;
  allowedTools: ('text' | 'color' | 'background' | 'image')[];
  icon: string;
  description: string;
}

// Component type configurations
export const COMPONENT_TYPE_CONFIGS: Record<ComponentType, ComponentTypeConfig> = {
  text: {
    type: 'text',
    allowedTools: ['text', 'color'],
    icon: '🔤',
    description: 'Text content with styling options'
  },
  background: {
    type: 'background',
    allowedTools: ['background', 'color'],
    icon: '🎨',
    description: 'Background colors and gradients'
  },
  badge: {
    type: 'badge',
    allowedTools: ['text', 'color', 'background'],
    icon: '🏷️',
    description: 'Text with background styling'
  },
  section: {
    type: 'section',
    allowedTools: ['background', 'color'],
    icon: '📦',
    description: 'Page section with background'
  },
  image: {
    type: 'image',
    allowedTools: ['image'],
    icon: '🖼️',
    description: 'Images and media content'
  },
  button: {
    type: 'button',
    allowedTools: ['text', 'color', 'background'],
    icon: '🔘',
    description: 'Interactive buttons'
  }
};

// Homepage component registry - every editable component
export const HOMEPAGE_COMPONENTS: EditableComponent[] = [
  {
    id: 'main-heading',
    name: 'Main Heading',
    type: 'text',
    allowedTools: ['text', 'color'],
    dbKey: 'homepage-main-heading',
    description: 'Primary page heading text'
  },
  {
    id: 'hero-subheading', 
    name: 'Hero Subheading',
    type: 'text',
    allowedTools: ['text', 'color'],
    dbKey: 'homepage-hero-subheading',
    description: 'Subtitle below main heading'
  },
  {
    id: 'now-open-badge',
    name: 'Now Open Badge',
    type: 'badge',
    allowedTools: ['text', 'color', 'background'],
    dbKey: 'homepage-now-open-badge',
    description: 'Status badge with background'
  },
  {
    id: 'service-options-badge',
    name: 'Service Options Badge', 
    type: 'badge',
    allowedTools: ['text', 'color', 'background'],
    dbKey: 'homepage-service-options-badge',
    description: 'Service options with background'
  },
  {
    id: 'cta-heading',
    name: 'CTA Heading',
    type: 'text',
    allowedTools: ['text', 'color'],
    dbKey: 'homepage-cta-heading',
    description: 'Call to action heading'
  },
  {
    id: 'cta-description',
    name: 'CTA Description',
    type: 'text', 
    allowedTools: ['text', 'color'],
    dbKey: 'homepage-cta-description',
    description: 'Call to action description text'
  },
  {
    id: 'quality-feature',
    name: 'Quality Feature Text',
    type: 'text',
    allowedTools: ['text', 'color'],
    dbKey: 'homepage-quality-feature-text',
    description: 'Quality feature description'
  },
  {
    id: 'location-feature',
    name: 'Location Feature Text',
    type: 'text',
    allowedTools: ['text', 'color'],
    dbKey: 'homepage-location-feature-text',
    description: 'Location feature description'
  },
  {
    id: 'parking-feature',
    name: 'Parking Feature Text',
    type: 'text',
    allowedTools: ['text', 'color'],
    dbKey: 'homepage-parking-feature-text',
    description: 'Parking feature description'
  },
  {
    id: 'section-background',
    name: 'Section Background',
    type: 'background',
    allowedTools: ['background', 'color'],
    dbKey: 'homepage-background-color',
    description: 'Main section background style'
  }
];

// Helper functions
export function getComponentById(id: string): EditableComponent | undefined {
  return HOMEPAGE_COMPONENTS.find(comp => comp.id === id);
}

export function getComponentsByType(type: ComponentType): EditableComponent[] {
  return HOMEPAGE_COMPONENTS.filter(comp => comp.type === type);
}

export function getAvailableToolsForComponent(componentId: string): ('text' | 'color' | 'background' | 'image')[] {
  const component = getComponentById(componentId);
  return component?.allowedTools || [];
}

export function isToolAllowedForComponent(componentId: string, tool: 'text' | 'color' | 'background' | 'image'): boolean {
  const allowedTools = getAvailableToolsForComponent(componentId);
  return allowedTools.includes(tool);
}
