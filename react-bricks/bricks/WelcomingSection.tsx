import React from 'react'
import { Text, Repeater, types, Image } from 'react-bricks/frontend'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Car, Clock, Phone } from 'lucide-react'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Nested Component: Welcome Info Card
//========================================
interface WelcomeInfoCardProps {
  // Content Properties
  cardTitle: types.TextValue
  cardDescription: types.TextValue
  cardIcon: 'Clock' | 'Star' | 'Phone' | 'MapPin' | 'Car'
  cardBadge?: types.TextValue
  cardImage?: types.IImageSource

  // Content Display Controls
  showTitle: boolean
  showDescription: boolean
  showIcon: boolean
  showBadge: boolean
  showImage: boolean
  showInfoGrid: boolean

  // Info Grid Content (4 items like "Premium Coffee", "Free WiFi")
  infoItem1: types.TextValue
  infoItem2: types.TextValue
  infoItem3: types.TextValue
  infoItem4: types.TextValue

  // Layout & Positioning
  contentAlignment: 'left' | 'center' | 'right'
  titlePosition: 'top' | 'middle' | 'bottom'
  imagePosition: 'background' | 'top' | 'side' | 'overlay'

  // Card Style
  cardStyle: 'glass' | 'solid' | 'gradient' | 'minimal'
  cardColor: 'neon' | 'pink' | 'cyan' | 'yellow'
  cardBackground: { color: string }
  cardBackgroundImage?: types.IImageSource
  titleColor: { color: string }
  descriptionColor: { color: string }
  borderColor: { color: string }

  // Advanced Styling
  customPadding: 'sm' | 'md' | 'lg' | 'xl'
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  borderWidth: 'none' | 'thin' | 'medium' | 'thick'
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong'

  // Image Effects
  imageOpacity: number
  imageBlur: 'none' | 'sm' | 'md' | 'lg'
}

const WelcomeInfoCard: types.Brick<WelcomeInfoCardProps> = ({ 
  // Content
  cardTitle,
  cardDescription,
  cardIcon = 'Clock',
  cardBadge,
  cardImage,
  
  // Info Grid
  infoItem1,
  infoItem2,
  infoItem3,
  infoItem4,
  
  // Visibility
  showTitle = true,
  showDescription = true,
  showIcon = true,
  showBadge = false,
  showImage = false,
  showInfoGrid = false,
  
  // Positioning
  contentAlignment = 'center',
  titlePosition = 'top',
  imagePosition = 'background',
  
  // Basic Styling
  cardStyle = 'glass',
  cardColor = 'neon',
  cardBackground = { color: 'transparent' },
  cardBackgroundImage,
  titleColor = { color: '#ffffff' },
  descriptionColor = { color: '#d1d5db' },
  borderColor = { color: '#00ffff' },
  
  // Advanced Styling
  customPadding = 'md',
  borderRadius = 'lg',
  borderWidth = 'thin',
  shadowIntensity = 'medium',
  
  // Image Effects
  imageOpacity = 0.3,
  imageBlur = 'none'
}) => {
  // Icon mapping
  const iconMap = {
    Clock: Clock,
    Star: Star,
    Phone: Phone,
    MapPin: MapPin,
    Car: Car
  }
  
  const IconComponent = iconMap[cardIcon]

  // Enhanced styling functions (same as EventSpecialCard)
  const getCardStyleClass = () => {
    const baseClasses = ['group', 'relative', 'transition-all', 'duration-300', 'hover:scale-105', 'touch-target', 'block']
    
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
      'medium': 'shadow-lg',
      'strong': 'shadow-2xl shadow-neon'
    }
    if (shadowMap[shadowIntensity]) {
      baseClasses.push(shadowMap[shadowIntensity])
    }

    // Card style base
    switch (cardStyle) {
      case 'glass':
        baseClasses.push('bg-black/20', 'backdrop-blur-md', 'hover:border-neonPink/50')
        break
      case 'solid':
        baseClasses.push('bg-gray-800/90', 'hover:border-neonCyan/50')
        break
      case 'gradient':
        baseClasses.push('bg-gradient-to-br', 'from-black/30', 'to-gray-900/30', 'hover:border-neonPink/40')
        break
      case 'minimal':
        baseClasses.push('bg-transparent', 'hover:bg-black/10')
        break
    }

    return baseClasses.join(' ')
  }

  const getCardStyle = () => {
    const style: React.CSSProperties = {}
    
    // Custom background color
    if (cardBackground?.color && cardBackground.color !== 'transparent') {
      style.backgroundColor = cardBackground.color
    }
    
    // Background image support (like EventsSpecialsSection)
    if (cardBackgroundImage) {
      if (cardBackground?.color && cardBackground.color !== 'transparent') {
        // Layer background image with color overlay
        style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${cardBackgroundImage.src})`
      } else {
        style.backgroundImage = `url(${cardBackgroundImage.src})`
      }
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center'
      style.backgroundRepeat = 'no-repeat'
    }
    
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

    // Glass effect styling
    if (cardStyle === 'glass') {
      style.backdropFilter = 'blur(10px)'
      style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
    }

    // Minimum height and padding
    const paddingMap: Record<string, string> = {
      'sm': '12px',
      'md': '16px 24px',
      'lg': '20px 32px', 
      'xl': '28px 40px'
    }
    style.padding = paddingMap[customPadding]
    style.minHeight = '280px'

    return style
  }

  const getColorAccent = () => {
    switch (cardColor) {
      case 'neon': return 'text-neonCyan group-hover:text-neonPink'
      case 'pink': return 'text-neonPink group-hover:text-neonYellow'
      case 'cyan': return 'text-neonCyan group-hover:text-white'
      case 'yellow': return 'text-neonYellow group-hover:text-neonPink'
      default: return 'text-neonCyan group-hover:text-neonPink'
    }
  }

  const getContentAlignmentClass = () => {
    switch (contentAlignment) {
      case 'left': return 'text-left'
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  const getImageStyle = () => {
    const style: React.CSSProperties = {}
    
    if (imagePosition === 'background') {
      style.opacity = imageOpacity
      
      // Image blur effect
      const blurMap: Record<string, string> = {
        'none': 'blur(0)',
        'sm': 'blur(2px)',
        'md': 'blur(4px)', 
        'lg': 'blur(8px)'
      }
      style.filter = blurMap[imageBlur]
    }
    
    return style
  }

  return (
    <div className={getCardStyleClass()} style={getCardStyle()}>
      {/* Background Image (if enabled and positioned as background) */}
      {showImage && cardImage && imagePosition === 'background' && (
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
          <Image
            propName="cardImage"
            source={cardImage}
            alt="Card background"
            imageStyle={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              ...getImageStyle()
            }}
          />
        </div>
      )}

      {/* Main Content Container */}
      <div className={`relative z-10 h-full flex flex-col ${getContentAlignmentClass()}`}>
        
        {/* Top Image (if positioned at top) */}
        {showImage && cardImage && imagePosition === 'top' && (
          <div className="mb-4">
            <Image
              propName="cardImage"
              source={cardImage}
              alt="Card image"
              imageStyle={{
                width: '100%',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '8px',
                ...getImageStyle()
              }}
            />
          </div>
        )}

        {/* Header with Icon and Badge */}
        <div className="flex items-start justify-between mb-4">
          {showIcon && (
            <div className={`text-4xl ${getColorAccent()} filter drop-shadow-lg`}>
              <IconComponent className="h-8 w-8" />
            </div>
          )}
          
          {showBadge && cardBadge && (
            <Text
              propName="cardBadge"
              value={cardBadge}
              renderBlock={(props) => (
                <span className="px-3 py-1 text-xs font-semibold bg-neonPink/20 text-neonPink rounded-full border border-neonPink/30">
                  {props.children}
                </span>
              )}
              placeholder="NEW"
            />
          )}
        </div>

        {/* Content Area - Flexible positioning */}
        <div className={`flex-grow flex flex-col ${titlePosition === 'middle' ? 'justify-center' : titlePosition === 'bottom' ? 'justify-end' : 'justify-start'}`}>
          
          {/* Card Title */}
          {showTitle && (
            <Text
              propName="cardTitle"
              value={cardTitle}
              renderBlock={(props) => (
                <h3 
                  className={`font-semibold text-lg xs:text-xl mb-3 transition-colors duration-300 ${getColorAccent()}`}
                  style={{ color: titleColor?.color }}
                >
                  {props.children}
                </h3>
              )}
              placeholder="Opening Hours"
            />
          )}

          {/* Card Description */}
          {showDescription && (
            <Text
              propName="cardDescription"
              value={cardDescription}
              renderBlock={(props) => (
                <p 
                  className="text-sm xs:text-base leading-relaxed mb-4"
                  style={{ color: descriptionColor?.color }}
                >
                  {props.children}
                </p>
              )}
              placeholder="Fresh coffee and delicious food daily"
            />
          )}

          {/* Info Grid (for features, schedule, etc.) */}
          {showInfoGrid && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Text
                propName="infoItem1"
                value={infoItem1}
                renderBlock={(props) => (
                  <div className="text-gray-300">{props.children}</div>
                )}
                placeholder="Mon-Fri: 7:00 AM - 8:00 PM"
              />
              <Text
                propName="infoItem2"
                value={infoItem2}
                renderBlock={(props) => (
                  <div className="text-gray-300">{props.children}</div>
                )}
                placeholder="Saturday: 8:00 AM - 9:00 PM"
              />
              <Text
                propName="infoItem3"
                value={infoItem3}
                renderBlock={(props) => (
                  <div className="text-gray-300">{props.children}</div>
                )}
                placeholder="Sunday: 8:00 AM - 7:00 PM"
              />
              <Text
                propName="infoItem4"
                value={infoItem4}
                renderBlock={(props) => (
                  <div className="text-gray-300">{props.children}</div>
                )}
                placeholder="Holidays: Special Hours"
              />
            </div>
          )}
        </div>

        {/* Badge at bottom if enabled */}
        {showBadge && cardBadge && (
          <div className="mt-4">
            <Text
              propName="cardBadge"
              value={cardBadge}
              renderBlock={(props) => (
                <span className="inline-block px-4 py-2 text-sm font-semibold bg-green-500/20 text-green-400 rounded-full border border-green-400/30">
                  {props.children}
                </span>
              )}
              placeholder="Now Open"
            />
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  )
}

// WelcomeInfoCard Schema with 6-group architecture
WelcomeInfoCard.schema = {
  name: 'welcome-info-card',
  label: 'Welcome Info Card',
  hideFromAddMenu: true,
  getDefaultProps: () => ({
    cardIcon: 'Clock',
    cardTitle: 'Opening Hours',
    cardDescription: 'Fresh coffee and delicious food daily',
    cardBadge: 'Now Open',
    infoItem1: 'Mon-Fri: 7:00 AM - 8:00 PM',
    infoItem2: 'Saturday: 8:00 AM - 9:00 PM', 
    infoItem3: 'Sunday: 8:00 AM - 7:00 PM',
    infoItem4: 'Holidays: Special Hours',
    
    // Content Display Defaults
    showTitle: true,
    showDescription: true,
    showIcon: true,
    showBadge: true,
    showImage: false,
    showInfoGrid: true,
    
    // Layout & Positioning Defaults
    titlePosition: 'top' as const,
    contentAlignment: 'center' as const,
    imagePosition: 'top' as const,
    
    // Visual Styling Defaults
    cardStyle: 'glass' as const,
    cardColor: 'cyan' as const,
    cardBackground: { color: 'transparent' },
    titleColor: { color: '#ffffff' },
    descriptionColor: { color: '#d1d5db' },
    borderColor: { color: '#00ffff' },
    
    // Advanced Styling Defaults
    customPadding: 'md' as const,
    borderRadius: 'lg' as const,
    borderWidth: 'thin' as const,
    shadowIntensity: 'medium' as const,
    
    // Image Effects Defaults
    imageOpacity: 0.3,
    imageBlur: 'none' as const
  }),
  sideEditProps: [
    // Group 1: Content Display
    {
      groupName: 'Content Display',
      defaultOpen: true,
      props: [
        {
          name: 'showTitle',
          label: 'Show Title',
          type: types.SideEditPropType.Boolean
        },
        {
          name: 'showDescription',
          label: 'Show Description',
          type: types.SideEditPropType.Boolean
        },
        {
          name: 'showIcon',
          label: 'Show Icon',
          type: types.SideEditPropType.Boolean
        },
        {
          name: 'showBadge',
          label: 'Show Badge',
          type: types.SideEditPropType.Boolean
        },
        {
          name: 'showImage',
          label: 'Show Image',
          type: types.SideEditPropType.Boolean
        },
        {
          name: 'showInfoGrid',
          label: 'Show Info Grid',
          type: types.SideEditPropType.Boolean
        }
      ]
    },
    
    // Group 2: Card Style
    {
      groupName: 'Card Style',
      defaultOpen: false,
      props: [
        {
          name: 'cardIcon',
          label: 'Icon',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'Clock', label: 'Clock (Hours)' },
              { value: 'Star', label: 'Star (Quality)' },
              { value: 'Phone', label: 'Phone (Contact)' },
              { value: 'MapPin', label: 'Map Pin (Location)' },
              { value: 'Car', label: 'Car (Parking)' }
            ]
          }
        },
        {
          name: 'cardStyle',
          label: 'Card Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'glass', label: 'Glass Effect' },
              { value: 'solid', label: 'Solid Background' },
              { value: 'gradient', label: 'Gradient Background' },
              { value: 'minimal', label: 'Minimal Style' }
            ]
          }
        },
        {
          name: 'cardColor',
          label: 'Card Accent Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'neon', label: 'Neon Cyan' },
              { value: 'pink', label: 'Neon Pink' },
              { value: 'cyan', label: 'Cyan Blue' },
              { value: 'yellow', label: 'Neon Yellow' }
            ]
          }
        },
        createAdvancedColorProp('cardBackground', 'Card Background', { presetColors: BACKGROUND_PALETTE }),
        {
          name: 'cardBackgroundImage',
          label: 'Card Background Image',
          type: types.SideEditPropType.Image,
        },
        createAdvancedColorProp('borderColor', 'Border Color', { presetColors: TEXT_PALETTE })
      ]
    },
    
    // Group 3: Layout & Positioning
    {
      groupName: 'Layout & Positioning',
      defaultOpen: false,
      props: [
        {
          name: 'contentAlignment',
          label: 'Content Alignment',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'left', label: 'Left Aligned' },
              { value: 'center', label: 'Center Aligned' },
              { value: 'right', label: 'Right Aligned' }
            ]
          }
        },
        {
          name: 'titlePosition',
          label: 'Title Position',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'top', label: 'Top' },
              { value: 'middle', label: 'Middle' },
              { value: 'bottom', label: 'Bottom' }
            ]
          }
        },
        {
          name: 'imagePosition',
          label: 'Image Position',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'background', label: 'Background' },
              { value: 'top', label: 'Top' },
              { value: 'side', label: 'Side' },
              { value: 'overlay', label: 'Overlay' }
            ]
          },
          show: (props: WelcomeInfoCardProps) => props.showImage
        },
        {
          name: 'customPadding',
          label: 'Padding',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra Large' }
            ]
          }
        },
        {
          name: 'borderRadius',
          label: 'Border Radius',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra Large' }
            ]
          }
        },
        {
          name: 'borderWidth',
          label: 'Border Width',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'thin', label: 'Thin' },
              { value: 'medium', label: 'Medium' },
              { value: 'thick', label: 'Thick' }
            ]
          }
        },
        {
          name: 'shadowIntensity',
          label: 'Shadow',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'subtle', label: 'Subtle' },
              { value: 'medium', label: 'Medium' },
              { value: 'strong', label: 'Strong' }
            ]
          }
        }
      ]
    },
    
    // Group 4: Colors
    {
      groupName: 'Colors',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('titleColor', 'Title Color', { presetColors: TEXT_PALETTE }),
        createAdvancedColorProp('descriptionColor', 'Description Color', { presetColors: TEXT_PALETTE })
      ]
    },
    
    // Group 5: Image Effects
    {
      groupName: 'Image Effects',
      defaultOpen: false,
      props: [
        {
          name: 'imageOpacity',
          label: 'Opacity',
          type: types.SideEditPropType.Range,
          rangeOptions: {
            min: 0,
            max: 1,
            step: 0.1
          },
          show: (props: WelcomeInfoCardProps) => props.showImage
        },
        {
          name: 'imageBlur',
          label: 'Blur',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' }
            ]
          },
          show: (props: WelcomeInfoCardProps) => props.showImage
        }
      ]
    }
  ]
}

//========================================
// Main Component: WelcomingSection - With Static Info Panels
//========================================
interface WelcomingSectionProps {
  heroTitle: types.TextValue
  heroSubtitle: types.TextValue
  badge1Text: types.TextValue
  badge2Text: types.TextValue
  ctaTitle: types.TextValue
  ctaDescription: types.TextValue
  feature1Text: types.TextValue
  feature2Text: types.TextValue
  feature3Text: types.TextValue
  
  // Info Panels (replaces carousel)
  infoPanels: types.RepeaterItems
  
  // Styling Controls
  backgroundColor: string | { color: string }
  titleColor: { color: string }
  subtitleColor: { color: string }
  showBadges: boolean
  showCarousel: boolean
  showCTA: boolean
  showFeatures: boolean
  
  // Background Image Support (like EventsSpecialsSection)
  backgroundImage?: types.IImageSource
  
  // Layout Controls
  sectionPadding: 'sm' | 'md' | 'lg'
}

const WelcomingSection: types.Brick<WelcomingSectionProps> = ({
  heroTitle,
  heroSubtitle,
  badge1Text,
  badge2Text,
  ctaTitle,
  ctaDescription,
  feature1Text,
  feature2Text,
  feature3Text,
  infoPanels,
  backgroundColor = '#0f0f0f',
  titleColor = { color: '#ffffff' },
  subtitleColor = { color: '#d1d5db' },
  showBadges = true,
  showCarousel = true,
  showCTA = true,
  showFeatures = true,
  backgroundImage,
  sectionPadding = 'md'
}) => {
  const getPaddingClass = () => {
    switch (sectionPadding) {
      case 'sm': return 'py-8 xs:py-12'
      case 'md': return 'py-12 xs:py-16'
      case 'lg': return 'py-16 xs:py-20'
      default: return 'py-12 xs:py-16'
    }
  }

  const getBackgroundStyle = () => {
    // Handle both string and object color values (like EventsSpecialsSection)
    const bgColor = typeof backgroundColor === 'string' ? backgroundColor : backgroundColor?.color || '#0f0f0f'
    const baseStyle = { backgroundColor: bgColor }
    
    if (backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    
    return baseStyle
  }

  return (
    <section 
      className={`bg-gradient-to-br from-darkBg via-gray-900 to-darkBg ${getPaddingClass()} overflow-hidden mb-8`}
      style={getBackgroundStyle()}
    >
      <div className="container-wide animate-fade-in">
        {/* Hero Header - Fully Responsive */}
        <div className="text-center section-padding-sm">
          <Text
            propName="heroTitle"
            value={heroTitle}
            renderBlock={(props) => (
              <h1 
                className="text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent"
                style={{ color: titleColor.color }}
              >
                {props.children}
              </h1>
            )}
            placeholder="Welcome to Little Latte Lane"
          />
          
          <Text
            propName="heroSubtitle"
            value={heroSubtitle}
            renderBlock={(props) => (
              <p 
                className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl text-gray-300 mb-4 xs:mb-6 max-w-4xl mx-auto"
                style={{ color: subtitleColor.color }}
              >
                {props.children}
              </p>
            )}
            placeholder="Café & Deli - Where Great Food Meets Amazing Experiences"
          />
          
          {showBadges && (
            <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-8 xs:mb-12">
              <Badge className="bg-neonCyan text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
                <Text
                  propName="badge1Text"
                  value={badge1Text}
                  renderBlock={(props) => <span>{props.children}</span>}
                  placeholder="Now Open"
                />
              </Badge>
              <Badge className="bg-neonPink text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
                <Text
                  propName="badge2Text"
                  value={badge2Text}
                  renderBlock={(props) => <span>{props.children}</span>}
                  placeholder="Dine In • Takeaway • Delivery"
                />
              </Badge>
            </div>
          )}
        </div>

        {/* Static Info Panels - Replacing Dynamic Carousel */}
        {showCarousel && (
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Repeater
                propName="infoPanels"
                items={infoPanels}
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
        {showCTA && (
          <div className="text-center">
            <Text
              propName="ctaTitle"
              value={ctaTitle}
              renderBlock={(props) => (
                <h2 className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4">
                  {props.children}
                </h2>
              )}
              placeholder="Ready to Experience Little Latte Lane?"
            />
            
            <Text
              propName="ctaDescription"
              value={ctaDescription}
              renderBlock={(props) => (
                <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                  {props.children}
                </p>
              )}
              placeholder="Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you're catching up with friends, having a business meeting, or enjoying a quiet moment, we're here to make your experience memorable."
            />
            
            {showFeatures && (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <div className="flex items-center justify-center gap-2 text-neonCyan">
                  <Star className="h-5 w-5" />
                  <Text
                    propName="feature1Text"
                    value={feature1Text}
                    renderBlock={(props) => (
                      <span className="text-sm font-medium">{props.children}</span>
                    )}
                    placeholder="Exceptional Quality"
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-neonPink">
                  <MapPin className="h-5 w-5" />
                  <Text
                    propName="feature2Text"
                    value={feature2Text}
                    renderBlock={(props) => (
                      <span className="text-sm font-medium">{props.children}</span>
                    )}
                    placeholder="Prime Location"
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Car className="h-5 w-5" />
                  <Text
                    propName="feature3Text"
                    value={feature3Text}
                    renderBlock={(props) => (
                      <span className="text-sm font-medium">{props.children}</span>
                    )}
                    placeholder="Easy Parking"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

//========================================
// Brick Schema - Enhanced with Static Info Panels
//========================================
WelcomingSection.schema = {
  name: 'welcoming-section',
  label: 'Welcoming Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    heroTitle: 'Welcome to Little Latte Lane',
    heroSubtitle: 'Café & Deli',
    badge1Text: 'Now Open',
    badge2Text: 'Dine In • Takeaway • Delivery',
    ctaTitle: 'Ready to Experience Little Latte Lane?',
    ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
    feature1Text: 'Exceptional Quality',
    feature2Text: 'Prime Location',
    feature3Text: 'Easy Parking',
    backgroundColor: '#0f0f0f',
    titleColor: { color: '#ffffff' },
    subtitleColor: { color: '#d1d5db' },
    showBadges: true,
    showCarousel: true,
    showCTA: true,
    showFeatures: true,
    sectionPadding: 'md',
    infoPanels: [
      {
        type: 'welcome-info-card',
        props: {
          cardIcon: 'Clock',
          cardTitle: 'Opening Hours',
          cardDescription: 'Fresh coffee and delicious food daily',
          cardBadge: 'Now Open',
          infoItem1: 'Mon-Fri: 7:00 AM - 8:00 PM',
          infoItem2: 'Saturday: 8:00 AM - 9:00 PM',
          infoItem3: 'Sunday: 8:00 AM - 7:00 PM',
          infoItem4: 'Holidays: Special Hours',
          cardStyle: 'glass',
          cardColor: 'cyan',
          showInfoGrid: true,
          borderColor: { color: '#00ffff' }
        }
      },
      {
        type: 'welcome-info-card',
        props: {
          cardIcon: 'Star',
          cardTitle: 'Why Choose Us?',
          cardDescription: 'Premium quality meets exceptional service',
          cardBadge: 'Quality First',
          infoItem1: '☕ Premium Coffee',
          infoItem2: '📶 Free WiFi',
          infoItem3: '🚗 Easy Parking',
          infoItem4: '🍽️ Fresh Food',
          cardStyle: 'glass',
          cardColor: 'pink',
          showInfoGrid: true,
          borderColor: { color: '#ff00ff' }
        }
      },
      {
        type: 'welcome-info-card',
        props: {
          cardIcon: 'Phone',
          cardTitle: 'Get in Touch',
          cardDescription: 'We love hearing from our customers',
          cardBadge: 'Always Available',
          infoItem1: '📞 Call Us',
          infoItem2: '📧 Email',
          infoItem3: '📍 Visit',
          infoItem4: '💬 Message',
          cardStyle: 'glass',
          cardColor: 'yellow',
          showInfoGrid: true,
          borderColor: { color: '#ffff00' }
        }
      }
    ]
  }),

  repeaterItems: [
    {
      name: 'infoPanels',
      itemType: 'welcome-info-card',
      itemLabel: 'Info Panel',
      min: 0,
      max: 6
    }
  ],

  sideEditProps: [
    {
      groupName: 'Content Display',
      defaultOpen: true,
      props: [
        {
          name: 'showBadges',
          label: 'Show Status Badges',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showCarousel',
          label: 'Show Info Panels',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showCTA',
          label: 'Show Call to Action',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showFeatures',
          label: 'Show Feature Icons',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
    {
      groupName: 'Colors & Styling',
      defaultOpen: false,
      props: [
        createAdvancedColorProp(
          'backgroundColor',
          'Background Color',
          { presetColors: BACKGROUND_PALETTE }
        ),
        {
          name: 'backgroundImage',
          label: 'Background Image',
          type: types.SideEditPropType.Image,
        },
        createAdvancedColorProp(
          'titleColor',
          'Title Color',
          { presetColors: TEXT_PALETTE }
        ),
        createAdvancedColorProp(
          'subtitleColor',
          'Subtitle Color',
          { presetColors: TEXT_PALETTE }
        ),
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
            ],
          },
        },
      ],
    },
  ],
}

export default WelcomingSection
export { WelcomeInfoCard }
