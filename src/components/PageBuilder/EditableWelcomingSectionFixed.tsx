'use client';

import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { useAuth } from '@/components/AuthProvider';
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

// Simple Editable Text Component that actually works
const EditableText: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
  tag?: 'h1' | 'h2' | 'p' | 'div' | 'span';
  placeholder?: string;
}> = ({ value, onChange, className = '', tag = 'div', placeholder = 'Click to edit...' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value); // Reset to original
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} bg-transparent border-2 border-neonCyan rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-neonCyan/50`}
        autoFocus
        placeholder={placeholder}
      />
    );
  }

  const commonProps = {
    onClick: handleClick,
    className: `${className} cursor-pointer hover:ring-2 hover:ring-neonCyan/50 hover:ring-offset-2 hover:ring-offset-gray-900 transition-all duration-200 rounded-md px-2 py-1 relative group`,
    children: (
      <>
        {localValue || placeholder}
        <div className="absolute -top-8 left-0 bg-neonCyan text-black text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          Click to edit
        </div>
      </>
    )
  };

  switch (tag) {
    case 'h1':
      return <h1 {...commonProps} />;
    case 'h2':
      return <h2 {...commonProps} />;
    case 'p':
      return <p {...commonProps} />;
    case 'span':
      return <span {...commonProps} />;
    default:
      return <div {...commonProps} />;
  }
};

export const EditableWelcomingSection: React.FC<EditableWelcomingSectionProps> = ({
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
    connectors: { connect },
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
        if (ref) connect(ref as HTMLElement);
      }}
      className={`bg-gradient-to-br ${backgroundColor} section-padding overflow-hidden ${
        selected ? 'ring-4 ring-orange-500/60' : ''
      } transition-all duration-200 relative`}
    >
      <div className="container-wide animate-fade-in">
        {/* Hero Header - Fully Responsive */}
        <div className="text-center section-padding-sm">
          <EditableText
            value={displayHeading}
            onChange={(value) => setProp((props: EditableWelcomingSectionProps) => {
              props.mainHeading = value;
            })}
            tag="h1"
            className="text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent"
            placeholder="Enter main heading..."
          />
          
          <EditableText
            value={heroSubheading}
            onChange={(value) => setProp((props: EditableWelcomingSectionProps) => {
              props.heroSubheading = value;
            })}
            tag="p"
            className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl text-gray-300 mb-4 xs:mb-6 max-w-4xl mx-auto"
            placeholder="Enter hero description..."
          />
          
          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-8 xs:mb-12">
            <Badge className="bg-neonCyan text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
              <EditableText
                value={nowOpenBadge}
                onChange={(value) => setProp((props: EditableWelcomingSectionProps) => {
                  props.nowOpenBadge = value;
                })}
                className="bg-transparent text-inherit"
                placeholder="Status badge..."
              />
            </Badge>
            <Badge className="bg-neonPink text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
              <EditableText
                value={serviceOptionsBadge}
                onChange={(value) => setProp((props: EditableWelcomingSectionProps) => {
                  props.serviceOptionsBadge = value;
                })}
                className="bg-transparent text-inherit"
                placeholder="Service options..."
              />
            </Badge>
          </div>
        </div>

        {/* Dynamic Carousel */}
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
          <EditableText
            value={ctaHeading}
            onChange={(value) => setProp((props: EditableWelcomingSectionProps) => {
              props.ctaHeading = value;
            })}
            tag="h2"
            className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4"
            placeholder="Enter CTA heading..."
          />
          
          <EditableText
            value={ctaDescription}
            onChange={(value) => setProp((props: EditableWelcomingSectionProps) => {
              props.ctaDescription = value;
            })}
            tag="p"
            className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto"
            placeholder="Enter CTA description..."
          />
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="flex items-center justify-center gap-2 text-neonCyan">
              <Star className="h-5 w-5" />
              <EditableText
                value={qualityFeatureText}
                onChange={(value) => setProp((props: EditableWelcomingSectionProps) => {
                  props.qualityFeatureText = value;
                })}
                className="text-sm font-medium"
                placeholder="Feature 1..."
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-neonPink">
              <MapPin className="h-5 w-5" />
              <EditableText
                value={locationFeatureText}
                onChange={(value) => setProp((props: EditableWelcomingSectionProps) => {
                  props.locationFeatureText = value;
                })}
                className="text-sm font-medium"
                placeholder="Feature 2..."
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Car className="h-5 w-5" />
              <EditableText
                value={parkingFeatureText}
                onChange={(value) => setProp((props: EditableWelcomingSectionProps) => {
                  props.parkingFeatureText = value;
                })}
                className="text-sm font-medium"
                placeholder="Feature 3..."
              />
            </div>
          </div>
        </div>
      </div>
      
      {selected && (
        <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-3 py-2 rounded-md z-10 font-medium">
          🎯 Editing: Welcome Section • Click any text to edit
        </div>
      )}
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

      <div className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-md">
        💡 <strong>How to edit:</strong> Click any text element directly to start editing. Press Enter to save, Escape to cancel.
      </div>
    </div>
  );
};

// Export the component
export default EditableWelcomingSection;
