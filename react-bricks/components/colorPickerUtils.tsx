import { types } from 'react-bricks/frontend'
import SimpleColorPicker from './SimpleColorPicker'

// Predefined color palettes for different contexts
export const NEON_PALETTE = [
  { color: '#00ffff', className: 'text-neonCyan' },
  { color: '#ff00ff', className: 'text-neonPink' }, 
  { color: '#ffff00', className: 'text-neonYellow' },
  { color: '#00ff00', className: 'text-neonGreen' },
  { color: '#ff0080', className: 'text-neonHotPink' },
  { color: '#8000ff', className: 'text-neonPurple' },
  { color: '#ff8000', className: 'text-neonOrange' },
  { color: '#0080ff', className: 'text-neonBlue' },
]

export const BACKGROUND_PALETTE = [
  { color: '#000000', className: 'bg-black' },
  { color: '#1f2937', className: 'bg-gray-800' },
  { color: '#374151', className: 'bg-gray-700' },
  { color: '#0f0f0f', className: 'bg-darkBg' },
  { color: '#111827', className: 'bg-gray-900' },
  { color: 'transparent', className: 'bg-transparent' },
]

export const TEXT_PALETTE = [
  { color: '#ffffff', className: 'text-white' },
  { color: '#f9fafb', className: 'text-gray-50' },
  { color: '#e5e7eb', className: 'text-gray-200' },
  { color: '#d1d5db', className: 'text-gray-300' },
  { color: '#9ca3af', className: 'text-gray-400' },
  { color: '#6b7280', className: 'text-gray-500' },
  ...NEON_PALETTE
]

// Utility function to create advanced color picker side edit props
export const createAdvancedColorProp = (
  name: string,
  label: string,
  options: {
    includeTransparency?: boolean
    presetColors?: Array<{ color: string; className?: string }>
    supportGradient?: boolean
    show?: (props: Record<string, unknown>) => boolean
  } = {}
): types.ISideEditProp => ({
  name,
  label,
  type: types.SideEditPropType.Custom,
  component: SimpleColorPicker,
  show: options.show
})

// NEW: Helper function specifically for gradient-capable color props (Phase 4)
// Temporarily disabled for Phase 1 - will be implemented in Phase 4
/*
export const createGradientColorProp = (
  name: string,
  label: string,
  options: {
    presetColors?: Array<{ color: string; className?: string }>
    show?: (props: Record<string, unknown>) => boolean
  } = {}
): types.ISideEditProp => ({
  name,
  label,
  type: types.SideEditPropType.Custom,
  component: SimpleColorPicker, // Will be enhanced in Phase 4
  show: options.show
})
*/

// Utility function to create grouped color controls
export const createColorGroup = (
  groupName: string,
  colorProps: Array<{
    name: string
    label: string
    includeTransparency?: boolean
    presetColors?: Array<{ color: string; className?: string }>
  }>,
  options: {
    defaultOpen?: boolean
    show?: (props: Record<string, unknown>) => boolean
  } = {}
) => ({
  groupName,
  defaultOpen: options.defaultOpen ?? false,
  show: options.show,
  props: colorProps.map(prop => createAdvancedColorProp(
    prop.name,
    prop.label,
    {
      includeTransparency: prop.includeTransparency,
      presetColors: prop.presetColors
    }
  ))
})

// Quick preset configurations
export const TYPOGRAPHY_COLOR_GROUP = createColorGroup(
  'Typography & Colors',
  [
    {
      name: 'titleColor',
      label: 'Title Color',
      presetColors: TEXT_PALETTE
    },
    {
      name: 'subtitleColor', 
      label: 'Subtitle Color',
      presetColors: TEXT_PALETTE
    },
    {
      name: 'descriptionColor',
      label: 'Description Color', 
      presetColors: TEXT_PALETTE
    }
  ]
)

export const BACKGROUND_COLOR_GROUP = createColorGroup(
  'Background & Design',
  [
    {
      name: 'backgroundColor',
      label: 'Background Color',
      includeTransparency: true,
      presetColors: BACKGROUND_PALETTE
    },
    {
      name: 'accentColor',
      label: 'Accent Color',
      presetColors: NEON_PALETTE
    }
  ]
)

export default SimpleColorPicker
