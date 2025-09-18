import React from 'react'
import { Text, types } from 'react-bricks/frontend'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Car } from 'lucide-react'
import DynamicCarousel from '@/components/DynamicCarousel'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Main Component: WelcomingSection - Restored Original
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
  
  // Styling Controls
  backgroundColor: string
  titleColor: { color: string }
  subtitleColor: { color: string }
  showBadges: boolean
  showCarousel: boolean
  showCTA: boolean
  showFeatures: boolean
  
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
  backgroundColor = '#0f0f0f',
  titleColor = { color: '#ffffff' },
  subtitleColor = { color: '#d1d5db' },
  showBadges = true,
  showCarousel = true,
  showCTA = true,
  showFeatures = true,
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

  return (
    <section 
      className={`bg-gradient-to-br from-darkBg via-gray-900 to-darkBg ${getPaddingClass()} overflow-hidden`}
      style={{ backgroundColor }}
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

        {/* Dynamic Carousel - The three marketing panels */}
        {showCarousel && (
          <div className="mb-16">
            <DynamicCarousel />
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
// Brick Schema - Restored Original Structure
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
    sectionPadding: 'md'
  }),

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
          label: 'Show Info Carousel',
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
