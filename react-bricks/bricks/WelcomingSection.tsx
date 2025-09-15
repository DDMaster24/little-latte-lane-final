import React from 'react'
import { Text, Repeater, types } from 'react-bricks/rsc'
import { Badge } from '@/components/ui/badge'

//========================================
// Nested Component: Feature Item
//========================================
interface FeatureItemProps {
  icon: types.TextValue
  text: types.TextValue
  color: 'cyan' | 'pink' | 'yellow'
}

const FeatureItem: types.Brick<FeatureItemProps> = ({ icon, text, color }) => {
  const getColorClass = () => {
    switch (color) {
      case 'cyan': return 'text-neonCyan'
      case 'pink': return 'text-neonPink'
      case 'yellow': return 'text-yellow-400'
      default: return 'text-neonCyan'
    }
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${getColorClass()}`}>
      <Text
        propName="icon"
        value={icon}
        renderBlock={(props) => (
          <span className="text-sm">
            {props.children}
          </span>
        )}
        placeholder="⭐"
      />
      <Text
        propName="text"
        value={text}
        renderBlock={(props) => (
          <span className="text-sm font-medium">
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
    color: 'cyan'
  }),
  hideFromAddMenu: true, // Official docs pattern for nested bricks
  sideEditProps: [
    {
      name: 'color',
      label: 'Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Color,
        options: [
          { value: 'cyan', label: 'Cyan' },
          { value: 'pink', label: 'Pink' },
          { value: 'yellow', label: 'Yellow' },
        ],
      },
    },
  ],
}

//========================================
// Nested Component: Badge Item
//========================================
interface BadgeItemProps {
  text: types.TextValue
  bgColor: 'cyan' | 'pink' | 'yellow'
}

const BadgeItem: types.Brick<BadgeItemProps> = ({ text, bgColor }) => {
  const getBgColorClass = () => {
    switch (bgColor) {
      case 'cyan': return 'bg-neonCyan text-black'
      case 'pink': return 'bg-neonPink text-white'
      case 'yellow': return 'bg-yellow-400 text-black'
      default: return 'bg-neonCyan text-black'
    }
  }

  return (
    <Badge className={`${getBgColorClass()} px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium`}>
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
    bgColor: 'cyan'
  }),
  hideFromAddMenu: true, // Official docs pattern for nested bricks
  sideEditProps: [
    {
      name: 'bgColor',
      label: 'Badge Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Color,
        options: [
          { value: 'cyan', label: 'Cyan' },
          { value: 'pink', label: 'Pink' },
          { value: 'yellow', label: 'Yellow' },
        ],
      },
    },
  ],
}

//========================================
// Main Component: Welcoming Section
//========================================
interface WelcomingSectionProps {
  title: types.TextValue
  subtitle: types.TextValue
  ctaTitle: types.TextValue
  ctaDescription: types.TextValue
  badges: types.RepeaterItems
  features: types.RepeaterItems
  backgroundColor: 'dark' | 'darker' | 'gradient'
  titleSize: 'normal' | 'large' | 'xl'
  backgroundImage?: types.IImageSource
  padding: 'sm' | 'md' | 'lg'
  titleColor: { color: string }
  subtitleColor: { color: string }
  showBadges: boolean
  badgeStyle: 'outlined' | 'filled' | 'gradient'
  showFeatures: boolean
  ctaStyle: 'buttons' | 'minimal' | 'cards'
}

const WelcomingSection: types.Brick<WelcomingSectionProps> = ({ 
  title,
  subtitle,
  ctaTitle,
  ctaDescription,
  badges,
  features,
  backgroundColor = 'dark',
  titleSize = 'normal',
  backgroundImage,
  padding = 'md',
  titleColor = { color: '#ffffff' },
  subtitleColor = { color: '#d1d5db' },
  showBadges = true,
  showFeatures = true,
  ctaStyle = 'buttons',
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

  // Title size classes
  const getTitleSizeClass = () => {
    switch (titleSize) {
      case 'normal': return 'text-fluid-3xl xs:text-fluid-4xl lg:text-fluid-5xl'
      case 'large': return 'text-fluid-4xl xs:text-fluid-5xl lg:text-fluid-6xl'
      case 'xl': return 'text-fluid-5xl xs:text-fluid-6xl lg:text-fluid-7xl'
      default: return 'text-fluid-3xl xs:text-fluid-4xl lg:text-fluid-5xl'
    }
  }

  // Padding classes
  const getPaddingClass = () => {
    switch (padding) {
      case 'sm': return 'py-8 xs:py-12 lg:py-16'
      case 'md': return 'py-12 xs:py-16 lg:py-24'
      case 'lg': return 'py-16 xs:py-24 lg:py-32'
      default: return 'py-12 xs:py-16 lg:py-24'
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
        {/* Hero Header - Fully Responsive */}
        <div className="text-center section-padding-sm">
          <Text
            propName="title"
            value={title}
            renderBlock={(props) => (
              <h1 
                className={`${getTitleSizeClass()} font-bold mb-4 xs:mb-6`}
                style={{ color: titleColor.color }}
              >
                {props.children}
              </h1>
            )}
            placeholder="Welcome to Little Latte Lane"
          />
          
          <Text
            propName="subtitle"
            value={subtitle}
            renderBlock={(props) => (
              <p 
                className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl mb-6 xs:mb-8 max-w-4xl mx-auto"
                style={{ color: subtitleColor.color }}
              >
                {props.children}
              </p>
            )}
            placeholder="Café & Deli - Where Great Food Meets Amazing Experiences"
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

        {/* CTA Section - Enhanced with style options */}
        <div className="text-center section-padding-sm">
          <Text
            propName="ctaTitle"
            value={ctaTitle}
            renderBlock={(props) => (
              <h2 
                className="text-fluid-xl xs:text-fluid-2xl sm:text-fluid-3xl font-bold mb-4 xs:mb-6"
                style={{ color: titleColor.color }}
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
                className="text-fluid-base xs:text-fluid-lg text-center mb-8 xs:mb-12 max-w-3xl mx-auto leading-relaxed"
                style={{ color: subtitleColor.color }}
              >
                {props.children}
              </p>
            )}
            placeholder="Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere."
          />

          {/* CTA Buttons - Style-based rendering */}
          {ctaStyle === 'buttons' && (
            <div className="flex flex-col xs:flex-row justify-center gap-3 xs:gap-4 mb-8 xs:mb-12">
              <button className="inline-flex items-center justify-center gap-2 bg-neonCyan text-black px-6 xs:px-8 py-3 xs:py-4 rounded-lg font-semibold text-fluid-sm xs:text-fluid-base hover:bg-cyan-400 transition-all duration-300 group">
                <span>Order Now</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
              <button className="inline-flex items-center justify-center gap-2 border-2 border-neonPink text-neonPink px-6 xs:px-8 py-3 xs:py-4 rounded-lg font-semibold text-fluid-sm xs:text-fluid-base hover:bg-neonPink hover:text-white transition-all duration-300">
                <span>View Menu</span>
              </button>
            </div>
          )}
        </div>

        {/* Features Section - Conditional */}
        {showFeatures && (
          <div className="text-center section-padding-sm">
            <Repeater
              propName="features"
              items={features}
              renderWrapper={(items) => (
                <div className="flex flex-wrap justify-center gap-4 xs:gap-6 lg:gap-8">
                  {items}
                </div>
              )}
            />
          </div>
        )}
      </div>
    </section>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
WelcomingSection.schema = {
  name: 'welcoming-section',
  label: 'Welcoming Section',
  category: 'Little Latte Lane',
  
  // Defaults
  getDefaultProps: () => ({
    title: 'Welcome to Little Latte Lane',
    subtitle: 'Café & Deli - Where Great Food Meets Amazing Experiences',
    ctaTitle: 'Ready to Experience Little Latte Lane?',
    ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
    backgroundColor: 'gradient',
    titleSize: 'normal',
    padding: 'md',
    titleColor: { color: '#ffffff' },
    subtitleColor: { color: '#d1d5db' },
    showBadges: true,
    badgeStyle: 'filled',
    showFeatures: true,
    ctaStyle: 'buttons',
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

  // PROFESSIONAL SIDEBAR CONTROLS - Based on Official Documentation
  sideEditProps: [
    {
      groupName: 'Background & Layout',
      defaultOpen: true,
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
      groupName: 'Content Settings',
      defaultOpen: false,
      props: [
        {
          name: 'showBadges',
          label: 'Show Badges',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'badgeStyle',
          label: 'Badge Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'outlined', label: 'Outlined' },
              { value: 'filled', label: 'Filled' },
              { value: 'gradient', label: 'Gradient' },
            ],
          },
          show: (props) => props.showBadges,
        },
        {
          name: 'showFeatures',
          label: 'Show Features',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'ctaStyle',
          label: 'Call-to-Action Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'buttons', label: 'Buttons' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'cards', label: 'Cards' },
            ],
          },
        },
      ],
    },
  ],
}

export default WelcomingSection
export { FeatureItem, BadgeItem }