'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Car } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export interface HeroSectionProps {
  mainHeading?: string;
  subheading?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  nowOpenBadge?: string;
  serviceOptionsBadge?: string;
  qualityFeature?: string;
  locationFeature?: string;
  parkingFeature?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor1?: string;
  accentColor2?: string;
}

export const EditableHeroSection: React.FC<HeroSectionProps> & { 
  craft?: {
    props: HeroSectionProps;
    related: {
      settings: React.ComponentType;
    };
  }
} = ({
  mainHeading = 'Welcome to Little Latte Lane',
  subheading = 'Café & Deli - Where Great Food Meets Amazing Experiences',
  ctaHeading = 'Ready to Experience Little Latte Lane?',
  ctaDescription = 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere. Whether you\'re catching up with friends, having a business meeting, or enjoying a quiet moment, we\'re here to make your experience memorable.',
  nowOpenBadge = 'Now Open',
  serviceOptionsBadge = 'Dine In • Takeaway • Delivery',
  qualityFeature = 'Exceptional Quality',
  locationFeature = 'Prime Location',
  parkingFeature = 'Easy Parking',
  backgroundColor = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
  textColor = '#ffffff',
  accentColor1 = '#00FFFF',
  accentColor2 = '#FF00FF'
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected,
    dragged: state.events.dragged,
  }));

  const { user, profile } = useAuth();
  const username = profile?.full_name || user?.email?.split('@')[0] || '';

  return (
    <section
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`section-padding overflow-hidden ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ 
        background: backgroundColor,
        color: textColor
      }}
    >
      <div className="container-wide animate-fade-in">
        {/* Hero Header - Fully Responsive */}
        <div className="text-center section-padding-sm">
          <ContentEditable
            html={username ? `Welcome Back, ${username}!` : mainHeading}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.mainHeading = e.target.value))}
            tagName="h1"
            className="text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent outline-none"
            style={{
              background: `linear-gradient(45deg, ${accentColor1}, ${accentColor2})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          />
          
          <ContentEditable
            html={subheading}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.subheading = e.target.value))}
            tagName="p"
            className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl text-gray-300 mb-4 xs:mb-6 max-w-4xl mx-auto outline-none"
          />
          
          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-8 xs:mb-12">
            <Badge 
              className="px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium text-black"
              style={{ backgroundColor: accentColor1 }}
            >
              <ContentEditable
                html={nowOpenBadge}
                onChange={(e) => setProp((props: HeroSectionProps) => (props.nowOpenBadge = e.target.value))}
                className="outline-none"
              />
            </Badge>
            <Badge 
              className="px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium text-black"
              style={{ backgroundColor: accentColor2 }}
            >
              <ContentEditable
                html={serviceOptionsBadge}
                onChange={(e) => setProp((props: HeroSectionProps) => (props.serviceOptionsBadge = e.target.value))}
                className="outline-none"
              />
            </Badge>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center">
          <ContentEditable
            html={ctaHeading}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.ctaHeading = e.target.value))}
            tagName="h2"
            className="text-3xl font-bold mb-4 outline-none"
            style={{
              background: `linear-gradient(45deg, ${accentColor1}, ${accentColor2})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          />
          
          <ContentEditable
            html={ctaDescription}
            onChange={(e) => setProp((props: HeroSectionProps) => (props.ctaDescription = e.target.value))}
            tagName="p"
            className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto outline-none"
          />
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="flex items-center justify-center gap-2" style={{ color: accentColor1 }}>
              <Star className="h-5 w-5" />
              <ContentEditable
                html={qualityFeature}
                onChange={(e) => setProp((props: HeroSectionProps) => (props.qualityFeature = e.target.value))}
                className="text-sm font-medium outline-none"
              />
            </div>
            <div className="flex items-center justify-center gap-2" style={{ color: accentColor2 }}>
              <MapPin className="h-5 w-5" />
              <ContentEditable
                html={locationFeature}
                onChange={(e) => setProp((props: HeroSectionProps) => (props.locationFeature = e.target.value))}
                className="text-sm font-medium outline-none"
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Car className="h-5 w-5" />
              <ContentEditable
                html={parkingFeature}
                onChange={(e) => setProp((props: HeroSectionProps) => (props.parkingFeature = e.target.value))}
                className="text-sm font-medium outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Settings panel for the hero section
export const HeroSectionSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Hero Section Settings</h3>
      
      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Background</label>
        <input
          type="color"
          value={props.backgroundColor?.includes('linear-gradient') ? '#1a1a1a' : props.backgroundColor}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
      
      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <input
          type="color"
          value={props.textColor}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.textColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
      
      {/* Accent Colors */}
      <div>
        <label className="block text-sm font-medium mb-2">Accent Color 1 (Cyan)</label>
        <input
          type="color"
          value={props.accentColor1}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.accentColor1 = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Accent Color 2 (Pink)</label>
        <input
          type="color"
          value={props.accentColor2}
          onChange={(e) => setProp((props: HeroSectionProps) => (props.accentColor2 = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
    </div>
  );
};

// Craft.js configuration
EditableHeroSection.craft = {
  props: {
    mainHeading: 'Welcome to Little Latte Lane',
    subheading: 'Café & Deli - Where Great Food Meets Amazing Experiences',
    backgroundColor: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    textColor: '#ffffff',
    accentColor1: '#00FFFF',
    accentColor2: '#FF00FF'
  },
  related: {
    settings: HeroSectionSettings,
  },
};
