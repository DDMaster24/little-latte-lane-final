'use client';

import { Text, types } from 'react-bricks'
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Car } from 'lucide-react';
import DynamicCarousel from '@/components/DynamicCarousel';

//=============================
// Local Types
//=============================
interface WelcomingSectionProps {
  mainHeading: string
  heroSubheading: string
  nowOpenBadge: string
  serviceOptionsBadge: string
  ctaHeading: string
  ctaDescription: string
  qualityFeatureText: string
  locationFeatureText: string
  parkingFeatureText: string
  // Color customization props
  mainHeadingColor: string
  subheadingColor: string
  badgeColor: string
  ctaHeadingColor: string
}

//=============================
// Component to be rendered
//=============================
const WelcomingSection: types.Brick<WelcomingSectionProps> = ({
  mainHeading,
  heroSubheading,
  nowOpenBadge,
  serviceOptionsBadge,
  ctaHeading,
  ctaDescription,
  qualityFeatureText,
  locationFeatureText,
  parkingFeatureText,
  mainHeadingColor = 'bg-neon-gradient',
  subheadingColor = 'text-gray-300',
  badgeColor = 'bg-neonCyan',
  ctaHeadingColor = 'bg-neon-gradient',
}) => {

  return (
    <section className="bg-gradient-to-br from-darkBg via-gray-900 to-darkBg section-padding overflow-hidden">
      <div className="container-wide animate-fade-in">
        {/* Hero Header - Fully Responsive */}
        <div className="text-center section-padding-sm">
          <Text
            propName="mainHeading"
            value={mainHeading}
            renderBlock={(props) => (
              <h1 className={`text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl font-bold mb-4 xs:mb-6 ${mainHeadingColor} bg-clip-text text-transparent`}>
                {props.children}
              </h1>
            )}
            placeholder="Welcome to Little Latte Lane"
          />
          
          <Text
            propName="heroSubheading"
            value={heroSubheading}
            renderBlock={(props) => (
              <p className={`text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl ${subheadingColor} mb-4 xs:mb-6 max-w-4xl mx-auto`}>
                {props.children}
              </p>
            )}
            placeholder="Café & Deli - Where Great Food Meets Amazing Experiences"
          />
          
          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-8 xs:mb-12">
            <Text
              propName="nowOpenBadge"
              value={nowOpenBadge}
              renderBlock={(props) => (
                <Badge className={`${badgeColor} text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium`}>
                  {props.children}
                </Badge>
              )}
              placeholder="Now Open"
            />
            
            <Text
              propName="serviceOptionsBadge"
              value={serviceOptionsBadge}
              renderBlock={(props) => (
                <Badge className="bg-neonPink text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
                  {props.children}
                </Badge>
              )}
              placeholder="Dine In • Takeaway • Delivery"
            />
          </div>
        </div>

        {/* Dynamic Carousel */}
        <div className="mb-16">
          <DynamicCarousel />
        </div>

        {/* Call to Action Section */}
        <div className="text-center">
            <Text
              propName="ctaHeading"
              value={ctaHeading}
              renderBlock={(props) => (
                <h2 className={`text-3xl font-bold ${ctaHeadingColor} bg-clip-text text-transparent mb-4`}>
                  {props.children}
                </h2>
              )}
              placeholder="Ready to Experience Little Latte Lane?"
            />          <Text
            propName="ctaDescription"
            value={ctaDescription}
            renderBlock={(props) => (
              <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                {props.children}
              </p>
            )}
            placeholder="Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere."
          />
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="flex items-center justify-center gap-2 text-neonCyan">
              <Star className="h-5 w-5" />
              <Text
                propName="qualityFeatureText"
                value={qualityFeatureText}
                renderBlock={(props) => (
                  <span className="text-sm font-medium">{props.children}</span>
                )}
                placeholder="Exceptional Quality"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-neonPink">
              <MapPin className="h-5 w-5" />
              <Text
                propName="locationFeatureText"
                value={locationFeatureText}
                renderBlock={(props) => (
                  <span className="text-sm font-medium">{props.children}</span>
                )}
                placeholder="Prime Location"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Car className="h-5 w-5" />
              <Text
                propName="parkingFeatureText"
                value={parkingFeatureText}
                renderBlock={(props) => (
                  <span className="text-sm font-medium">{props.children}</span>
                )}
                placeholder="Easy Parking"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

//=============================
// Brick SCHEMA
//=============================
WelcomingSection.schema = {
  name: 'welcoming-section',
  label: 'Welcoming Section',
  category: 'layout',
  tags: ['hero', 'welcome', 'section'],
  
  // Default props when brick is added
  getDefaultProps: () => ({
    mainHeading: 'Welcome to Little Latte Lane',
    heroSubheading: 'Café & Deli - Where Great Food Meets Amazing Experiences',
    nowOpenBadge: 'Now Open',
    serviceOptionsBadge: 'Dine In • Takeaway • Delivery',
    ctaHeading: 'Ready to Experience Little Latte Lane?',
    ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere.',
    qualityFeatureText: 'Exceptional Quality',
    locationFeatureText: 'Prime Location',
    parkingFeatureText: 'Easy Parking',
  }),

  // Sidebar controls for editing
  sideEditProps: [
    // Text Content Controls
    {
      name: 'mainHeading',
      label: 'Main Heading Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'mainHeadingColor',
      label: 'Main Heading Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'bg-neon-gradient', label: 'Neon Gradient (Default)' },
          { value: 'text-neonCyan', label: 'Neon Cyan' },
          { value: 'text-neonPink', label: 'Neon Pink' },
          { value: 'text-white', label: 'White' },
          { value: 'text-yellow-400', label: 'Yellow' },
          { value: 'text-green-400', label: 'Green' },
          { value: 'text-blue-400', label: 'Blue' },
          { value: 'text-red-400', label: 'Red' },
        ],
      },
    },
    {
      name: 'heroSubheading', 
      label: 'Hero Subheading Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'subheadingColor',
      label: 'Subheading Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-gray-300', label: 'Gray (Default)' },
          { value: 'text-white', label: 'White' },
          { value: 'text-neonCyan', label: 'Neon Cyan' },
          { value: 'text-neonPink', label: 'Neon Pink' },
          { value: 'text-yellow-400', label: 'Yellow' },
          { value: 'text-green-400', label: 'Green' },
        ],
      },
    },
    // Badge Controls
    {
      name: 'nowOpenBadge',
      label: 'Status Badge Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'badgeColor',
      label: 'Badge Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'bg-neonCyan', label: 'Neon Cyan (Default)' },
          { value: 'bg-neonPink', label: 'Neon Pink' },
          { value: 'bg-yellow-400', label: 'Yellow' },
          { value: 'bg-green-400', label: 'Green' },
          { value: 'bg-blue-400', label: 'Blue' },
          { value: 'bg-red-400', label: 'Red' },
          { value: 'bg-purple-400', label: 'Purple' },
        ],
      },
    },
    {
      name: 'serviceOptionsBadge',
      label: 'Service Options Badge Text', 
      type: types.SideEditPropType.Text,
    },
    // CTA Section
    {
      name: 'ctaHeading',
      label: 'CTA Heading Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'ctaHeadingColor',
      label: 'CTA Heading Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'bg-neon-gradient', label: 'Neon Gradient (Default)' },
          { value: 'text-neonCyan', label: 'Neon Cyan' },
          { value: 'text-neonPink', label: 'Neon Pink' },
          { value: 'text-white', label: 'White' },
          { value: 'text-yellow-400', label: 'Yellow' },
        ],
      },
    },
    {
      name: 'ctaDescription',
      label: 'CTA Description',
      type: types.SideEditPropType.Textarea,
    },
    // Feature Text Controls
    {
      name: 'qualityFeatureText',
      label: 'Quality Feature Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'locationFeatureText',
      label: 'Location Feature Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'parkingFeatureText',
      label: 'Parking Feature Text',
      type: types.SideEditPropType.Text,
    },
  ],
};

export default WelcomingSection;
