import React from 'react'
import { Text, Repeater, types } from 'react-bricks/frontend'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/AuthProvider'
import { Star, MapPin, Car } from 'lucide-react'
import DynamicCarousel from '@/components/DynamicCarousel'
import { createAdvancedColorProp, TEXT_PALETTE, NEON_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

// Color value interface for consistency
interface ColorValue {
  color: string
  className?: string
  [key: string]: unknown
}

//========================================
// Nested Component: Advanced Subheading
//========================================

interface AdvancedSubheadingProps {
  text: string
  textColor: ColorValue
  fontSize: 'lg' | 'xl' | '2xl' | '3xl'
  backgroundColor?: ColorValue
}

const AdvancedSubheading: types.Brick<AdvancedSubheadingProps> = ({ 
  text, 
  textColor, 
  fontSize = 'xl',
  backgroundColor 
}) => {
  // Font size classes
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'lg': return 'text-fluid-lg xs:text-fluid-xl'
      case 'xl': return 'text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl'  
      case '2xl': return 'text-fluid-xl xs:text-fluid-2xl sm:text-fluid-3xl'
      case '3xl': return 'text-fluid-2xl xs:text-fluid-3xl sm:text-fluid-4xl'
      default: return 'text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl'
    }
  }

  // Style object for text color and background
  const getTextStyle = () => {
    const style: React.CSSProperties = {
      color: textColor?.color || '#d1d5db'
    }
    
    if (backgroundColor?.color) {
      style.backgroundColor = backgroundColor.color
      style.padding = '0.5rem 1rem'
      style.borderRadius = '0.5rem'
      style.display = 'inline-block'
    }
    
    return style
  }

  return (
    <p 
      className={`${getFontSizeClass()} mb-4 xs:mb-6 max-w-4xl mx-auto text-center`}
      style={getTextStyle()}
    >
      <Text
        propName="text"
        value={text}
        placeholder="Where Great Food Meets Amazing Experiences"
        multiline={false}
      />
    </p>
  )
}

AdvancedSubheading.schema = {
  name: 'advanced-subheading',
  label: 'Advanced Subheading',
  category: 'content',
  hideFromAddMenu: true,
  tags: [],
  playgroundLinkLabel: 'View source code on Github',
  playgroundLinkUrl: 'https://github.com/DDMaster24/little-latte-lane',
  
  getDefaultProps: () => ({
    text: 'Where Great Food Meets Amazing Experiences',
    textColor: { color: '#d1d5db' },
    fontSize: 'xl'
  }),

  sideEditProps: [
    {
      name: 'styling',
      label: 'Styling',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { label: 'Typography', value: 'typography' },
        ],
      },
    },
  ],

  repeaterItems: [
    {
      name: 'typography',
      itemType: 'typography',
      itemLabel: 'Typography',
      min: 1,
      max: 1
    },
  ],
}

//========================================
// Nested Component: Advanced Description
//========================================

interface AdvancedDescriptionProps {
  text: string
  textColor: ColorValue
  fontSize: 'sm' | 'base' | 'lg' | 'xl'
  backgroundColor?: ColorValue
  alignment: 'left' | 'center' | 'right'
}

const AdvancedDescription: types.Brick<AdvancedDescriptionProps> = ({ 
  text, 
  textColor, 
  fontSize = 'base',
  backgroundColor,
  alignment = 'center'
}) => {
  // Font size classes
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-sm xs:text-base'
      case 'base': return 'text-base xs:text-lg'
      case 'lg': return 'text-lg xs:text-xl'
      case 'xl': return 'text-xl xs:text-2xl'
      default: return 'text-base xs:text-lg'
    }
  }

  // Alignment classes
  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left': return 'text-left'
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  // Style object for text color and background
  const getTextStyle = () => {
    const style: React.CSSProperties = {
      color: textColor?.color || '#d1d5db'
    }
    
    if (backgroundColor?.color) {
      style.backgroundColor = backgroundColor.color
      style.padding = '0.75rem 1.5rem'
      style.borderRadius = '0.5rem'
      style.display = 'inline-block'
    }
    
    return style
  }

  return (
    <div className={`${getAlignmentClass()} mb-4 xs:mb-6 max-w-3xl mx-auto`}>
      <div
        className={`${getFontSizeClass()}`}
        style={getTextStyle()}
      >
        <Text
          propName="text"
          value={text}
          placeholder="Enter your description text here..."
          multiline={true}
        />
      </div>
    </div>
  )
}

AdvancedDescription.schema = {
  name: 'advanced-description',
  label: 'Advanced Description',
  category: 'content',
  hideFromAddMenu: true,
  tags: [],
  playgroundLinkLabel: 'View source code on Github',
  playgroundLinkUrl: 'https://github.com/DDMaster24/little-latte-lane',
  
  getDefaultProps: () => ({
    text: 'Experience the perfect blend of exceptional cuisine and warm atmosphere at our family-owned establishment.',
    textColor: { color: '#d1d5db' },
    fontSize: 'base',
    alignment: 'center'
  }),

  sideEditProps: [
    {
      name: 'text-styling',
      label: 'Text Styling',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { label: 'Typography & Colors', value: 'typography' },
        ],
      },
    },
    {
      name: 'fontSize',
      label: 'Font Size',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Base', value: 'base' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' },
        ],
      },
    },
    {
      name: 'alignment',
      label: 'Text Alignment',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    },
    createAdvancedColorProp(
      'textColor',
      'Text Color',
      {
        presetColors: TEXT_PALETTE
      }
    ),
    createAdvancedColorProp(
      'backgroundColor',
      'Background Color (Optional)',
      {
        presetColors: BACKGROUND_PALETTE
      }
    ),
  ],
}

//========================================
// Nested Component: Advanced Heading
//========================================
interface AdvancedHeadingProps {
  text: types.TextValue
  fontSize: 'normal' | 'large' | 'xl' | 'xxl'
  textColor: { color: string }
  useGradient: boolean
  gradientColor1: { color: string }
  gradientColor2: { color: string }
  gradientColor3: { color: string }
  gradientDirection: 'horizontal' | 'vertical' | 'diagonal-1' | 'diagonal-2' | 'radial'
  backgroundColor: { color: string }
  padding: 'none' | 'sm' | 'md' | 'lg'
  showAuthGreeting: boolean
}

const AdvancedHeading: types.Brick<AdvancedHeadingProps> = ({ 
  text,
  fontSize = 'large',
  textColor = { color: '#ffffff' },
  useGradient = true,
  gradientColor1 = { color: '#00ffff' },
  gradientColor2 = { color: '#ff00ff' },
  gradientColor3 = { color: '#ffff00' },
  gradientDirection = 'horizontal',
  backgroundColor = { color: 'transparent' },
  padding = 'md',
  showAuthGreeting = true
}) => {
  const { user, profile } = useAuth();
  const username = profile?.full_name || user?.email?.split('@')[0] || '';

  // Font size classes with responsive scaling
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'normal': return 'text-fluid-2xl xs:text-fluid-3xl lg:text-fluid-4xl'
      case 'large': return 'text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl'
      case 'xl': return 'text-fluid-4xl xs:text-fluid-5xl sm:text-fluid-6xl lg:text-fluid-7xl'
      case 'xxl': return 'text-fluid-5xl xs:text-fluid-6xl sm:text-fluid-7xl lg:text-fluid-8xl'
      default: return 'text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl'
    }
  }

  // Padding classes
  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return ''
      case 'sm': return 'p-2 xs:p-3'
      case 'md': return 'p-4 xs:p-6'
      case 'lg': return 'p-6 xs:p-8 lg:p-10'
      default: return 'p-4 xs:p-6'
    }
  }

  // Create gradient style
  const getTextStyle = () => {
    if (useGradient) {
      const direction = gradientDirection === 'horizontal' ? 'to right' : 
                       gradientDirection === 'vertical' ? 'to bottom' :
                       gradientDirection === 'diagonal-1' ? 'to bottom right' :
                       gradientDirection === 'diagonal-2' ? 'to bottom left' :
                       'circle'
      
      const gradientType = gradientDirection === 'radial' ? 'radial-gradient' : 'linear-gradient'
      
      return {
        background: `${gradientType}(${direction}, ${gradientColor1?.color || '#00ffff'}, ${gradientColor2?.color || '#ff00ff'}, ${gradientColor3?.color || '#ffff00'})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }
    }
    return { color: textColor?.color || '#ffffff' }
  }

  // Get display text with auth greeting
  const getDisplayText = () => {
    if (showAuthGreeting && username) {
      return `Welcome Back, ${username}!`
    }
    return typeof text === 'string' ? text : 'Welcome to Little Latte Lane'
  }

  return (
    <div 
      className={`${getPaddingClass()} rounded-lg`}
      style={{ backgroundColor: backgroundColor.color !== 'transparent' ? backgroundColor.color : undefined }}
    >
      <Text
        propName="text"
        value={text}
        renderBlock={(props) => (
          <h1 
            className={`${getFontSizeClass()} font-bold text-center mb-4 xs:mb-6`}
            style={getTextStyle()}
          >
            {showAuthGreeting && username ? getDisplayText() : props.children}
          </h1>
        )}
        placeholder="Welcome to Little Latte Lane"
      />
    </div>
  )
}

AdvancedHeading.schema = {
  name: 'advanced-heading',
  label: 'Advanced Heading',
  getDefaultProps: () => ({
    text: 'Welcome to Little Latte Lane',
    fontSize: 'large',
    textColor: { color: '#ffffff' },
    useGradient: true,
    gradientColor1: { color: '#00ffff' },
    gradientColor2: { color: '#ff00ff' },
    gradientColor3: { color: '#ffff00' },
    gradientDirection: 'horizontal',
    backgroundColor: { color: 'transparent' },
    padding: 'md',
    showAuthGreeting: true
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    {
      groupName: 'Content & Display',
      defaultOpen: true,
      props: [
        {
          name: 'showAuthGreeting',
          label: 'Show Personal Greeting',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'fontSize',
          label: 'Font Size',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'large', label: 'Large' },
              { value: 'xl', label: 'Extra Large' },
              { value: 'xxl', label: 'XXL' },
            ],
          },
        },
        {
          name: 'padding',
          label: 'Padding',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Text Color & Gradient',
      defaultOpen: true,
      props: [
        {
          name: 'useGradient',
          label: 'Use Gradient Text',
          type: types.SideEditPropType.Boolean,
        },
        createAdvancedColorProp(
          'textColor',
          'Text Color',
          {
            presetColors: TEXT_PALETTE
          }
        ),
        createAdvancedColorProp(
          'gradientColor1',
          'Gradient Color 1',
          {
            presetColors: NEON_PALETTE
          }
        ),
        createAdvancedColorProp(
          'gradientColor2',
          'Gradient Color 2',
          {
            presetColors: NEON_PALETTE
          }
        ),
        createAdvancedColorProp(
          'gradientColor3',
          'Gradient Color 3',
          {
            presetColors: NEON_PALETTE
          }
        ),
        {
          name: 'gradientDirection',
          label: 'Gradient Direction',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'horizontal', label: 'Horizontal →' },
              { value: 'vertical', label: 'Vertical ↓' },
              { value: 'diagonal-1', label: 'Diagonal ↘' },
              { value: 'diagonal-2', label: 'Diagonal ↙' },
              { value: 'radial', label: 'Radial ○' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Background',
      defaultOpen: false,
      props: [
        createAdvancedColorProp(
          'backgroundColor',
          'Background Color',
          {
            includeTransparency: true,
            presetColors: [
              { color: 'transparent', className: 'bg-transparent' },
              ...BACKGROUND_PALETTE,
              ...NEON_PALETTE.map(c => ({ ...c, className: c.className?.replace('text-', 'bg-') || '' }))
            ]
          }
        ),
      ],
    },
  ],
}

//========================================
// Nested Component: Feature Item
//========================================
interface FeatureItemProps {
  icon: types.TextValue
  text: types.TextValue
  textColor: ColorValue
  iconColor: ColorValue
  backgroundColor?: ColorValue
}

const FeatureItem: types.Brick<FeatureItemProps> = ({ icon, text, textColor, iconColor, backgroundColor }) => {
  
  const getIconComponent = () => {
    const iconText = typeof icon === 'string' ? icon : icon?.toString() || '⭐'
    
    // Map text to Lucide icons for the original features
    if (iconText.includes('Star') || iconText === '⭐') return <Star className="h-5 w-5" />
    if (iconText.includes('MapPin') || iconText === '📍') return <MapPin className="h-5 w-5" />
    if (iconText.includes('Car') || iconText === '🚗') return <Car className="h-5 w-5" />
    
    // Fallback to text icon
    return <span className="text-lg">{iconText}</span>
  }

  // Style object for the container
  const getContainerStyle = () => {
    const style: React.CSSProperties = {}
    
    if (backgroundColor?.color) {
      style.backgroundColor = backgroundColor.color
      style.padding = '0.5rem 1rem'
      style.borderRadius = '0.5rem'
    }
    
    return style
  }

  return (
    <div 
      className="flex items-center justify-center gap-2"
      style={getContainerStyle()}
    >
      <div style={{ color: iconColor?.color || '#00ffff' }}>
        {getIconComponent()}
      </div>
      <Text
        propName="text"
        value={text}
        renderBlock={(props) => (
          <span 
            className="text-sm font-medium"
            style={{ color: textColor?.color || '#ffffff' }}
          >
            {props.children}
          </span>
        )}
        placeholder="Feature text"
      />
    </div>
  )
}

FeatureItem.schema = {
  name: 'feature-item',
  label: 'Feature Item',
  getDefaultProps: () => ({
    icon: '⭐',
    text: 'Exceptional Quality',
    textColor: { color: '#ffffff' },
    iconColor: { color: '#00ffff' }
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    {
      name: 'icon',
      label: 'Icon',
      type: types.SideEditPropType.Text,
    },
    createAdvancedColorProp(
      'textColor',
      'Text Color',
      {
        presetColors: TEXT_PALETTE
      }
    ),
    createAdvancedColorProp(
      'iconColor',
      'Icon Color',
      {
        presetColors: NEON_PALETTE
      }
    ),
    createAdvancedColorProp(
      'backgroundColor',
      'Background Color (Optional)',
      {
        presetColors: BACKGROUND_PALETTE
      }
    ),
  ],
}

//========================================
// Nested Component: Badge Item
//========================================
interface BadgeItemProps {
  text: types.TextValue
  textColor: ColorValue
  backgroundColor: ColorValue
  borderColor?: ColorValue
}

const BadgeItem: types.Brick<BadgeItemProps> = ({ text, textColor, backgroundColor, borderColor }) => {
  
  // Style object for the badge
  const getBadgeStyle = () => {
    const style: React.CSSProperties = {
      backgroundColor: backgroundColor?.color || '#00ffff',
      color: textColor?.color || '#000000'
    }
    
    if (borderColor?.color) {
      style.border = `2px solid ${borderColor.color}`
    }
    
    return style
  }

  return (
    <Badge 
      className="px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium border-0"
      style={getBadgeStyle()}
    >
      <Text
        propName="text"
        value={text}
        renderBlock={(props) => (
          <span>{props.children}</span>
        )}
        placeholder="Badge text"
      />
    </Badge>
  )
}

BadgeItem.schema = {
  name: 'badge-item',
  label: 'Badge Item',
  getDefaultProps: () => ({
    text: 'Now Open',
    textColor: { color: '#000000' },
    backgroundColor: { color: '#00ffff' }
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    createAdvancedColorProp(
      'backgroundColor',
      'Background Color',
      {
        presetColors: NEON_PALETTE
      }
    ),
    createAdvancedColorProp(
      'textColor',
      'Text Color',
      {
        presetColors: TEXT_PALETTE
      }
    ),
    createAdvancedColorProp(
      'borderColor',
      'Border Color (Optional)',
      {
        presetColors: NEON_PALETTE
      }
    ),
  ],
}

//========================================
// Main Component: Welcoming Section
//========================================
interface WelcomingSectionProps {
  mainHeading: types.RepeaterItems
  subtitle: types.RepeaterItems
  description: types.RepeaterItems
  ctaTitle: types.TextValue
  ctaDescription: types.TextValue
  badges: types.RepeaterItems
  features: types.RepeaterItems
  showCarousel: boolean
  backgroundColor: 'dark' | 'darker' | 'gradient'
  backgroundImage?: types.IImageSource
  padding: 'sm' | 'md' | 'lg'
  _subtitleColor?: { color: string }
  showBadges: boolean
  showFeatures: boolean
}

const WelcomingSection: types.Brick<WelcomingSectionProps> = ({ 
  mainHeading,
  subtitle,
  description,
  ctaTitle,
  ctaDescription,
  badges,
  features,
  showCarousel = true,
  backgroundColor = 'gradient',
  backgroundImage,
  padding = 'md',
  _subtitleColor = { color: '#d1d5db' },
  showBadges = true,
  showFeatures = true,
}) => {
  // Background classes based on selection
  const getBgClass = () => {
    switch (backgroundColor) {
      case 'dark': return 'bg-darkBg'
      case 'darker': return 'bg-gray-900'
      case 'gradient': return 'bg-gradient-to-br from-darkBg via-gray-900 to-darkBg'
      default: return 'bg-gradient-to-br from-darkBg via-gray-900 to-darkBg'
    }
  }

  // Padding classes
  const getPaddingClass = () => {
    switch (padding) {
      case 'sm': return 'section-padding-sm'
      case 'md': return 'section-padding'
      case 'lg': return 'py-16 xs:py-24 lg:py-32'
      default: return 'section-padding'
    }
  }

  // Background image style
  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    }
    return {}
  }

  return (
    <section 
      className={`${getBgClass()} ${getPaddingClass()} overflow-hidden`}
      style={getBackgroundStyle()}
    >
      <div className="container-wide animate-fade-in">
        {/* Advanced Heading Section - Individually Selectable */}
        <div className="text-center section-padding-sm">
          {/* Advanced Heading Repeater for Individual Selection */}
          <Repeater
            propName="mainHeading"
            items={mainHeading}
            renderWrapper={(items) => (
              <div className="mb-4 xs:mb-6">
                {items}
              </div>
            )}
          />
          
          {/* Advanced Subtitle Repeater for Individual Selection */}
          <Repeater
            propName="subtitle"
            items={subtitle}
            renderWrapper={(items) => (
              <div className="mb-4 xs:mb-6">
                {items}
              </div>
            )}
          />

          {/* Advanced Description Repeater for Individual Selection */}
          <Repeater
            propName="description"
            items={description}
            renderWrapper={(items) => (
              <div className="mb-6 xs:mb-8">
                {items}
              </div>
            )}
          />

          {/* Conditional Badges */}
          {showBadges && (
            <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-8 xs:mb-12">
              <Repeater
                propName="badges"
                items={badges}
                renderWrapper={(items) => (
                  <div className="flex flex-wrap justify-center gap-2 xs:gap-3">
                    {items}
                  </div>
                )}
              />
            </div>
          )}
        </div>

        {/* Dynamic Carousel - Original Feature */}
        {showCarousel && (
          <div className="mb-16">
            <DynamicCarousel />
          </div>
        )}

        {/* Call to Action Section - Original Design */}
        <div className="text-center">
          <Text
            propName="ctaTitle"
            value={ctaTitle}
            renderBlock={(props) => (
              <h2 
                className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4"
              >
                {props.children}
              </h2>
            )}
            placeholder="Ready to Experience Little Latte Lane?"
          />
          
          <Text
            propName="ctaDescription"
            value={ctaDescription}
            renderBlock={(props) => (
              <p 
                className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto"
              >
                {props.children}
              </p>
            )}
            placeholder="Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you're catching up with friends, having a business meeting, or enjoying a quiet moment, we're here to make your experience memorable."
          />

          {/* Features Section - Original Design */}
          {showFeatures && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Repeater
                propName="features"
                items={features}
                renderWrapper={(items) => (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {items}
                  </div>
                )}
              />
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
WelcomingSection.schema = {
  name: 'WelcomingSection',
  label: 'Welcoming Section',
  category: 'Little Latte Lane',
  
  // Defaults
  getDefaultProps: () => ({
    mainHeading: [
      {
        type: 'advanced-heading',
        props: {
          text: 'Welcome to Little Latte Lane',
          fontSize: 'large',
          textColor: { color: '#ffffff' },
          useGradient: true,
          gradientColor1: { color: '#00ffff' },
          gradientColor2: { color: '#ff00ff' },
          gradientColor3: { color: '#ffff00' },
          gradientDirection: 'horizontal',
          backgroundColor: { color: 'transparent' },
          padding: 'md',
          showAuthGreeting: true
        }
      }
    ],
    subtitle: [
      {
        type: 'advanced-subheading',
        props: {
          text: 'Café & Deli - Where Great Food Meets Amazing Experiences',
          textColor: { color: '#d1d5db' },
          fontSize: 'xl'
        }
      }
    ],
    description: [
      {
        type: 'advanced-description',
        props: {
          text: 'Experience the perfect blend of exceptional cuisine and warm atmosphere at our family-owned establishment.',
          textColor: { color: '#d1d5db' },
          fontSize: 'base',
          alignment: 'center'
        }
      }
    ],
    ctaTitle: 'Ready to Experience Little Latte Lane?',
    ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
    showCarousel: true,
    backgroundColor: 'gradient',
    padding: 'md',
    subtitleColor: { color: '#d1d5db' },
    showBadges: true,
    showFeatures: true,
    badges: [
      {
        type: 'badge-item',
        props: {
          text: 'Now Open',
          bgColor: 'cyan'
        }
      },
      {
        type: 'badge-item',
        props: {
          text: 'Dine In • Takeaway • Delivery',
          bgColor: 'pink'
        }
      }
    ],
    features: [
      {
        type: 'feature-item',
        props: {
          icon: '⭐',
          text: 'Exceptional Quality',
          color: 'cyan'
        }
      },
      {
        type: 'feature-item',
        props: {
          icon: '📍',
          text: 'Prime Location',
          color: 'pink'
        }
      },
      {
        type: 'feature-item',
        props: {
          icon: '🚗',
          text: 'Easy Parking',
          color: 'yellow'
        }
      }
    ]
  }),

  // Repeater settings
  repeaterItems: [
    {
      name: 'mainHeading',
      itemType: 'advanced-heading',
      itemLabel: 'Main Heading',
      min: 1,
      max: 1
    },
    {
      name: 'subtitle',
      itemType: 'advanced-subheading',
      itemLabel: 'Subtitle',
      min: 0,
      max: 1
    },
    {
      name: 'description',
      itemType: 'advanced-description',
      itemLabel: 'Description',
      min: 0,
      max: 1
    },
    {
      name: 'badges',
      itemType: 'badge-item',
      itemLabel: 'Badge',
      min: 1,
      max: 5
    },
    {
      name: 'features',
      itemType: 'feature-item', 
      itemLabel: 'Feature',
      min: 1,
      max: 6
    }
  ],

  // PROFESSIONAL SIDEBAR CONTROLS
  sideEditProps: [
    {
      groupName: 'Original Features',
      defaultOpen: true,
      props: [
        {
          name: 'showCarousel',
          label: 'Show 3D Carousel',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showAuthGreeting',
          label: 'Show Personal Greeting',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showBadges',
          label: 'Show Badges',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showFeatures',
          label: 'Show Features',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
    {
      groupName: 'Background & Layout',
      defaultOpen: false,
      props: [
        {
          name: 'backgroundColor',
          label: 'Background Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'dark', label: 'Dark' },
              { value: 'darker', label: 'Darker' },
              { value: 'gradient', label: 'Gradient' },
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
          name: 'padding',
          label: 'Section Padding',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Typography',
      defaultOpen: false,
      props: [
        {
          name: 'titleSize',
          label: 'Title Size',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'large', label: 'Large' },
              { value: 'xl', label: 'Extra Large' },
            ],
          },
        },
        createAdvancedColorProp(
          'subtitleColor',
          'Subtitle Color',
          {
            presetColors: TEXT_PALETTE
          }
        ),
      ],
    },
  ],
}

export default WelcomingSection
export { FeatureItem, BadgeItem, AdvancedHeading, AdvancedSubheading, AdvancedDescription }
