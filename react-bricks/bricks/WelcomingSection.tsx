import React from 'react'
import { Text, RichText, Repeater, types } from 'react-bricks/rsc'
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
      label: 'Feature Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Color,
        options: [
          { value: 'cyan', label: 'Cyan', color: '#06D6A0' },
          { value: 'pink', label: 'Pink', color: '#EF476F' },
          { value: 'yellow', label: 'Yellow', color: '#FFD166' },
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
  const getBgClass = () => {
    switch (bgColor) {
      case 'cyan': return 'bg-neonCyan text-black'
      case 'pink': return 'bg-neonPink text-black'
      case 'yellow': return 'bg-yellow-400 text-black'
      default: return 'bg-neonCyan text-black'
    }
  }

  return (
    <Badge className={`${getBgClass()} px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium`}>
      <Text
        propName="text"
        value={text}
        renderBlock={(props) => <span>{props.children}</span>}
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
          { value: 'cyan', label: 'Cyan', color: '#06D6A0' },
          { value: 'pink', label: 'Pink', color: '#EF476F' },
          { value: 'yellow', label: 'Yellow', color: '#FFD166' },
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
}

const WelcomingSection: types.Brick<WelcomingSectionProps> = ({ 
  title,
  subtitle,
  ctaTitle,
  ctaDescription,
  badges,
  features,
  backgroundColor,
  titleSize
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
      case 'normal': return 'text-fluid-2xl xs:text-fluid-3xl sm:text-fluid-4xl lg:text-fluid-5xl'
      case 'large': return 'text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl'
      case 'xl': return 'text-fluid-4xl xs:text-fluid-5xl sm:text-fluid-6xl lg:text-fluid-7xl'
      default: return 'text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl'
    }
  }

  return (
    <section className={`${getBgClass()} section-padding overflow-hidden`}>
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
                className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl text-gray-300 mb-4 xs:mb-6 max-w-4xl mx-auto"
              >
                {props.children}
              </p>
            )}
            placeholder="Café & Deli - Where Great Food Meets Amazing Experiences"
          />
          
          {/* FIXED: Proper Repeater with renderWrapper */}
          <div className="mb-8 xs:mb-12">
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
        </div>

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
          
          <RichText
            propName="ctaDescription"
            value={ctaDescription}
            renderBlock={(props) => (
              <p 
                className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto"
              >
                {props.children}
              </p>
            )}
            placeholder="Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere..."
            allowedFeatures={[
              types.RichTextFeatures.Bold,
              types.RichTextFeatures.Italic,
            ]}
          />
          
          {/* FIXED: Proper Repeater with renderWrapper */}
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
      </div>
    </section>
  )
}

//========================================
// Brick Schema with Advanced Controls
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
    titleSize: 'large',
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

  // OFFICIAL DOCS PATTERN: Repeater settings
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

  // ADVANCED: Collapsible sidebar groups (from docs)
  sideEditProps: [
    {
      groupName: 'Design Settings',
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
          name: 'titleSize',
          label: 'Title Size',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'large', label: 'Large' },
              { value: 'xl', label: 'Extra Large' },
            ],
          },
        },
      ],
    },
  ],
}

export default WelcomingSection
export { FeatureItem, BadgeItem }