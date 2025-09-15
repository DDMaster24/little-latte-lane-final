import React from 'react'
import { Text, Repeater, types } from 'react-bricks/rsc'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/AuthProvider'
import { Star, MapPin, Car } from 'lucide-react'
import DynamicCarousel from '@/components/DynamicCarousel'

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

  const getIconComponent = () => {
    const iconText = typeof icon === 'string' ? icon : icon?.toString() || '⭐'
    
    // Map text to Lucide icons for the original features
    if (iconText.includes('Star') || iconText === '⭐') return <Star className="h-5 w-5" />
    if (iconText.includes('MapPin') || iconText === '📍') return <MapPin className="h-5 w-5" />
    if (iconText.includes('Car') || iconText === '🚗') return <Car className="h-5 w-5" />
    
    // Fallback to text icon
    return <span className="text-lg">{iconText}</span>
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${getColorClass()}`}>
      {getIconComponent()}
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
  hideFromAddMenu: true,
  sideEditProps: [
    {
      name: 'icon',
      label: 'Icon',
      type: types.SideEditPropType.Text,
    },
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
      case 'pink': return 'bg-neonPink text-black'
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
  hideFromAddMenu: true,
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
  showCarousel: boolean
  showAuthGreeting: boolean
  backgroundColor: 'dark' | 'darker' | 'gradient'
  titleSize: 'normal' | 'large' | 'xl'
  backgroundImage?: types.IImageSource
  padding: 'sm' | 'md' | 'lg'
  subtitleColor: { color: string }
  showBadges: boolean
  showFeatures: boolean
}

const WelcomingSection: types.Brick<WelcomingSectionProps> = ({ 
  title,
  subtitle,
  ctaTitle,
  ctaDescription,
  badges,
  features,
  showCarousel = true,
  showAuthGreeting = true,
  backgroundColor = 'gradient',
  titleSize = 'large',
  backgroundImage,
  padding = 'md',
  subtitleColor = { color: '#d1d5db' },
  showBadges = true,
  showFeatures = true,
}) => {
  const { user, profile } = useAuth();
  const username = profile?.full_name || user?.email?.split('@')[0] || '';

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
      case 'large': return 'text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl'
      case 'xl': return 'text-fluid-4xl xs:text-fluid-5xl sm:text-fluid-6xl lg:text-fluid-7xl'
      default: return 'text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl'
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

  // Get dynamic title with auth greeting
  const getDisplayTitle = () => {
    if (showAuthGreeting && username) {
      return `Welcome Back, ${username}!`
    }
    return typeof title === 'string' ? title : 'Welcome to Little Latte Lane'
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
                className={`${getTitleSizeClass()} font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent`}
              >
                {showAuthGreeting && username ? getDisplayTitle() : props.children}
              </h1>
            )}
            placeholder="Welcome to Little Latte Lane"
          />
          
          <Text
            propName="subtitle"
            value={subtitle}
            renderBlock={(props) => (
              <p 
                className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl mb-4 xs:mb-6 max-w-4xl mx-auto"
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
  name: 'welcoming-section',
  label: 'Welcoming Section',
  category: 'Little Latte Lane',
  
  // Defaults
  getDefaultProps: () => ({
    title: 'Welcome to Little Latte Lane',
    subtitle: 'Café & Deli - Where Great Food Meets Amazing Experiences',
    ctaTitle: 'Ready to Experience Little Latte Lane?',
    ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
    showCarousel: true,
    showAuthGreeting: true,
    backgroundColor: 'gradient',
    titleSize: 'large',
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
  ],
}

export default WelcomingSection
export { FeatureItem, BadgeItem }