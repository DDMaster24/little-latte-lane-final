import React from 'react'
import { Text, Repeater, types, Image } from 'react-bricks/frontend'
import { Star } from 'lucide-react'
import { createAdvancedColorProp, TEXT_PALETTE, NEON_PALETTE } from '../components/colorPickerUtils'
import AdvancedColorPicker from '../components/AdvancedColorPicker'

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
  textColor?: ColorValue | null
  alignment?: 'left' | 'center' | 'right'
  size?: 'sm' | 'base' | 'lg' | 'xl'
}

const AdvancedSubheading: React.FC<AdvancedSubheadingProps> = ({ 
  text,
  textColor,
  alignment = 'center',
  size = 'lg'
}) => {
  // Size classes
  const getSizeClass = () => {
    switch (size) {
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
    
    return style
  }

  return (
    <div 
      className={`font-medium mb-4 ${getSizeClass()} ${getAlignmentClass()}`}
      style={getTextStyle()}
    >
      {text}
    </div>
  )
}

//========================================
// Nested Component: Advanced Heading
//========================================

interface AdvancedHeadingProps {
  text: string
  textColor?: ColorValue | null
  alignment?: 'left' | 'center' | 'right'
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
}

const AdvancedHeading: React.FC<AdvancedHeadingProps> = ({ 
  text,
  textColor,
  alignment = 'center',
  size = '3xl'
}) => {
  // Size classes
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-lg xs:text-xl'
      case 'base': return 'text-xl xs:text-2xl'
      case 'lg': return 'text-2xl xs:text-3xl'
      case 'xl': return 'text-3xl xs:text-4xl'
      case '2xl': return 'text-4xl xs:text-5xl'
      case '3xl': return 'text-5xl xs:text-6xl'
      default: return 'text-3xl xs:text-4xl'
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

  // Style object for text color
  const getTextStyle = () => {
    const style: React.CSSProperties = {
      color: textColor?.color || '#ffffff'
    }
    
    return style
  }

  return (
    <h1 
      className={`font-bold mb-6 ${getSizeClass()} ${getAlignmentClass()}`}
      style={getTextStyle()}
    >
      {text}
    </h1>
  )
}

//========================================
// Nested Component: Advanced Description
//========================================

interface AdvancedDescriptionProps {
  text: string
  textColor?: ColorValue | null
  alignment?: 'left' | 'center' | 'right'
  size?: 'sm' | 'base' | 'lg' | 'xl'
}

const AdvancedDescription: React.FC<AdvancedDescriptionProps> = ({ 
  text,
  textColor,
  alignment = 'center',
  size = 'lg'
}) => {
  // Size classes
  const getSizeClass = () => {
    switch (size) {
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

  // Style object for text color
  const getTextStyle = () => {
    const style: React.CSSProperties = {
      color: textColor?.color || '#d1d5db'
    }
    
    return style
  }

  return (
    <div 
      className={`mb-8 max-w-3xl mx-auto ${getSizeClass()} ${getAlignmentClass()}`}
      style={getTextStyle()}
    >
      {text}
    </div>
  )
}

//========================================
// Nested Component: Badge Item with Advanced Color
//========================================

interface BadgeItemProps {
  icon?: types.IImageSource
  text?: string
  textColor?: ColorValue | null
  backgroundColor?: ColorValue | null
}

const BadgeItem: types.Brick<BadgeItemProps> = ({ 
  icon,
  text,
  textColor,
  backgroundColor 
}) => {
  // Style object for custom colors
  const getBadgeStyle = () => {
    const style: React.CSSProperties = {}
    
    if (textColor?.color) {
      style.color = textColor.color
    }
    
    if (backgroundColor?.color) {
      style.backgroundColor = backgroundColor.color
      style.borderColor = backgroundColor.color
    }
    
    return style
  }

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
        !backgroundColor?.color ? 'bg-neonCyan/10 border-neonCyan/30 text-neonCyan' : ''
      }`}
      style={getBadgeStyle()}
    >
      {icon && (
        <Image
          propName="icon"
          source={icon}
          alt="Badge icon"
          imageStyle={{
            width: '16px',
            height: '16px',
            objectFit: 'contain'
          }}
        />
      )}
      <Text
        propName="text"
        value={text}
        placeholder="Badge text"
        renderBlock={({ children }) => <span>{children}</span>}
      />
    </div>
  )
}

//========================================
// Nested Component: Feature Item with Advanced Color
//========================================

interface FeatureItemProps {
  icon?: types.IImageSource
  text?: string
  textColor?: ColorValue | null
}

const FeatureItem: types.Brick<FeatureItemProps> = ({ 
  icon,
  text,
  textColor
}) => {
  // Style object for text color
  const getTextStyle = () => {
    const style: React.CSSProperties = {}
    
    if (textColor?.color) {
      style.color = textColor.color
    }
    
    return style
  }

  return (
    <div className="flex items-center gap-2 text-gray-300" style={getTextStyle()}>
      {icon ? (
        <Image
          propName="icon"
          source={icon}
          alt="Feature icon"
          imageStyle={{
            width: '20px',
            height: '20px',
            objectFit: 'contain'
          }}
        />
      ) : (
        <Star className="w-5 h-5 text-neonCyan" />
      )}
      <Text
        propName="text"
        value={text}
        placeholder="Feature text"
        renderBlock={({ children }) => <span>{children}</span>}
      />
    </div>
  )
}

//========================================
// Nested Component: Marketing Panel
//========================================

interface MarketingPanelProps {
  heading?: types.TextValue
  subheading?: types.TextValue
  description?: types.TextValue
  centerImage?: types.IImageSource
  badgeText?: types.TextValue
  headingColor?: ColorValue | null
  subheadingColor?: ColorValue | null
  descriptionColor?: ColorValue | null
  badgeTextColor?: ColorValue | null
  badgeBgColor?: ColorValue | null
}

// Component Function
const MarketingPanel: types.Brick<MarketingPanelProps> = ({ 
  heading,
  subheading,
  description,
  centerImage,
  badgeText,
  headingColor,
  subheadingColor,
  descriptionColor,
  badgeTextColor,
  badgeBgColor
}) => {
  return (
    <div className="bg-gray-800/90 border-neonCyan/30 border-2 backdrop-blur-sm rounded-lg p-6 h-full flex flex-col">
      
      {/* Header Section */}
      <div className="text-center mb-4">
        <Text
          propName="heading"
          value={heading}
          placeholder="Panel Heading"
          renderBlock={({ children }) => (
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: headingColor?.color || '#00ffff' }}
            >
              {children}
            </h3>
          )}
        />
        
        <Text
          propName="subheading"
          value={subheading}
          placeholder="Panel Subheading"
          renderBlock={({ children }) => (
            <p 
              className="text-sm"
              style={{ color: subheadingColor?.color || '#d1d5db' }}
            >
              {children}
            </p>
          )}
        />
      </div>

      {/* Center Image Section */}
      <div className="flex-1 flex items-center justify-center mb-4">
        {centerImage ? (
          <Image
            propName="centerImage"
            source={centerImage}
            alt="Panel image"
            imageStyle={{
              width: '80px',
              height: '80px',
              objectFit: 'contain'
            }}
          />
        ) : (
          <div className="w-20 h-20 bg-neonCyan/20 rounded-full flex items-center justify-center">
            <Star className="w-10 h-10 text-neonCyan" />
          </div>
        )}
      </div>

      {/* Description Section */}
      <div className="text-center mb-4">
        <Text
          propName="description"
          value={description}
          placeholder="Panel description"
          renderBlock={({ children }) => (
            <p 
              className="text-sm"
              style={{ color: descriptionColor?.color || '#d1d5db' }}
            >
              {children}
            </p>
          )}
        />
      </div>

      {/* Bottom Badge */}
      <div className="text-center">
        <Text
          propName="badgeText"
          value={badgeText}
          placeholder="Badge Text"
          renderBlock={({ children }) => (
            <div 
              className="inline-block px-3 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: badgeBgColor?.color || '#10b981',
                color: badgeTextColor?.color || '#ffffff'
              }}
            >
              {children}
            </div>
          )}
        />
      </div>
    </div>
  )
}

// Schema for the brick
MarketingPanel.schema = {
  name: 'marketing-panel',
  label: 'Marketing Panel',
  category: 'content',
  hideFromAddMenu: true, // Since it's nested inside WelcomingSection
  
  // Controls for the brick
  sideEditProps: [
    {
      name: 'headingColor',
      label: 'Heading Color',
      type: types.SideEditPropType.Custom,
      component: AdvancedColorPicker,
    },
    {
      name: 'subheadingColor',
      label: 'Subheading Color',
      type: types.SideEditPropType.Custom,
      component: AdvancedColorPicker,
    },
    {
      name: 'descriptionColor',
      label: 'Description Color',
      type: types.SideEditPropType.Custom,
      component: AdvancedColorPicker,
    },
    {
      name: 'badgeTextColor',
      label: 'Badge Text Color',
      type: types.SideEditPropType.Custom,
      component: AdvancedColorPicker,
    },
    {
      name: 'badgeBgColor',
      label: 'Badge Background Color',
      type: types.SideEditPropType.Custom,
      component: AdvancedColorPicker,
    },
  ],

  // Default props for new items
  getDefaultProps: () => ({
    heading: [{ type: 'paragraph', children: [{ text: 'Marketing Panel' }] }],
    subheading: [{ type: 'paragraph', children: [{ text: 'Subtitle here' }] }],
    description: [{ type: 'paragraph', children: [{ text: 'Description of your service or offer.' }] }],
    badgeText: [{ type: 'paragraph', children: [{ text: 'New!' }] }],
    headingColor: { color: '#00ffff' },
    subheadingColor: { color: '#d1d5db' },
    descriptionColor: { color: '#d1d5db' },
    badgeTextColor: { color: '#ffffff' },
    badgeBgColor: { color: '#10b981' }
  })
}

//========================================
// Main Component: WelcomingSection
//========================================
interface WelcomingSectionProps {
  mainHeading: types.RepeaterItems
  subtitle: types.RepeaterItems
  ctaTitle: types.TextValue
  ctaDescription: types.TextValue
  badges: types.RepeaterItems
  features: types.RepeaterItems
  marketingPanels: types.RepeaterItems
  backgroundColor: 'dark' | 'darker' | 'gradient'
  backgroundImage?: types.IImageSource
  padding: 'sm' | 'md' | 'lg'
  showBadges: boolean
  showFeatures: boolean
  showMarketingPanels: boolean
}

const WelcomingSection: types.Brick<WelcomingSectionProps> = ({ 
  mainHeading,
  subtitle,
  ctaTitle,
  ctaDescription,
  badges,
  features,
  marketingPanels,
  backgroundColor = 'gradient',
  backgroundImage,
  padding = 'md',
  showBadges = true,
  showFeatures = true,
  showMarketingPanels = true
}) => {
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
        backgroundRepeat: 'no-repeat',
      }
    }
    return {}
  }

  // Background class
  const getBgClass = () => {
    if (backgroundImage) return ''
    
    switch (backgroundColor) {
      case 'dark': return 'bg-darkBg'
      case 'darker': return 'bg-gray-900'
      case 'gradient': return 'bg-gradient-to-br from-darkBg via-gray-900 to-darkBg'
      default: return 'bg-gradient-to-br from-darkBg via-gray-900 to-darkBg'
    }
  }

  return (
    <section 
      className={`${getBgClass()} ${getPaddingClass()} overflow-hidden`}
      style={getBackgroundStyle()}
    >
      <div className="max-w-7xl mx-auto text-center">
        
        {/* Main Hero Section */}
        <div className="space-y-6 mb-16">
          {/* Main Title */}
          <Repeater
            propName="mainHeading"
            items={mainHeading}
            renderWrapper={(items) => <div className="space-y-4">{items}</div>}
          />
          
          {/* Subtitle */}
          <Repeater
            propName="subtitle"
            items={subtitle}
            renderWrapper={(items) => <div className="space-y-3">{items}</div>}
          />
        </div>

        {/* Badges Section */}
        {showBadges && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Repeater
              propName="badges"
              items={badges}
              renderWrapper={(items) => (
                <div className="flex flex-wrap justify-center gap-3">
                  {items}
                </div>
              )}
            />
          </div>
        )}

        {/* Marketing Panels Section - 3 Panels Side by Side */}
        {showMarketingPanels && (
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Repeater
                propName="marketingPanels"
                items={marketingPanels}
                renderWrapper={(items) => (
                  <>
                    {items}
                  </>
                )}
              />
            </div>
          </div>
        )}
        
        {/* Call to Action Section */}
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

          {/* Features Section */}
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

// Schema for the brick
WelcomingSection.schema = {
  name: 'welcoming-section',
  label: 'Welcoming Section',
  category: 'hero sections',
  
  // Sidebar controls
  sideEditProps: [
    {
      groupName: 'Layout',
      props: [
        {
          name: 'backgroundColor',
          label: 'Background',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'gradient', label: 'Gradient' },
              { value: 'dark', label: 'Dark' },
              { value: 'darker', label: 'Darker' },
            ]
          }
        },
        {
          name: 'padding',
          label: 'Padding',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ]
          }
        }
      ]
    },
    {
      groupName: 'Sections',
      props: [
        {
          name: 'showBadges',
          label: 'Show Badges',
          type: types.SideEditPropType.Boolean
        },
        {
          name: 'showFeatures',
          label: 'Show Features',
          type: types.SideEditPropType.Boolean
        },
        {
          name: 'showMarketingPanels',
          label: 'Show Marketing Panels',
          type: types.SideEditPropType.Boolean
        }
      ]
    }
  ],

  // Repeater props
  repeaterItems: [
    {
      name: 'mainHeading',
      itemType: 'advanced-heading',
      itemLabel: 'Heading',
      min: 0,
      max: 5
    },
    {
      name: 'subtitle',
      itemType: 'advanced-subheading', 
      itemLabel: 'Subtitle',
      min: 0,
      max: 3
    },
    {
      name: 'description',
      itemType: 'advanced-description',
      itemLabel: 'Description',
      min: 0,
      max: 3
    },
    {
      name: 'badges',
      itemType: 'badge-item',
      itemLabel: 'Badge',
      min: 0,
      max: 6
    },
    {
      name: 'features',
      itemType: 'feature-item',
      itemLabel: 'Feature',
      min: 0,
      max: 6
    },
    {
      name: 'marketingPanels',
      itemType: 'marketing-panel',
      itemLabel: 'Marketing Panel',
      min: 0,
      max: 3
    }
  ],

  // Default props
  getDefaultProps: () => ({
    backgroundColor: 'gradient',
    padding: 'md',
    showBadges: true,
    showFeatures: true,
    showMarketingPanels: true,
    mainHeading: [
      {
        text: 'Welcome to Little Latte Lane',
        textColor: { color: '#00ffff' },
        alignment: 'center',
        size: '3xl'
      }
    ],
    subtitle: [
      {
        text: 'Café & Deli - Where Great Food Meets Amazing Experiences',
        textColor: { color: '#d1d5db' },
        alignment: 'center',
        size: 'xl'
      }
    ],
    ctaTitle: 'Ready to Experience Little Latte Lane?',
    ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
    badges: [
      {
        text: 'Now Open',
        textColor: { color: '#ffffff' },
        backgroundColor: { color: '#00ffff' }
      },
      {
        text: 'Dine In • Takeaway • Delivery',
        textColor: { color: '#ffffff' },
        backgroundColor: { color: '#ff1493' }
      }
    ],
    features: [
      {
        text: 'Exceptional Quality',
        textColor: { color: '#00ffff' }
      },
      {
        text: 'Exceptional Quality',
        textColor: { color: '#00ffff' }
      },
      {
        text: 'Exceptional Quality',
        textColor: { color: '#00ffff' }
      }
    ],
    marketingPanels: [
      {
        heading: 'Get in Touch',
        subheading: 'We love hearing from our customers',
        description: 'Contact us anytime',
        badgeText: 'Always Available',
        headingColor: { color: '#00ffff' },
        subheadingColor: { color: '#d1d5db' },
        descriptionColor: { color: '#d1d5db' },
        badgeTextColor: { color: '#ffffff' },
        badgeBgColor: { color: '#10b981' }
      },
      {
        heading: 'Opening Hours',
        subheading: 'Fresh coffee and delicious food daily',
        description: 'Mon-Fri: 7:00 AM - 8:00 PM',
        badgeText: 'Now Open',
        headingColor: { color: '#00ffff' },
        subheadingColor: { color: '#d1d5db' },
        descriptionColor: { color: '#d1d5db' },
        badgeTextColor: { color: '#ffffff' },
        badgeBgColor: { color: '#10b981' }
      },
      {
        heading: 'Why Choose Us?',
        subheading: 'Quality meets exceptional service',
        description: 'Premium Coffee • Free WiFi • Fresh Food',
        badgeText: 'Quality First',
        headingColor: { color: '#00ffff' },
        subheadingColor: { color: '#d1d5db' },
        descriptionColor: { color: '#d1d5db' },
        badgeTextColor: { color: '#ffffff' },
        badgeBgColor: { color: '#ff1493' }
      }
    ]
  })
}

// Advanced Heading Schema
;(AdvancedHeading as types.Brick<AdvancedHeadingProps>).schema = {
  name: 'advanced-heading',
  label: 'Advanced Heading',
  category: 'text',
  hideFromAddMenu: true,
  
  sideEditProps: [
    createAdvancedColorProp('textColor', 'Text Color', { presetColors: TEXT_PALETTE }),
    {
      name: 'alignment',
      label: 'Alignment',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]
      }
    },
    {
      name: 'size',
      label: 'Size',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'base', label: 'Base' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'XL' },
          { value: '2xl', label: '2XL' },
          { value: '3xl', label: '3XL' },
        ]
      }
    }
  ],

  getDefaultProps: () => ({
    text: 'Heading Text',
    textColor: { color: '#ffffff' },
    alignment: 'center',
    size: '3xl'
  })
}

// Advanced Subheading Schema
;(AdvancedSubheading as types.Brick<AdvancedSubheadingProps>).schema = {
  name: 'advanced-subheading',
  label: 'Advanced Subheading',
  category: 'text',
  hideFromAddMenu: true,
  
  sideEditProps: [
    createAdvancedColorProp('textColor', 'Text Color', { presetColors: TEXT_PALETTE }),
    {
      name: 'alignment',
      label: 'Alignment',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]
      }
    },
    {
      name: 'size',
      label: 'Size',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'base', label: 'Base' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'XL' },
        ]
      }
    }
  ],

  getDefaultProps: () => ({
    text: 'Subtitle Text',
    textColor: { color: '#d1d5db' },
    alignment: 'center',
    size: 'lg'
  })
}

// Advanced Description Schema
;(AdvancedDescription as types.Brick<AdvancedDescriptionProps>).schema = {
  name: 'advanced-description',
  label: 'Advanced Description',
  category: 'text',
  hideFromAddMenu: true,
  
  sideEditProps: [
    createAdvancedColorProp('textColor', 'Text Color', { presetColors: TEXT_PALETTE }),
    {
      name: 'alignment',
      label: 'Alignment',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]
      }
    },
    {
      name: 'size',
      label: 'Size',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'base', label: 'Base' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'XL' },
        ]
      }
    }
  ],

  getDefaultProps: () => ({
    text: 'Description text goes here...',
    textColor: { color: '#d1d5db' },
    alignment: 'center',
    size: 'lg'
  })
}

// Badge Item Schema
BadgeItem.schema = {
  name: 'badge-item',
  label: 'Badge Item',
  category: 'content',
  hideFromAddMenu: true,
  
  sideEditProps: [
    createAdvancedColorProp('textColor', 'Text Color', { presetColors: TEXT_PALETTE }),
    createAdvancedColorProp('backgroundColor', 'Background Color', { presetColors: NEON_PALETTE })
  ],

  getDefaultProps: () => ({
    text: 'Badge Text',
    textColor: { color: '#ffffff' },
    backgroundColor: { color: '#00ffff' }
  })
}

// Marketing Panel Schema
;(MarketingPanel as types.Brick<MarketingPanelProps>).schema = {
  name: 'marketing-panel',
  label: 'Marketing Panel',
  category: 'content',
  hideFromAddMenu: true,
  
  sideEditProps: [
    {
      groupName: 'Colors',
      props: [
        createAdvancedColorProp('headingColor', 'Heading Color', { presetColors: TEXT_PALETTE }),
        createAdvancedColorProp('subheadingColor', 'Subheading Color', { presetColors: TEXT_PALETTE }),
        createAdvancedColorProp('descriptionColor', 'Description Color', { presetColors: TEXT_PALETTE }),
        createAdvancedColorProp('badgeTextColor', 'Badge Text Color', { presetColors: TEXT_PALETTE }),
        createAdvancedColorProp('badgeBgColor', 'Badge Background', { presetColors: NEON_PALETTE })
      ]
    }
  ],

  getDefaultProps: () => ({
    heading: 'Get in Touch',
    subheading: 'We love hearing from our customers',
    description: 'Contact us anytime',
    badgeText: 'Always Available',
    headingColor: { color: '#00ffff' },
    subheadingColor: { color: '#d1d5db' },
    descriptionColor: { color: '#d1d5db' },
    badgeTextColor: { color: '#ffffff' },
    badgeBgColor: { color: '#10b981' }
  })
}

// Feature Item Schema
FeatureItem.schema = {
  name: 'feature-item',
  label: 'Feature Item',
  category: 'content',
  hideFromAddMenu: true,
  
  sideEditProps: [
    createAdvancedColorProp('textColor', 'Text Color', { presetColors: TEXT_PALETTE })
  ],

  getDefaultProps: () => ({
    text: 'Feature Text',
    textColor: { color: '#00ffff' }
  })
}

export default WelcomingSection
export { AdvancedHeading, AdvancedSubheading, AdvancedDescription, BadgeItem, FeatureItem, MarketingPanel }