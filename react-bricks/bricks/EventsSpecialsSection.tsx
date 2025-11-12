import React from 'react'
import { Text, Repeater, types, Image } from 'react-bricks/frontend'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Nested Component: Event/Special Card
//========================================
interface EventSpecialCardProps {
  // Content Properties
  eventTitle: types.TextValue
  eventDescription: types.TextValue
  eventEmoji: types.TextValue
  eventDate?: types.TextValue
  eventBadge?: types.TextValue
  eventImage?: types.IImageSource

  // Content Visibility Controls
  showTitle: boolean
  showDescription: boolean
  showEmoji: boolean
  showDate: boolean
  showBadge: boolean
  showImage: boolean

  // Content Positioning
  contentAlignment: 'left' | 'center' | 'right'
  titlePosition: 'top' | 'middle' | 'bottom'
  imagePosition: 'background' | 'top' | 'side' | 'overlay'

  // Visual Styling
  cardStyle: 'glass' | 'solid' | 'gradient' | 'minimal'
  cardColor: 'neon' | 'pink' | 'cyan' | 'yellow'
  cardBackground: { color: string }
  titleColor: { color: string }
  descriptionColor: { color: string }
  borderColor: { color: string }

  // Advanced Styling
  customPadding: 'sm' | 'md' | 'lg' | 'xl'
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  borderWidth: 'none' | 'thin' | 'medium' | 'thick'
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong'

  // Image Styling (when image is present)
  imageOpacity: number
  imageBlur: 'none' | 'sm' | 'md' | 'lg'
}

const EventSpecialCard: types.Brick<EventSpecialCardProps> = ({
  // Content
  eventTitle,
  eventDescription,
  eventEmoji,
  eventDate,
  eventBadge,
  eventImage,
  
  // Visibility
  showTitle = true,
  showDescription = true,
  showEmoji = true,
  showDate = false,
  showBadge = false,
  showImage = false,
  
  // Positioning
  contentAlignment = 'left',
  titlePosition = 'top',
  imagePosition = 'background',
  
  // Basic Styling
  cardStyle = 'glass',
  cardColor = 'neon',
  cardBackground = { color: 'transparent' },
  titleColor = { color: '#ffffff' },
  descriptionColor = { color: '#d1d5db' },
  borderColor = { color: '#00ffff' },
  
  // Advanced Styling
  customPadding = 'md',
  borderRadius = 'lg',
  borderWidth = 'thin',
  shadowIntensity = 'medium',
  
  // Image Styling
  imageOpacity = 0.3,
  imageBlur = 'none'
}) => {
  // Enhanced styling functions
  const getCardStyleClass = () => {
    const baseClasses = ['group', 'relative', 'transition-all', 'duration-300', 'hover:scale-105', 'touch-target']
    
    // Border radius
    const radiusMap = {
      'none': 'rounded-none',
      'sm': 'rounded-sm',
      'md': 'rounded-md', 
      'lg': 'rounded-xl',
      'xl': 'rounded-2xl'
    }
    baseClasses.push(radiusMap[borderRadius])

    // Shadow
    const shadowMap = {
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
    
    // Border styling
    const borderWidthMap = {
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
    const paddingMap = {
      'sm': '12px',
      'md': '16px 24px',
      'lg': '20px 32px', 
      'xl': '28px 40px'
    }
    style.padding = paddingMap[customPadding]
    style.minHeight = '180px'

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
      default: return 'text-left'
    }
  }

  const getImageStyle = () => {
    const style: React.CSSProperties = {}
    
    if (imagePosition === 'background') {
      style.opacity = imageOpacity
      
      // Image blur effect
      const blurMap = {
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
    <div
      className={getCardStyleClass()}
      style={getCardStyle()}
    >
      {/* Background Image (if enabled and positioned as background) */}
      {showImage && eventImage && imagePosition === 'background' && (
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
          <Image
            propName="eventImage"
            source={eventImage}
            alt="Event background"
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
        {showImage && eventImage && imagePosition === 'top' && (
          <div className="mb-4">
            <Image
              propName="eventImage"
              source={eventImage}
              alt="Event image"
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

        {/* Header with Emoji and Badge */}
        <div className="flex items-start justify-between mb-3">
          {showEmoji && (
            <Text
              propName="eventEmoji"
              value={eventEmoji}
              renderBlock={(props) => (
                <span className="text-2xl xs:text-3xl filter drop-shadow-lg">
                  {props.children}
                </span>
              )}
              placeholder="🎉"
            />
          )}
          
          {showBadge && eventBadge && (
            <Text
              propName="eventBadge"
              value={eventBadge}
              renderBlock={(props) => (
                <span className="px-2 py-1 text-xs font-semibold bg-neonPink/20 text-neonPink rounded-full border border-neonPink/30">
                  {props.children}
                </span>
              )}
              placeholder="NEW"
            />
          )}
        </div>

        {/* Content Area - Flexible positioning */}
        <div className={`flex-grow flex flex-col ${titlePosition === 'middle' ? 'justify-center' : titlePosition === 'bottom' ? 'justify-end' : 'justify-start'}`}>
          
          {/* Event Title */}
          {showTitle && (
            <Text
              propName="eventTitle"
              value={eventTitle}
              renderBlock={(props) => (
                <h3 
                  className={`font-semibold text-fluid-base xs:text-fluid-lg mb-2 transition-colors duration-300 ${getColorAccent()}`}
                  style={{ color: titleColor?.color }}
                >
                  {props.children}
                </h3>
              )}
              placeholder="Special Event"
            />
          )}

          {/* Event Date */}
          {showDate && eventDate && (
            <Text
              propName="eventDate"
              value={eventDate}
              renderBlock={(props) => (
                <p className="text-sm text-gray-400 mb-2 font-medium">
                  {props.children}
                </p>
              )}
              placeholder="Every Friday"
            />
          )}

          {/* Event Description */}
          {showDescription && (
            <Text
              propName="eventDescription"
              value={eventDescription}
              renderBlock={(props) => (
                <p 
                  className="text-fluid-xs xs:text-fluid-sm leading-relaxed flex-grow group-hover:text-gray-100 transition-colors duration-300"
                  style={{ color: descriptionColor?.color }}
                >
                  {props.children}
                </p>
              )}
              placeholder="Event description goes here"
            />
          )}
        </div>

        {/* Side Image (if positioned on side) */}
        {showImage && eventImage && imagePosition === 'side' && (
          <div className="absolute right-4 top-4 w-16 h-16">
            <Image
              propName="eventImage"
              source={eventImage}
              alt="Event icon"
              imageStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                ...getImageStyle()
              }}
            />
          </div>
        )}
      </div>

      {/* Overlay Image (if positioned as overlay) */}
      {showImage && eventImage && imagePosition === 'overlay' && (
        <div className="absolute top-4 right-4 w-20 h-20 z-20">
          <Image
            propName="eventImage"
            source={eventImage}
            alt="Event overlay"
            imageStyle={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              ...getImageStyle()
            }}
          />
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  )
}

EventSpecialCard.schema = {
  name: 'event-special-card',
  label: 'Event Card',
  hideFromAddMenu: true,
  getDefaultProps: () => ({
    eventEmoji: '🎉',
    eventTitle: 'Special Event',
    eventDescription: 'Join us for an amazing experience',
    eventDate: '',
    eventBadge: '',
    eventImage: undefined,
    
    // Content Display Defaults
    showTitle: true,
    showDescription: true,
    showEmoji: true,
    showDate: false,
    showBadge: false,
    showImage: false,
    
    // Layout & Positioning Defaults
    titlePosition: 'top' as const,
    contentAlignment: 'left' as const,
    imagePosition: 'top' as const,
    
    // Visual Styling Defaults
    cardStyle: 'glass' as const,
    cardColor: 'neon' as const,
    cardBackground: { color: '#1a1a1a' },
    titleColor: { color: '#ffffff' },
    descriptionColor: { color: '#d1d5db' },
    borderColor: { color: '#374151' },
    
    // Advanced Styling Defaults
    customPadding: 'md' as const,
    borderRadius: 'md' as const,
    borderWidth: 'none' as const,
    shadowIntensity: 'medium' as const,
    
    // Image Effects Defaults
    imageOpacity: 1,
    imageBlur: 'none' as const
  }),
  sideEditProps: [
    // Content Visibility Group
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
          name: 'showEmoji',
          label: 'Show Emoji',
          type: types.SideEditPropType.Boolean
        },
        {
          name: 'showDate',
          label: 'Show Date',
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
        }
      ]
    },
    
    // Card Style Group
    {
      groupName: 'Card Style',
      props: [
        {
          name: 'cardStyle',
          label: 'Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'glass', label: 'Glass Effect' },
              { value: 'solid', label: 'Solid' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'minimal', label: 'Minimal' }
            ]
          }
        },
        {
          name: 'cardColor',
          label: 'Accent Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'neon', label: 'Neon (Cyan/Pink)' },
              { value: 'pink', label: 'Pink' },
              { value: 'cyan', label: 'Cyan' },
              { value: 'yellow', label: 'Yellow' }
            ]
          }
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

    // Layout & Positioning Group
    {
      groupName: 'Layout & Positioning',
      props: [
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
          name: 'contentAlignment',
          label: 'Content Alignment',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' }
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
              { value: 'top', label: 'Top' },
              { value: 'background', label: 'Background' },
              { value: 'side', label: 'Side' },
              { value: 'overlay', label: 'Overlay' }
            ]
          },
          show: (props) => props.showImage
        }
      ]
    },

    // Colors Group
    {
      groupName: 'Colors',
      props: [
        createAdvancedColorProp('cardBackground', 'Background'),
        createAdvancedColorProp('titleColor', 'Title'),
        createAdvancedColorProp('descriptionColor', 'Description'),
        createAdvancedColorProp('borderColor', 'Border')
      ]
    },

    // Image Customization Group
    {
      groupName: 'Image Effects',
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
          show: (props) => props.showImage
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
          show: (props) => props.showImage
        }
      ]
    }
  ]
}

//========================================
// Main Component: Events & Specials Section
//========================================
interface EventsSpecialsSectionProps {
  sectionTitle: types.TextValue
  sectionSubtitle?: types.TextValue
  events: types.RepeaterItems
  backgroundColor: string | { color: string }
  titleColor: { color: string }
  subtitleColor: { color: string }
  gridLayout: '2-col' | '3-col' | '4-col' | 'auto'
  sectionPadding: 'sm' | 'md' | 'lg'
  backgroundImage?: types.IImageSource
  enableRealTimeUpdates: boolean
  showEmptyState: boolean
  emptyStateMessage: types.TextValue
}

const EventsSpecialsSection: types.Brick<EventsSpecialsSectionProps> = ({
  sectionTitle,
  sectionSubtitle,
  events,
  backgroundColor = '#0f0f0f',
  titleColor = { color: '#ffffff' },
  subtitleColor = { color: '#d1d5db' },
  gridLayout = 'auto',
  sectionPadding = 'md',
  backgroundImage,
  enableRealTimeUpdates = false,
  showEmptyState = true,
  emptyStateMessage
}) => {
  const getGridClass = () => {
    switch (gridLayout) {
      case '2-col': return 'grid grid-cols-1 sm:grid-cols-2'
      case '3-col': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      case '4-col': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      case 'auto': return 'grid-responsive-3'
      default: return 'grid-responsive-3'
    }
  }

  const getPaddingClass = () => {
    switch (sectionPadding) {
      case 'sm': return 'py-8 xs:py-12'
      case 'md': return 'py-8 xs:py-12'
      case 'lg': return 'py-12 xs:py-16'
      default: return 'py-8 xs:py-12'
    }
  }

  const getBackgroundStyle = () => {
    // Handle both string and object color values
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

  const hasEvents = events && events.length > 0

  return (
    <section 
      className="w-full shadow-neon rounded-xl animate-fade-in mb-8"
      style={getBackgroundStyle()}
    >
      {/* Section Header */}
      <div className={`text-center ${getPaddingClass()} px-6`}>
        <Text
          propName="sectionTitle"
          value={sectionTitle}
          renderBlock={(props) => (
            <h2 
              className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text mb-4"
              style={{ 
                color: typeof titleColor === 'string' ? titleColor : titleColor?.color || '#ffffff',
                WebkitTextFillColor: typeof titleColor === 'string' ? titleColor : titleColor?.color || '#ffffff'
              }}
            >
              {props.children}
            </h2>
          )}
          placeholder="🎉 Events & Specials"
        />
        
        {sectionSubtitle && (
          <Text
            propName="sectionSubtitle"
            value={sectionSubtitle}
            renderBlock={(props) => (
              <p 
                className="text-lg max-w-2xl mx-auto"
                style={{ 
                  color: typeof subtitleColor === 'string' ? subtitleColor : subtitleColor?.color || '#d1d5db'
                }}
              >
                {props.children}
              </p>
            )}
            placeholder="Don't miss our exciting events and special offers"
          />
        )}
      </div>

      {/* Events Grid or Empty State */}
      <div className="px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12">
        {hasEvents ? (
          <div className={`${getGridClass()} max-w-7xl mx-auto gap-4 md:gap-6`}>
            <Repeater
              propName="events"
              items={events}
              renderWrapper={(items) => (
                <>
                  {items}
                </>
              )}
            />
          </div>
        ) : showEmptyState ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <Text
              propName="emptyStateMessage"
              value={emptyStateMessage}
              renderBlock={(props) => (
                <p 
                  className="text-gray-400 text-lg max-w-md mx-auto"
                >
                  {props.children}
                </p>
              )}
              placeholder="No events or specials currently scheduled. Check back soon for exciting updates!"
            />
          </div>
        ) : null}
      </div>

      {/* Real-time Updates Indicator */}
      {enableRealTimeUpdates && (
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-neonCyan rounded-full animate-pulse"></div>
            <span>Updates automatically</span>
          </div>
        </div>
      )}
    </section>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
EventsSpecialsSection.schema = {
  name: 'events-specials-section',
  label: 'Events & Specials Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    sectionTitle: '🎉 Events & Specials',
    sectionSubtitle: 'Don\'t miss our exciting events and special offers',
    backgroundColor: '#0f0f0f',
    titleColor: { color: '#ffffff' },
    subtitleColor: { color: '#d1d5db' },
    gridLayout: 'auto',
    sectionPadding: 'md',
    enableRealTimeUpdates: false,
    showEmptyState: true,
    emptyStateMessage: 'No events or specials currently scheduled. Check back soon for exciting updates!',
    events: [
      {
        type: 'event-special-card',
        props: {
          eventTitle: 'Friday Night Special',
          eventDescription: 'Join us every Friday for live music and special menu items at discounted prices',
          eventEmoji: '🎵',
          eventDate: 'Every Friday',
          eventBadge: 'WEEKLY',
          cardStyle: 'glass',
          cardColor: 'neon',
          showDate: true,
          showBadge: true
        }
      },
      {
        type: 'event-special-card',
        props: {
          eventTitle: 'Happy Hour',
          eventDescription: 'Enjoy 20% off all beverages from 3-5 PM on weekdays',
          eventEmoji: '☕',
          eventDate: 'Weekdays 3-5 PM',
          eventBadge: 'DAILY',
          cardStyle: 'glass',
          cardColor: 'cyan',
          showDate: true,
          showBadge: true
        }
      },
      {
        type: 'event-special-card',
        props: {
          eventTitle: 'Pizza Monday',
          eventDescription: 'All pizzas half price every Monday night',
          eventEmoji: '🍕',
          eventDate: 'Every Monday',
          eventBadge: 'HOT',
          cardStyle: 'glass',
          cardColor: 'pink',
          showDate: true,
          showBadge: true
        }
      }
    ]
  }),

  repeaterItems: [
    {
      name: 'events',
      itemType: 'event-special-card',
      itemLabel: 'Event/Special',
      min: 0,
      max: 20
    }
  ],

  sideEditProps: [
    {
      groupName: 'Background & Layout',
      defaultOpen: true,
      props: [
        createAdvancedColorProp('backgroundColor', 'Background Color', {
          presetColors: BACKGROUND_PALETTE,
          includeTransparency: true
        }),
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
          name: 'gridLayout',
          label: 'Grid Layout',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'auto', label: 'Auto (Responsive)' },
              { value: '2-col', label: '2 Columns' },
              { value: '3-col', label: '3 Columns' },
              { value: '4-col', label: '4 Columns' },
            ],
          },
        },
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
    {
      groupName: 'Typography & Colors',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('titleColor', 'Title Color', {
          presetColors: TEXT_PALETTE
        }),
        createAdvancedColorProp('subtitleColor', 'Subtitle Color', {
          presetColors: TEXT_PALETTE
        }),
      ],
    },
    {
      groupName: 'Advanced Settings',
      defaultOpen: false,
      props: [
        {
          name: 'enableRealTimeUpdates',
          label: 'Enable Real-time Updates',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showEmptyState',
          label: 'Show Empty State Message',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
  ],
}

export default EventsSpecialsSection
export { EventSpecialCard }
