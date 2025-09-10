'use client';

import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import { useAuth } from '@/components/AuthProvider';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Car, Save, RefreshCw, AlertCircle } from 'lucide-react';
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

// Fixed Editable Text Component - NO Layout Shifting + Better Visual Feedback
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent Craft.js deselection
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

  // 🎯 FIXED: Use contentEditable overlay instead of switching elements
  const commonProps = {
    className: `${className} cursor-pointer hover:ring-2 hover:ring-neonCyan/50 hover:ring-offset-2 hover:ring-offset-gray-900 transition-all duration-200 rounded-md px-2 py-1 relative group min-h-[1.5rem] inline-block`,
    onClick: handleClick,
    children: (
      <>
        {/* Display Content */}
        <span 
          className={`${isEditing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        >
          {localValue || placeholder}
        </span>
        
        {/* Editing Input Overlay - NO Layout Shift */}
        {isEditing && (
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full bg-transparent border-2 border-neonCyan rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-neonCyan/50 text-inherit font-inherit"
            autoFocus
            placeholder={placeholder}
            style={{ fontSize: 'inherit', lineHeight: 'inherit' }}
          />
        )}
        
        {/* Hover Tooltip */}
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

export const EditableWelcomingSection: React.FC<EditableWelcomingSectionProps> = () => {
  const { user, profile } = useAuth();
  const username = profile?.full_name || user?.email?.split('@')[0] || '';
  
  // 🔥 NEW: Database-powered content management
  const {
    content,
    isLoading,
    isSaving,
    error,
    updateContent,
    hasUnsavedChanges,
    lastSaved
  } = useHomepageContent();

  const {
    connectors: { connect },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Use database content instead of props
  const currentContent = {
    mainHeading: content.mainHeading,
    heroSubheading: content.heroSubheading,
    nowOpenBadge: content.nowOpenBadge,
    serviceOptionsBadge: content.serviceOptionsBadge,
    ctaHeading: content.ctaHeading,
    ctaDescription: content.ctaDescription,
    qualityFeatureText: content.qualityFeatureText,
    locationFeatureText: content.locationFeatureText,
    parkingFeatureText: content.parkingFeatureText,
    backgroundColor: content.backgroundColor
  };

  // Use username if available, otherwise use the editable text from database
  const displayHeading = username 
    ? `Welcome Back, ${username}!` 
    : currentContent.mainHeading;

  // Show loading state
  if (isLoading) {
    return (
      <section className="bg-gradient-to-br from-darkBg via-gray-900 to-darkBg section-padding overflow-hidden">
        <div className="container-wide animate-pulse">
          <div className="text-center section-padding-sm">
            <div className="h-12 bg-gray-700 rounded-lg mb-4 max-w-2xl mx-auto"></div>
            <div className="h-6 bg-gray-700 rounded-lg mb-6 max-w-4xl mx-auto"></div>
            <div className="flex justify-center gap-3 mb-12">
              <div className="h-8 w-24 bg-gray-700 rounded"></div>
              <div className="h-8 w-32 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={(ref) => {
        if (ref) connect(ref as HTMLElement);
      }}
      className={`bg-gradient-to-br ${currentContent.backgroundColor} section-padding overflow-hidden ${
        selected ? 'ring-4 ring-orange-500/60' : ''
      } transition-all duration-200 relative`}
    >
      <div className="container-wide animate-fade-in">
        {/* Hero Header - Fully Responsive */}
        <div className="text-center section-padding-sm">
          <EditableText
            value={displayHeading}
            onChange={(value) => {
              // Don't save personalized welcome messages
              if (!username) {
                updateContent('mainHeading', value);
              }
              // Also update Craft.js props for compatibility
              setProp((props: EditableWelcomingSectionProps) => {
                props.mainHeading = value;
              });
            }}
            tag="h1"
            className="text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent"
            placeholder="Enter main heading..."
          />
          
          <EditableText
            value={currentContent.heroSubheading}
            onChange={(value) => {
              updateContent('heroSubheading', value);
              setProp((props: EditableWelcomingSectionProps) => {
                props.heroSubheading = value;
              });
            }}
            tag="p"
            className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl text-gray-300 mb-4 xs:mb-6 max-w-4xl mx-auto"
            placeholder="Enter hero description..."
          />
          
          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-8 xs:mb-12">
            <Badge className="bg-neonCyan text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
              <EditableText
                value={currentContent.nowOpenBadge}
                onChange={(value) => {
                  updateContent('nowOpenBadge', value);
                  setProp((props: EditableWelcomingSectionProps) => {
                    props.nowOpenBadge = value;
                  });
                }}
                className="bg-transparent text-inherit"
                placeholder="Status badge..."
              />
            </Badge>
            <Badge className="bg-neonPink text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium">
              <EditableText
                value={currentContent.serviceOptionsBadge}
                onChange={(value) => {
                  updateContent('serviceOptionsBadge', value);
                  setProp((props: EditableWelcomingSectionProps) => {
                    props.serviceOptionsBadge = value;
                  });
                }}
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
            value={currentContent.ctaHeading}
            onChange={(value) => {
              updateContent('ctaHeading', value);
              setProp((props: EditableWelcomingSectionProps) => {
                props.ctaHeading = value;
              });
            }}
            tag="h2"
            className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4"
            placeholder="Enter CTA heading..."
          />
          
          <EditableText
            value={currentContent.ctaDescription}
            onChange={(value) => {
              updateContent('ctaDescription', value);
              setProp((props: EditableWelcomingSectionProps) => {
                props.ctaDescription = value;
              });
            }}
            tag="p"
            className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto"
            placeholder="Enter CTA description..."
          />
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="flex items-center justify-center gap-2 text-neonCyan">
              <Star className="h-5 w-5" />
              <EditableText
                value={currentContent.qualityFeatureText}
                onChange={(value) => {
                  updateContent('qualityFeatureText', value);
                  setProp((props: EditableWelcomingSectionProps) => {
                    props.qualityFeatureText = value;
                  });
                }}
                className="text-sm font-medium"
                placeholder="Feature 1..."
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-neonPink">
              <MapPin className="h-5 w-5" />
              <EditableText
                value={currentContent.locationFeatureText}
                onChange={(value) => {
                  updateContent('locationFeatureText', value);
                  setProp((props: EditableWelcomingSectionProps) => {
                    props.locationFeatureText = value;
                  });
                }}
                className="text-sm font-medium"
                placeholder="Feature 2..."
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Car className="h-5 w-5" />
              <EditableText
                value={currentContent.parkingFeatureText}
                onChange={(value) => {
                  updateContent('parkingFeatureText', value);
                  setProp((props: EditableWelcomingSectionProps) => {
                    props.parkingFeatureText = value;
                  });
                }}
                className="text-sm font-medium"
                placeholder="Feature 3..."
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Editor Status Display */}
      {selected && (
        <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-3 py-2 rounded-md z-10 font-medium">
          🎯 Editing: Welcome Section • Click any text to edit
          {isSaving && (
            <div className="flex items-center gap-1 mt-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1 mt-1 text-red-200">
              <AlertCircle className="h-3 w-3" />
              <span>Save failed</span>
            </div>
          )}
          {!isSaving && !error && lastSaved && (
            <div className="flex items-center gap-1 mt-1 text-green-200">
              <Save className="h-3 w-3" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs px-3 py-2 rounded-md z-10 font-medium">
          ⚠️ Unsaved Changes
        </div>
      )}
    </section>
  );
};

// Settings Panel for Welcoming Section
export const EditableWelcomingSectionSettings = () => {
  const {
    actions: { setProp }
  } = useNode();

  // Database-powered content hook
  const {
    content,
    isSaving,
    error,
    saveContent,
    resetContent,
    hasUnsavedChanges,
    lastSaved
  } = useHomepageContent();

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Welcoming Section Settings</h3>
      
      {/* Database Status */}
      <div className="bg-gray-900/50 p-3 rounded-md border border-gray-700">
        <h4 className="text-sm font-medium mb-2 text-neonCyan">Database Status</h4>
        <div className="space-y-2 text-xs">
          {isSaving && (
            <div className="flex items-center gap-2 text-yellow-400">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Saving changes...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>Error: {error}</span>
            </div>
          )}
          {lastSaved && !isSaving && !error && (
            <div className="flex items-center gap-2 text-green-400">
              <Save className="h-3 w-3" />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          {hasUnsavedChanges && (
            <div className="text-yellow-400">⚠️ Unsaved changes detected</div>
          )}
        </div>
      </div>
      
      {/* Background Gradient */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Style</label>
        <select
          value={content.backgroundColor}
          onChange={(e) => {
            const value = e.target.value;
            // Update database
            saveContent({ backgroundColor: value });
            // Update Craft.js props for compatibility
            setProp((props: EditableWelcomingSectionProps) => (props.backgroundColor = value));
          }}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        >
          <option value="from-darkBg via-gray-900 to-darkBg">Dark Theme (Default)</option>
          <option value="from-blue-900 via-purple-900 to-blue-900">Blue Purple</option>
          <option value="from-green-900 via-teal-900 to-green-900">Green Teal</option>
          <option value="from-red-900 via-pink-900 to-red-900">Red Pink</option>
          <option value="from-yellow-900 via-orange-900 to-yellow-900">Warm Sunset</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => resetContent()}
          disabled={isSaving}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
        >
          {isSaving ? 'Processing...' : 'Reset to Defaults'}
        </button>
      </div>

      <div className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-md">
        💡 <strong>How to edit:</strong> Click any text element directly to start editing. Changes are automatically saved to the database. Press Enter to save, Escape to cancel.
      </div>

      <div className="text-xs text-gray-500 bg-gray-900/50 p-3 rounded-md">
        🔗 <strong>Database Integration:</strong> All content is stored in the theme_settings table with homepage scope. Changes persist across page reloads and are shared across all users.
      </div>
    </div>
  );
};

// Export the component
export default EditableWelcomingSection;
