import React from 'react'
import { Text, types } from 'react-bricks/frontend'
import Link from 'next/link'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Main Component: Bookings Section
//========================================
interface BookingsSectionProps {
  // Content
  sectionTitle: types.TextValue
  sectionDescription: types.TextValue
  ctaButtonText: types.TextValue
  ctaButtonLink: string
  sectionIcon: types.TextValue
  sectionBadge?: types.TextValue
  backgroundImage?: types.IImageSource

  // Content Display Controls
  showTitle: boolean
  showDescription: boolean
  showIcon: boolean
  showBadge: boolean
  showPrimaryButton: boolean
  showSecondaryButton: boolean
  showDecorativeElements: boolean

  // Layout & Positioning
  textAlignment: 'left' | 'center' | 'right'
  contentLayout: 'standard' | 'stacked' | 'side-by-side' | 'hero'
  iconPosition: 'top' | 'side' | 'background'
  buttonAlignment: 'left' | 'center' | 'right' | 'full-width'

  // Typography & Colors
  backgroundColor: string
  titleColor: { color: string }
  descriptionColor: { color: string }
  borderColor: { color: string }
  accentColor: { color: string }

  // Button Styling
  buttonStyle: 'neon' | 'solid' | 'outline' | 'gradient' | 'glass'
  buttonColor: 'neon' | 'pink' | 'cyan' | 'yellow'
  secondaryButtonText?: types.TextValue
  secondaryButtonLink?: string
  secondaryButtonStyle: 'outline' | 'minimal' | 'text'

  // Visual Effects
  enableGlassEffect: boolean
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong'
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  borderWidth: 'none' | 'thin' | 'medium' | 'thick'

  // Advanced Settings
  sectionPadding: 'sm' | 'md' | 'lg' | 'xl'
  contentSpacing: 'tight' | 'normal' | 'loose'
  animationStyle: 'fade' | 'slide' | 'scale' | 'bounce'
  customMaxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full'

  // Image Effects
  imageOpacity: number
  imageBlur: 'none' | 'sm' | 'md' | 'lg'
}

const BookingsSection: types.Brick<BookingsSectionProps> = ({
  // Content
  sectionTitle,
  sectionDescription,
  ctaButtonText,
  ctaButtonLink = '/bookings',
  sectionIcon,
  sectionBadge,
  backgroundImage,

  // Content Display
  showTitle = true,
  showDescription = true,
  showIcon = true,
  showBadge = false,
  showPrimaryButton = true,
  showSecondaryButton = false,
  showDecorativeElements = true,

  // Layout & Positioning
  textAlignment = 'center',
  contentLayout = 'standard',
  iconPosition = 'top',
  buttonAlignment = 'center',

  // Colors
  backgroundColor = '#0f0f0f',
  titleColor = { color: '#ffffff' },
  descriptionColor = { color: '#d1d5db' },
  borderColor = { color: '#00ffff' },
  accentColor = { color: '#00ffff' },

  // Button Styling
  buttonStyle = 'neon',
  buttonColor = 'neon',
  secondaryButtonText,
  secondaryButtonLink = '/menu',
  secondaryButtonStyle = 'outline',

  // Visual Effects
  enableGlassEffect = true,
  shadowIntensity = 'medium',
  borderRadius = 'lg',
  borderWidth = 'thin',

  // Advanced Settings
  sectionPadding = 'md',
  contentSpacing = 'normal',
  animationStyle = 'fade',
  customMaxWidth = 'lg',

  // Image Effects
  imageOpacity = 0.3,
  imageBlur = 'none'
}) => {
  // Enhanced styling functions (similar to EventsSpecialsSection)
  const getSectionClass = () => {
    const baseClasses = ['w-full', 'relative', 'transition-all', 'duration-300']
    
    // Border radius
    const radiusMap: Record<string, string> = {
      'none': 'rounded-none',
      'sm': 'rounded-sm',
      'md': 'rounded-md',
      'lg': 'rounded-xl',
      'xl': 'rounded-2xl'
    }
    baseClasses.push(radiusMap[borderRadius])

    // Shadow
    const shadowMap: Record<string, string> = {
      'none': '',
      'subtle': 'shadow-sm',
      'medium': 'shadow-lg shadow-neon',
      'strong': 'shadow-2xl shadow-neon'
    }
    if (shadowMap[shadowIntensity]) {
      baseClasses.push(shadowMap[shadowIntensity])
    }

    // Animation
    const animationMap: Record<string, string> = {
      'fade': 'animate-fade-in',
      'slide': 'animate-slide-up',
      'scale': 'animate-scale-in',
      'bounce': 'animate-bounce-in'
    }
    baseClasses.push(animationMap[animationStyle])

    return baseClasses.join(' ')
  }

  const getSectionStyle = () => {
    const style: React.CSSProperties = { backgroundColor }

    // Border styling
    const borderWidthMap: Record<string, string> = {
      'none': '0px',
      'thin': '1px',
      'medium': '2px',
      'thick': '3px'
    }

    if (borderWidth !== 'none') {
      style.borderWidth = borderWidthMap[borderWidth]
      style.borderStyle = 'solid'
      style.borderColor = borderColor?.color || '#00ffff'
    }

    // Background image
    if (backgroundImage) {
      const blurFilter = imageBlur !== 'none' ? `blur(${imageBlur === 'sm' ? '2px' : imageBlur === 'md' ? '4px' : '8px'})` : ''
      style.backgroundImage = `linear-gradient(rgba(0,0,0,${1 - imageOpacity}), rgba(0,0,0,${1 - imageOpacity})), url(${backgroundImage.src})`
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center'
      if (blurFilter) {
        style.filter = blurFilter
      }
    }

    return style
  }

  const getPaddingClass = () => {
    const paddingMap: Record<string, string> = {
      'sm': 'py-6 xs:py-8',
      'md': 'py-8 xs:py-12',
      'lg': 'py-12 xs:py-16',
      'xl': 'py-16 xs:py-20'
    }
    return paddingMap[sectionPadding]
  }

  const getTextAlignmentClass = () => {
    switch (textAlignment) {
      case 'left': return 'text-left'
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  const getContentSpacingClass = () => {
    const spacingMap: Record<string, string> = {
      'tight': 'space-y-2 xs:space-y-3',
      'normal': 'space-y-4 xs:space-y-6',
      'loose': 'space-y-6 xs:space-y-8'
    }
    return spacingMap[contentSpacing]
  }

  const getMaxWidthClass = () => {
    const maxWidthMap: Record<string, string> = {
      'sm': 'max-w-lg',
      'md': 'max-w-2xl',
      'lg': 'max-w-4xl',
      'xl': 'max-w-6xl',
      'full': 'max-w-full'
    }
    return maxWidthMap[customMaxWidth]
  }

  const getButtonClass = () => {
    const colorMap: Record<string, string> = {
      'neon': 'neon-button',
      'pink': 'bg-neonPink text-black hover:bg-neonYellow transition-all duration-300 font-semibold',
      'cyan': 'bg-neonCyan text-black hover:bg-neonPink transition-all duration-300 font-semibold',
      'yellow': 'bg-neonYellow text-black hover:bg-neonCyan transition-all duration-300 font-semibold'
    }

    switch (buttonStyle) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 font-semibold'
      case 'solid':
        return colorMap[buttonColor] || colorMap['neon']
      case 'outline':
        return `border-2 border-current text-current hover:bg-current hover:text-black transition-all duration-300 font-semibold`
      case 'gradient':
        return 'bg-gradient-to-r from-neonCyan to-neonPink text-black hover:from-neonPink hover:to-neonYellow transition-all duration-300 font-semibold'
      default:
        return 'neon-button'
    }
  }

  const getSecondaryButtonClass = () => {
    switch (secondaryButtonStyle) {
      case 'minimal':
        return 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/60 hover:text-white transition-all duration-300 font-semibold'
      case 'text':
        return 'text-gray-400 hover:text-neonCyan transition-all duration-300 underline decoration-dotted underline-offset-4'
      default: // outline
        return 'border-2 border-gray-400 text-gray-300 hover:border-neonCyan hover:text-neonCyan transition-all duration-300 font-semibold'
    }
  }

  const getButtonAlignmentClass = () => {
    switch (buttonAlignment) {
      case 'left': return 'justify-start'
      case 'center': return 'justify-center'
      case 'right': return 'justify-end'
      case 'full-width': return 'flex-col w-full'
      default: return 'justify-center'
    }
  }

  const getContainerClass = () => {
    const containerClasses = ['px-4 xs:px-6 sm:px-8', getMaxWidthClass(), 'mx-auto']
    
    if (enableGlassEffect) {
      containerClasses.push(
        'bg-black/20',
        'backdrop-blur-md',
        'border',
        'border-white/10',
        'rounded-xl',
        'p-6 xs:p-8 lg:p-12'
      )
    } else {
      containerClasses.push('p-6 xs:p-8')
    }
    
    containerClasses.push(getTextAlignmentClass())
    return containerClasses.join(' ')
  }

  const getColorAccent = () => {
    return accentColor?.color || '#00ffff'
  }

  return (
    <section 
      className={`${getSectionClass()} ${getPaddingClass()}`}
      style={getSectionStyle()}
    >
      <div className={getContainerClass()}>
        {/* Badge (if enabled) */}
        {showBadge && sectionBadge && (
          <div className="mb-4">
            <Text
              propName="sectionBadge"
              value={sectionBadge}
              renderBlock={(props) => (
                <span 
                  className="inline-block px-3 py-1 text-sm font-semibold rounded-full border border-current"
                  style={{ color: getColorAccent(), borderColor: getColorAccent() }}
                >
                  {props.children}
                </span>
              )}
              placeholder="NEW!"
            />
          </div>
        )}

        {/* Icon Section */}
        {showIcon && (
          <div className={`mb-4 ${iconPosition === 'side' ? 'inline-block mr-4' : 'block'}`}>
            <Text
              propName="sectionIcon"
              value={sectionIcon}
              renderBlock={(props) => (
                <span 
                  className="text-4xl xs:text-5xl sm:text-6xl filter drop-shadow-lg transition-transform duration-300 hover:scale-110"
                  style={{ color: getColorAccent() }}
                >
                  {props.children}
                </span>
              )}
              placeholder="📅"
            />
          </div>
        )}

        {/* Content Container with flexible spacing */}
        <div className={getContentSpacingClass()}>
          {/* Title */}
          {showTitle && (
            <Text
              propName="sectionTitle"
              value={sectionTitle}
              renderBlock={(props) => (
                <h2 
                  className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold transition-colors duration-300"
                  style={{ color: titleColor.color }}
                >
                  {props.children}
                </h2>
              )}
              placeholder="🏓 Ready to Play?"
            />
          )}

          {/* Description */}
          {showDescription && (
            <Text
              propName="sectionDescription"
              value={sectionDescription}
              renderBlock={(props) => (
                <p 
                  className="text-fluid-base xs:text-fluid-lg leading-relaxed"
                  style={{ color: descriptionColor.color }}
                >
                  {props.children}
                </p>
              )}
              placeholder="Book your virtual golf experience today and enjoy great food while you play!"
            />
          )}

          {/* Button Container */}
          <div className={`flex gap-4 items-center ${getButtonAlignmentClass()} ${getContentSpacingClass()}`}>
            {/* Primary Button */}
            {showPrimaryButton && (
              <Link
                href={ctaButtonLink}
                className={`${getButtonClass()} text-fluid-base xs:text-fluid-lg px-6 xs:px-8 py-3 xs:py-4 inline-flex items-center gap-2 touch-target rounded-xl transition-all duration-300 hover:scale-105 ${buttonAlignment === 'full-width' ? 'w-full justify-center' : ''}`}
                style={{ color: buttonStyle === 'outline' ? getColorAccent() : undefined }}
              >
                <span>🏓</span>
                <Text
                  propName="ctaButtonText"
                  value={ctaButtonText}
                  renderBlock={(props) => (
                    <span>{props.children}</span>
                  )}
                  placeholder="Book Now"
                />
              </Link>
            )}

            {/* Secondary Button */}
            {showSecondaryButton && secondaryButtonText && (
              <Link
                href={secondaryButtonLink || '/menu'}
                className={`${getSecondaryButtonClass()} text-fluid-base xs:text-fluid-lg px-6 xs:px-8 py-3 xs:py-4 inline-flex items-center gap-2 touch-target rounded-xl transition-all duration-300 hover:scale-105 ${buttonAlignment === 'full-width' ? 'w-full justify-center' : ''}`}
              >
                <span>🍽️</span>
                <Text
                  propName="secondaryButtonText"
                  value={secondaryButtonText}
                  renderBlock={(props) => (
                    <span>{props.children}</span>
                  )}
                  placeholder="View Menu"
                />
              </Link>
            )}
          </div>

          {/* Decorative Elements */}
          {showDecorativeElements && (
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: getColorAccent() }}
                ></div>
                <div 
                  className="w-2 h-2 bg-neonPink rounded-full animate-pulse" 
                  style={{ animationDelay: '0.5s' }}
                ></div>
                <div 
                  className="w-2 h-2 bg-neonYellow rounded-full animate-pulse" 
                  style={{ animationDelay: '1s' }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
BookingsSection.schema = {
  name: 'bookings-section',
  label: 'Bookings Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    // Content
    sectionTitle: '🏓 Ready to Play?',
    sectionDescription: 'Book your virtual golf experience today and enjoy great food while you play!',
    ctaButtonText: 'Book Now',
    ctaButtonLink: '/bookings',
    sectionIcon: '📅',
    sectionBadge: '',

    // Content Display
    showTitle: true,
    showDescription: true,
    showIcon: true,
    showBadge: false,
    showPrimaryButton: true,
    showSecondaryButton: false,
    showDecorativeElements: true,

    // Layout & Positioning
    textAlignment: 'center',
    contentLayout: 'standard',
    iconPosition: 'top',
    buttonAlignment: 'center',

    // Colors
    backgroundColor: '#0f0f0f',
    titleColor: { color: '#ffffff' },
    descriptionColor: { color: '#d1d5db' },
    borderColor: { color: '#00ffff' },
    accentColor: { color: '#00ffff' },

    // Button Styling
    buttonStyle: 'neon',
    buttonColor: 'neon',
    secondaryButtonText: 'View Menu',
    secondaryButtonLink: '/menu',
    secondaryButtonStyle: 'outline',

    // Visual Effects
    enableGlassEffect: true,
    shadowIntensity: 'medium',
    borderRadius: 'lg',
    borderWidth: 'thin',

    // Advanced Settings
    sectionPadding: 'md',
    contentSpacing: 'normal',
    animationStyle: 'fade',
    customMaxWidth: 'lg',

    // Image Effects
    imageOpacity: 0.3,
    imageBlur: 'none'
  }),

  sideEditProps: [
    // Group 1: Content Display
    {
      groupName: 'Content Display',
      defaultOpen: true,
      props: [
        {
          name: 'ctaButtonLink',
          label: 'Primary Button Link',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'showTitle',
          label: 'Show Title',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showDescription',
          label: 'Show Description',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showIcon',
          label: 'Show Icon',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showBadge',
          label: 'Show Badge',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showPrimaryButton',
          label: 'Show Primary Button',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showSecondaryButton',
          label: 'Show Secondary Button',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showDecorativeElements',
          label: 'Show Decorative Dots',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },

    // Group 2: Layout & Positioning
    {
      groupName: 'Layout & Positioning',
      defaultOpen: false,
      props: [
        {
          name: 'textAlignment',
          label: 'Text Alignment',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ],
          },
        },
        {
          name: 'contentLayout',
          label: 'Content Layout',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'standard', label: 'Standard' },
              { value: 'stacked', label: 'Stacked' },
              { value: 'side-by-side', label: 'Side by Side' },
              { value: 'hero', label: 'Hero Style' },
            ],
          },
        },
        {
          name: 'iconPosition',
          label: 'Icon Position',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'top', label: 'Top' },
              { value: 'side', label: 'Side' },
              { value: 'background', label: 'Background' },
            ],
          },
          show: (props) => props.showIcon,
        },
        {
          name: 'buttonAlignment',
          label: 'Button Alignment',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
              { value: 'full-width', label: 'Full Width' },
            ],
          },
        },
        {
          name: 'customMaxWidth',
          label: 'Content Max Width',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra Large' },
              { value: 'full', label: 'Full Width' },
            ],
          },
        },
      ],
    },

    // Group 3: Typography & Colors
    {
      groupName: 'Typography & Colors',
      defaultOpen: false,
      props: [
        createAdvancedColorProp(
          'backgroundColor',
          'Background Color',
          { presetColors: BACKGROUND_PALETTE }
        ),
        createAdvancedColorProp(
          'titleColor',
          'Title Color',
          { presetColors: TEXT_PALETTE }
        ),
        createAdvancedColorProp(
          'descriptionColor',
          'Description Color',
          { presetColors: TEXT_PALETTE }
        ),
        createAdvancedColorProp(
          'accentColor',
          'Accent Color',
          { presetColors: TEXT_PALETTE }
        ),
        createAdvancedColorProp(
          'borderColor',
          'Border Color',
          { presetColors: TEXT_PALETTE }
        ),
        {
          name: 'contentSpacing',
          label: 'Content Spacing',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'tight', label: 'Tight' },
              { value: 'normal', label: 'Normal' },
              { value: 'loose', label: 'Loose' },
            ],
          },
        },
      ],
    },

    // Group 4: Button Styling
    {
      groupName: 'Button Styling',
      defaultOpen: false,
      props: [
        {
          name: 'buttonStyle',
          label: 'Primary Button Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'neon', label: 'Neon Effect' },
              { value: 'solid', label: 'Solid' },
              { value: 'outline', label: 'Outline' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'glass', label: 'Glass Effect' },
            ],
          },
        },
        {
          name: 'buttonColor',
          label: 'Button Color Theme',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'neon', label: 'Neon Cyan' },
              { value: 'pink', label: 'Neon Pink' },
              { value: 'cyan', label: 'Cyan Blue' },
              { value: 'yellow', label: 'Neon Yellow' },
            ],
          },
        },
        {
          name: 'secondaryButtonStyle',
          label: 'Secondary Button Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'outline', label: 'Outline' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'text', label: 'Text Only' },
            ],
          },
          show: (props) => props.showSecondaryButton,
        },
        {
          name: 'secondaryButtonLink',
          label: 'Secondary Button Link',
          type: types.SideEditPropType.Text,
          show: (props) => props.showSecondaryButton,
        },
      ],
    },

    // Group 5: Visual Effects
    {
      groupName: 'Visual Effects',
      defaultOpen: false,
      props: [
        {
          name: 'enableGlassEffect',
          label: 'Enable Glass Effect',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'shadowIntensity',
          label: 'Shadow Intensity',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'No Shadow' },
              { value: 'subtle', label: 'Subtle' },
              { value: 'medium', label: 'Medium' },
              { value: 'strong', label: 'Strong' },
            ],
          },
        },
        {
          name: 'animationStyle',
          label: 'Animation Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'fade', label: 'Fade In' },
              { value: 'slide', label: 'Slide Up' },
              { value: 'scale', label: 'Scale In' },
              { value: 'bounce', label: 'Bounce In' },
            ],
          },
        },
        {
          name: 'backgroundImage',
          label: 'Background Image',
          type: types.SideEditPropType.Image,
          imageOptions: {
            maxWidth: 2000,
            quality: 85,
          },
        },
        {
          name: 'imageOpacity',
          label: 'Image Opacity',
          type: types.SideEditPropType.Range,
          rangeOptions: {
            min: 0,
            max: 1,
            step: 0.1,
          },
          show: (props) => !!props.backgroundImage,
        },
        {
          name: 'imageBlur',
          label: 'Image Blur',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'No Blur' },
              { value: 'sm', label: 'Light Blur' },
              { value: 'md', label: 'Medium Blur' },
              { value: 'lg', label: 'Heavy Blur' },
            ],
          },
          show: (props) => !!props.backgroundImage,
        },
      ],
    },

    // Group 6: Advanced Settings
    {
      groupName: 'Advanced Settings',
      defaultOpen: false,
      props: [
        {
          name: 'sectionPadding',
          label: 'Section Padding',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra Large' },
            ],
          },
        },
        {
          name: 'borderRadius',
          label: 'Border Radius',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'No Radius' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra Large' },
            ],
          },
        },
        {
          name: 'borderWidth',
          label: 'Border Width',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'No Border' },
              { value: 'thin', label: 'Thin' },
              { value: 'medium', label: 'Medium' },
              { value: 'thick', label: 'Thick' },
            ],
          },
        },
      ],
    },
  ],
}

export default BookingsSection
