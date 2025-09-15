import React from 'react'
import { Text, Repeater, types } from 'react-bricks/rsc'

//========================================
// Nested Component: Event/Special Card
//========================================
interface EventSpecialCardProps {
  eventTitle: types.TextValue
  eventDescription: types.TextValue
  eventEmoji: types.TextValue
  eventDate?: types.TextValue
  eventBadge?: types.TextValue
  cardStyle: 'glass' | 'solid' | 'gradient'
  cardColor: 'neon' | 'pink' | 'cyan' | 'yellow'
  showDate: boolean
  showBadge: boolean
}

const EventSpecialCard: types.Brick<EventSpecialCardProps> = ({
  eventTitle,
  eventDescription,
  eventEmoji,
  eventDate,
  eventBadge,
  cardStyle = 'glass',
  cardColor = 'neon',
  showDate = false,
  showBadge = false
}) => {
  const getCardStyleClass = () => {
    switch (cardStyle) {
      case 'glass': return 'bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50'
      case 'solid': return 'bg-gray-800/90 border border-gray-600 hover:border-neonCyan/50'
      case 'gradient': return 'bg-gradient-to-br from-black/30 to-gray-900/30 border border-neonCyan/20 hover:border-neonPink/40'
      default: return 'bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50'
    }
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

  return (
    <div
      className={`group relative ${getCardStyleClass()} rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in touch-target`}
      style={{ 
        backdropFilter: cardStyle === 'glass' ? 'blur(10px)' : undefined,
        boxShadow: cardStyle === 'glass' ? '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)' : undefined,
        minHeight: '180px'
      }}
    >
      <div className="p-4 xs:p-6 h-full flex flex-col">
        {/* Header with Emoji and Badge */}
        <div className="flex items-start justify-between mb-3">
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

        {/* Event Title */}
        <Text
          propName="eventTitle"
          value={eventTitle}
          renderBlock={(props) => (
            <h3 className={`font-semibold text-fluid-base xs:text-fluid-lg mb-2 transition-colors duration-300 ${getColorAccent()}`}>
              {props.children}
            </h3>
          )}
          placeholder="Special Event"
        />

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
        <Text
          propName="eventDescription"
          value={eventDescription}
          renderBlock={(props) => (
            <p className="text-gray-300 text-fluid-xs xs:text-fluid-sm leading-relaxed flex-grow group-hover:text-gray-100 transition-colors duration-300">
              {props.children}
            </p>
          )}
          placeholder="Event description goes here"
        />
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  )
}

EventSpecialCard.schema = {
  name: 'event-special-card',
  label: 'Event/Special Card',
  getDefaultProps: () => ({
    eventTitle: 'Special Event',
    eventDescription: 'Join us for this exciting event with great food and atmosphere',
    eventEmoji: '🎉',
    eventDate: '',
    eventBadge: '',
    cardStyle: 'glass',
    cardColor: 'neon',
    showDate: false,
    showBadge: false
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    {
      groupName: 'Card Design',
      defaultOpen: true,
      props: [
        {
          name: 'cardStyle',
          label: 'Card Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'glass', label: 'Glass Effect' },
              { value: 'solid', label: 'Solid' },
              { value: 'gradient', label: 'Gradient' },
            ],
          },
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
              { value: 'yellow', label: 'Yellow' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Content Options',
      defaultOpen: false,
      props: [
        {
          name: 'showDate',
          label: 'Show Date',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showBadge',
          label: 'Show Badge',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
  ],
}

//========================================
// Main Component: Events & Specials Section
//========================================
interface EventsSpecialsSectionProps {
  sectionTitle: types.TextValue
  sectionSubtitle?: types.TextValue
  events: types.RepeaterItems
  backgroundColor: string
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
    const baseStyle = { backgroundColor }
    
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
      className="w-full shadow-neon rounded-xl animate-fade-in"
      style={getBackgroundStyle()}
    >
      {/* Section Header */}
      <div className={`text-center ${getPaddingClass()} px-6`}>
        <Text
          propName="sectionTitle"
          value={sectionTitle}
          renderBlock={(props) => (
            <h2 
              className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4"
              style={{ color: titleColor.color }}
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
                style={{ color: subtitleColor.color }}
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
        {
          name: 'backgroundColor',
          label: 'Background Color',
          type: types.SideEditPropType.Text,
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
        {
          name: 'titleColor',
          label: 'Title Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Color,
            options: [
              { value: { color: '#ffffff' }, label: 'White' },
              { value: { color: '#00ffff' }, label: 'Neon Cyan' },
              { value: { color: '#ff00ff' }, label: 'Neon Pink' },
              { value: { color: '#ffff00' }, label: 'Yellow' },
            ],
          },
        },
        {
          name: 'subtitleColor',
          label: 'Subtitle Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Color,
            options: [
              { value: { color: '#d1d5db' }, label: 'Light Gray' },
              { value: { color: '#ffffff' }, label: 'White' },
              { value: { color: '#00ffff' }, label: 'Neon Cyan' },
            ],
          },
        },
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