'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EditableWelcomingSectionProps {
  isEditMode: boolean;
  selectedTool: 'text' | 'color' | 'background' | 'image';
}

// Simplified EditableText component for now
const EditableText: React.FC<{
  value: string;
  onChange: (value: string) => void;
  isEditMode: boolean;
  className?: string;
  placeholder?: string;
}> = ({ value, onChange, isEditMode, className = '', placeholder = 'Click to edit...' }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.stopPropagation();
      setIsEditing(true);
    }
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
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  return (
    <div 
      className={`${className} ${isEditMode ? 'cursor-pointer hover:ring-2 hover:ring-neonCyan/50' : ''} relative`}
      onClick={handleClick}
    >
      {isEditing ? (
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-2 border-neonCyan rounded-md px-2 py-1 outline-none text-inherit font-inherit"
          autoFocus
          placeholder={placeholder}
        />
      ) : (
        <span>{localValue || placeholder}</span>
      )}
    </div>
  );
};

// Temporary content structure - will be replaced with database integration
const defaultContent = {
  title: "Welcome to Little Latte Lane",
  subtitle: "Where every cup tells a story",
  description: "Experience the perfect blend of artisanal coffee, delicious food, and warm hospitality in the heart of your neighborhood.",
  specialOffer: "Now Open - Grand Opening Special!",
  ctaText: "Explore Our Menu",
  features: ["Premium Quality", "Fast Service", "Cozy Atmosphere"]
};

export default function EditableWelcomingSection({ 
  isEditMode, 
  selectedTool 
}: EditableWelcomingSectionProps) {
  // For now, use local state - will be replaced with database integration
  const [content, setContent] = React.useState(defaultContent);
  
  const handleTextUpdate = useCallback((field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFeatureUpdate = useCallback((index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-darkBg via-gray-900 to-black">
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-neonCyan rounded-full" />
        <div className="absolute top-40 right-20 w-24 h-24 border border-neonPink rounded-full" />
        <div className="absolute bottom-40 left-20 w-20 h-20 border border-neonYellow rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <EditableText
              value={content.title}
              onChange={(value: string) => handleTextUpdate('title', value)}
              isEditMode={isEditMode && selectedTool === 'text'}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-neonCyan via-neonPink to-neonYellow bg-clip-text text-transparent mb-4"
              placeholder="Enter main title"
            />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <EditableText
              value={content.subtitle}
              onChange={(value: string) => handleTextUpdate('subtitle', value)}
              isEditMode={isEditMode && selectedTool === 'text'}
              className="text-xl md:text-2xl text-gray-300 font-light"
              placeholder="Enter subtitle"
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <EditableText
              value={content.description}
              onChange={(value: string) => handleTextUpdate('description', value)}
              isEditMode={isEditMode && selectedTool === 'text'}
              className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed"
              placeholder="Enter description"
            />
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            {content.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                {index === 0 && <Star className="w-6 h-6 text-neonYellow" />}
                {index === 1 && <Clock className="w-6 h-6 text-neonCyan" />}
                {index === 2 && <Coffee className="w-6 h-6 text-neonPink" />}
                <EditableText
                  value={feature}
                  onChange={(value: string) => handleFeatureUpdate(index, value)}
                  isEditMode={isEditMode && selectedTool === 'text'}
                  className="text-gray-300 font-medium"
                  placeholder={`Feature ${index + 1}`}
                />
              </div>
            ))}
          </motion.div>

          {/* Special Offer Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-8"
          >
            <Badge className="bg-gradient-to-r from-neonPink to-neonCyan text-white px-6 py-2 text-lg font-semibold">
              <EditableText
                value={content.specialOffer}
                onChange={(value: string) => handleTextUpdate('specialOffer', value)}
                isEditMode={isEditMode && selectedTool === 'text'}
                className="text-white"
                placeholder="Special offer text"
              />
            </Badge>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-neonCyan to-neonPink hover:from-neonPink hover:to-neonCyan text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
            >
              <EditableText
                value={content.ctaText}
                onChange={(value: string) => handleTextUpdate('ctaText', value)}
                isEditMode={isEditMode && selectedTool === 'text'}
                className="text-white font-bold"
                placeholder="CTA button text"
              />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
