import React from 'react'
import { Text, RichText, Image, types } from 'react-bricks/frontend'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Car } from 'lucide-react'

//========================================
// Local Types
//========================================
export interface HeroBrickProps {
  title: types.TextValue
  subtitle: types.TextValue
  ctaTitle: types.TextValue
  ctaDescription: types.TextValue
  heroImage: types.IImageSource
  badgeText1: types.TextValue
  badgeText2: types.TextValue
  featureText1: types.TextValue
  featureText2: types.TextValue
  featureText3: types.TextValue
  showImage: boolean
  imagePosition: 'top' | 'center' | 'bottom'
  titleColor: 'gradient' | 'cyan' | 'pink' | 'white'
}

//========================================
// Component to be rendered
//========================================
const HeroBrick: types.Brick<HeroBrickProps> = ({ 
  title,
  subtitle,
  ctaTitle,
  ctaDescription,
  heroImage,
  badgeText1,
  badgeText2,
  featureText1,
  featureText2,
  featureText3,
  showImage,
  imagePosition,
  titleColor
}) => {
  // Get title color class
  const getTitleColorClass = () => {
    switch (titleColor) {
      case 'gradient': return 'bg-neon-gradient bg-clip-text text-transparent'
      case 'cyan': return 'text-neonCyan'
      case 'pink': return 'text-neonPink'
      case 'white': return 'text-white'
      default: return 'bg-neon-gradient bg-clip-text text-transparent'
    }
  }

  // Get image wrapper classes
  const getImageWrapperClass = () => {
    const base = "mb-8 xs:mb-12"
    switch (imagePosition) {
      case 'top': return `${base} order-first`
      case 'center': return `${base} order-2`
      case 'bottom': return `${base} order-last`
      default: return `${base} order-2`
    }
  }

  return (
    <section className="bg-gradient-to-br from-darkBg via-gray-900 to-darkBg section-padding overflow-hidden">
      <div className="container-wide animate-fade-in">
        <div className="flex flex-col items-center">
          {/* Hero Header */}
          <div className="text-center section-padding-sm order-1">
            <Text
              propName="title"
              value={title}
              renderBlock={(props) => (
                <h1 
                  className={`text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl font-bold mb-4 xs:mb-6 ${getTitleColorClass()}`}
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
            
            {/* Editable Badges */}
            <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-8 xs:mb-12">
              <Badge className="bg-neonCyan text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
                <Text
                  propName="badgeText1"
                  value={badgeText1}
                  renderBlock={(props) => <span>{props.children}</span>}
                  placeholder="Now Open"
                />
              </Badge>
              <Badge className="bg-neonPink text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
                <Text
                  propName="badgeText2"
                  value={badgeText2}
                  renderBlock={(props) => <span>{props.children}</span>}
                  placeholder="Dine In • Takeaway • Delivery"
                />
              </Badge>
            </div>
          </div>

          {/* FIXED: Proper Image Component with conditions */}
          {showImage && (
            <div className={getImageWrapperClass()}>
              <Image
                propName="heroImage"
                source={heroImage}
                alt="Little Latte Lane Experience"
                maxWidth={1200}
                aspectRatio={16/9}
                imageClassName="w-full h-auto rounded-lg shadow-2xl"
                renderWrapper={({ children }) => (
                  <div className="relative max-w-4xl mx-auto">
                    {children}
                  </div>
                )}
              />
            </div>
          )}

          {/* Call to Action Section */}
          <div className="text-center order-3">
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
            
            {/* Features */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <div className="flex items-center justify-center gap-2 text-neonCyan">
                <Star className="h-5 w-5" />
                <Text
                  propName="featureText1"
                  value={featureText1}
                  renderBlock={(props) => (
                    <span className="text-sm font-medium">
                      {props.children}
                    </span>
                  )}
                  placeholder="Exceptional Quality"
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-neonPink">
                <MapPin className="h-5 w-5" />
                <Text
                  propName="featureText2"
                  value={featureText2}
                  renderBlock={(props) => (
                    <span className="text-sm font-medium">
                      {props.children}
                    </span>
                  )}
                  placeholder="Prime Location"
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Car className="h-5 w-5" />
                <Text
                  propName="featureText3"
                  value={featureText3}
                  renderBlock={(props) => (
                    <span className="text-sm font-medium">
                      {props.children}
                    </span>
                  )}
                  placeholder="Easy Parking"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

//========================================
// Brick Schema
//========================================
HeroBrick.schema = {
  name: 'hero-brick',
  label: 'Hero Section',
  category: 'Little Latte Lane',
  
  // Defaults
  getDefaultProps: () => ({
    title: 'Welcome to Little Latte Lane',
    subtitle: 'Café & Deli - Where Great Food Meets Amazing Experiences',
    ctaTitle: 'Ready to Experience Little Latte Lane?',
    ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
    badgeText1: 'Now Open',
    badgeText2: 'Dine In • Takeaway • Delivery',
    featureText1: 'Exceptional Quality',
    featureText2: 'Prime Location',
    featureText3: 'Easy Parking'
  }),

  // Sidebar controls
  sideEditProps: [
    {
      groupName: 'Hero Image',
      props: [
        {
          name: 'image',
          label: 'Background Image',
          type: types.SideEditPropType.Image,
          imageOptions: {
            maxWidth: 2000,
            quality: 85,
          },
        },
        {
          name: 'imagePosition',
          label: 'Image Position',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'center', label: 'Center' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
            ],
          },
        },
        {
          name: 'showOverlay',
          label: 'Show Dark Overlay',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
    {
      groupName: 'Text Styling',
      props: [
        {
          name: 'titleColor',
          label: 'Title Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Color,
            options: [
              { value: 'white', label: 'White' },
              { value: 'neonPink', label: 'Neon Pink' },
              { value: 'neonCyan', label: 'Neon Cyan' },
              { value: 'yellow-400', label: 'Yellow' },
            ],
          },
        },
      ],
    },
  ],
}

export default HeroBrick
