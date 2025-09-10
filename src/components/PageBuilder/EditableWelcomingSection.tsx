'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { useAuth } from '@/components/AuthProvider';
import ContentEditable from 'react-contenteditable';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Car } from 'lucide-react';
import DynamicCarousel from '@/components/DynamicCarousel';

export interface EditableWelcomingSectionProps {
  mainHeading?: string;
  heroSubheading?: string;
  nowOpenBadge?: string;
  serviceOptionsBadge?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  qualityFeatureText?: string;
  locationFeatureText?: string;
  parkingFeatureText?: string;
  backgroundColor?: string;
}

export const EditableWelcomingSection: React.FC<EditableWelcomingSectionProps> & { 
  craft?: { 
    props: EditableWelcomingSectionProps; 
    related: { settings: React.ComponentType };
  } 
} = ({
  mainHeading = 'Welcome to Little Latte Lane',
  heroSubheading = 'Café & Deli - Where Great Food Meets Amazing Experiences',
  nowOpenBadge = 'Now Open',
  serviceOptionsBadge = 'Dine In • Takeaway • Delivery',
  ctaHeading = 'Ready to Experience Little Latte Lane?',
  ctaDescription = 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
  qualityFeatureText = 'Exceptional Quality',
  locationFeatureText = 'Prime Location',
  parkingFeatureText = 'Easy Parking',
  backgroundColor = 'from-darkBg via-gray-900 to-darkBg'
}) => {
  const { user, profile } = useAuth();
  const username = profile?.full_name || user?.email?.split('@')[0] || '';
  
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Use username if available, otherwise use the editable text
  const displayHeading = username 
    ? `Welcome Back, ${username}!` 
    : mainHeading;

  return (
    <section 
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`bg-gradient-to-br ${backgroundColor} section-padding overflow-hidden ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="container-wide animate-fade-in">
        {/* Hero Header - Fully Responsive */}
        <div className="text-center section-padding-sm">
          <ContentEditable
            html={displayHeading}
            onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.mainHeading = e.target.value))}
            tagName="h1"
            className="text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent outline-none"
          />
          
          <ContentEditable
            html={heroSubheading}
            onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.heroSubheading = e.target.value))}
            tagName="p"
            className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl text-gray-300 mb-4 xs:mb-6 max-w-4xl mx-auto outline-none"
          />
          
          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-8 xs:mb-12">
            <Badge className="bg-neonCyan text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
              <ContentEditable
                html={nowOpenBadge}
                onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.nowOpenBadge = e.target.value))}
                className="outline-none"
              />
            </Badge>
            <Badge className="bg-neonPink text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
              <ContentEditable
                html={serviceOptionsBadge}
                onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.serviceOptionsBadge = e.target.value))}
                className="outline-none"
              />
            </Badge>
          </div>
        </div>

        {/* Dynamic Carousel - Keep as is, it's already managed separately */}
        <div className="mb-16">
          <DynamicCarousel />
          {selected && (
            <div className="text-center mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-blue-400 text-sm">
                💡 Carousel content can be edited in Admin → Carousel Editor
              </p>
            </div>
          )}
        </div>

        {/* Call to Action Section */}
        <div className="text-center">
          <ContentEditable
            html={ctaHeading}
            onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.ctaHeading = e.target.value))}
            tagName="h2"
            className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4 outline-none"
          />
          
          <ContentEditable
            html={ctaDescription}
            onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.ctaDescription = e.target.value))}
            tagName="p"
            className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto outline-none"
          />
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="flex items-center justify-center gap-2 text-neonCyan">
              <Star className="h-5 w-5" />
              <ContentEditable
                html={qualityFeatureText}
                onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.qualityFeatureText = e.target.value))}
                className="text-sm font-medium outline-none"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-neonPink">
              <MapPin className="h-5 w-5" />
              <ContentEditable
                html={locationFeatureText}
                onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.locationFeatureText = e.target.value))}
                className="text-sm font-medium outline-none"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Car className="h-5 w-5" />
              <ContentEditable
                html={parkingFeatureText}
                onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.parkingFeatureText = e.target.value))}
                className="text-sm font-medium outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Settings Panel for Welcoming Section
export const EditableWelcomingSectionSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Welcoming Section Settings</h3>
      
      {/* Background Gradient */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Style</label>
        <select
          value={props.backgroundColor}
          onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.backgroundColor = e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        >
          <option value="from-darkBg via-gray-900 to-darkBg">Dark Theme (Default)</option>
          <option value="from-blue-900 via-purple-900 to-blue-900">Blue Purple</option>
          <option value="from-green-900 via-teal-900 to-green-900">Green Teal</option>
          <option value="from-red-900 via-pink-900 to-red-900">Red Pink</option>
          <option value="from-yellow-900 via-orange-900 to-yellow-900">Warm Sunset</option>
        </select>
      </div>

      {/* Badge Text Settings */}
      <div>
        <label className="block text-sm font-medium mb-2">Status Badge</label>
        <input
          type="text"
          value={props.nowOpenBadge}
          onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.nowOpenBadge = e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Service Options Badge</label>
        <input
          type="text"
          value={props.serviceOptionsBadge}
          onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.serviceOptionsBadge = e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        />
      </div>

      {/* Feature Texts */}
      <div>
        <label className="block text-sm font-medium mb-2">Quality Feature Text</label>
        <input
          type="text"
          value={props.qualityFeatureText}
          onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.qualityFeatureText = e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location Feature Text</label>
        <input
          type="text"
          value={props.locationFeatureText}
          onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.locationFeatureText = e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Parking Feature Text</label>
        <input
          type="text"
          value={props.parkingFeatureText}
          onChange={(e) => setProp((props: EditableWelcomingSectionProps) => (props.parkingFeatureText = e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        />
      </div>
    </div>
  );
};

EditableWelcomingSection.craft = {
  props: {
    mainHeading: 'Welcome to Little Latte Lane',
    heroSubheading: 'Café & Deli - Where Great Food Meets Amazing Experiences',
    nowOpenBadge: 'Now Open',
    serviceOptionsBadge: 'Dine In • Takeaway • Delivery',
    ctaHeading: 'Ready to Experience Little Latte Lane?',
    ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
    qualityFeatureText: 'Exceptional Quality',
    locationFeatureText: 'Prime Location',
    parkingFeatureText: 'Easy Parking',
    backgroundColor: 'from-darkBg via-gray-900 to-darkBg'
  },
  related: {
    settings: EditableWelcomingSectionSettings,
  },
};
