'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { 
  Clock, Calendar, Camera, Coffee, Utensils, Star, MapPin, 
  Wifi, Car, Phone, Mail, Edit, ImageIcon, 
  LucideIcon
} from 'lucide-react';
import type { CarouselPanel, PanelConfig } from '@/lib/carouselTemplates';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Clock, Calendar, Camera, Coffee, Utensils, Star, MapPin,
  Wifi, Car, Phone, Mail, Edit, ImageIcon
};

interface DynamicCarouselProps {
  panels?: CarouselPanel[];
  className?: string;
}

export default function DynamicCarousel({ panels = [], className = '' }: DynamicCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselPanels, setCarouselPanels] = useState<CarouselPanel[]>([]);

  // Load panels from props or fetch from API
  useEffect(() => {
    if (panels.length > 0) {
      setCarouselPanels(panels.filter(panel => panel.is_active));
    } else {
      fetchPanels();
    }
  }, [panels]);

  const fetchPanels = async () => {
    try {
      const response = await fetch('/api/carousel-panels');
      const data = await response.json();
      
      if (data.success) {
        setCarouselPanels(data.panels.filter((panel: CarouselPanel) => panel.is_active));
      }
    } catch (error) {
      console.error('Error fetching carousel panels:', error);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselPanels.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-rotation effect
  useEffect(() => {
    if (carouselPanels.length === 0) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);

    return () => clearInterval(interval);
  }, [carouselPanels.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get 3D transform and styling for each card
  const getCardTransform = (index: number) => {
    if (carouselPanels.length === 0) return { transform: 'scale(0)', opacity: 0, zIndex: 0, visibility: 'hidden' as const };
    
    const relativeIndex = index - currentIndex;
    const normalizedIndex = ((relativeIndex % carouselPanels.length) + carouselPanels.length) % carouselPanels.length;

    // Dynamic positioning based on number of panels
    const totalPanels = carouselPanels.length;
    
    if (totalPanels === 1) {
      return {
        transform: 'translateX(0) translateZ(100px) rotateY(0deg) scale(1.2)',
        opacity: 1,
        zIndex: 50,
        visibility: 'visible' as const,
        width: '400px',
        height: '480px',
      };
    }

    if (totalPanels === 2) {
      switch (normalizedIndex) {
        case 0: // Center
          return {
            transform: 'translateX(-80px) translateZ(100px) rotateY(0deg) scale(1.2)',
            opacity: 1,
            zIndex: 50,
            visibility: 'visible' as const,
            width: '400px',
            height: '480px',
          };
        case 1: // Right
          return {
            transform: 'translateX(240px) translateZ(20px) rotateY(-15deg) scale(0.9)',
            opacity: 0.8,
            zIndex: 40,
            visibility: 'visible' as const,
            width: '320px',
            height: '400px',
          };
        default:
          return {
            transform: 'scale(0)',
            opacity: 0,
            zIndex: 0,
            visibility: 'hidden' as const,
            width: '320px',
            height: '400px',
          };
      }
    }

    if (totalPanels === 3) {
      switch (normalizedIndex) {
        case 0: // Center
          return {
            transform: 'translateX(0) translateZ(100px) rotateY(0deg) scale(1.2)',
            opacity: 1,
            zIndex: 50,
            visibility: 'visible' as const,
            width: '400px',
            height: '480px',
          };
        case 1: // Right
          return {
            transform: 'translateX(320px) translateZ(20px) rotateY(-15deg) scale(0.9)',
            opacity: 0.8,
            zIndex: 40,
            visibility: 'visible' as const,
            width: '320px',
            height: '400px',
          };
        case 2: // Left
          return {
            transform: 'translateX(-320px) translateZ(20px) rotateY(15deg) scale(0.9)',
            opacity: 0.8,
            zIndex: 40,
            visibility: 'visible' as const,
            width: '320px',
            height: '400px',
          };
        default:
          return {
            transform: 'scale(0)',
            opacity: 0,
            zIndex: 0,
            visibility: 'hidden' as const,
            width: '320px',
            height: '400px',
          };
      }
    }

    // Original 5+ panel logic
    switch (normalizedIndex) {
      case 0: // Center
        return {
          transform: 'translateX(0) translateZ(100px) rotateY(0deg) scale(1.2)',
          opacity: 1,
          zIndex: 50,
          visibility: 'visible' as const,
          width: '400px',
          height: '480px',
        };
      case 1: // Right medium
        return {
          transform: 'translateX(320px) translateZ(20px) rotateY(-15deg) scale(0.9)',
          opacity: 0.8,
          zIndex: 40,
          visibility: 'visible' as const,
          width: '320px',
          height: '400px',
        };
      case 2: // Far right small
        return {
          transform: 'translateX(560px) translateZ(-50px) rotateY(-30deg) scale(0.7)',
          opacity: 0.6,
          zIndex: 30,
          visibility: 'visible' as const,
          width: '260px',
          height: '320px',
        };
      case 3: // Far left small
        return {
          transform: 'translateX(-560px) translateZ(-50px) rotateY(30deg) scale(0.7)',
          opacity: 0.6,
          zIndex: 30,
          visibility: 'visible' as const,
          width: '260px',
          height: '320px',
        };
      case 4: // Left medium
        return {
          transform: 'translateX(-320px) translateZ(20px) rotateY(15deg) scale(0.9)',
          opacity: 0.8,
          zIndex: 40,
          visibility: 'visible' as const,
          width: '320px',
          height: '400px',
        };
      default:
        return {
          transform: 'translateX(0) translateZ(-400px) rotateY(0deg) scale(0.3)',
          opacity: 0,
          zIndex: 10,
          visibility: 'hidden' as const,
          width: '320px',
          height: '400px',
        };
    }
  };

  // Render panel content based on configuration
  const renderPanelContent = (config: PanelConfig, _isCenterCard: boolean) => {
    const components = [];

    // Render icon if enabled
    if (config.icon?.enabled && config.icon.name && iconMap[config.icon.name]) {
      const IconComponent = iconMap[config.icon.name];
      components.push(
        <div key="icon" className="text-center mb-6">
          <IconComponent className="h-16 w-16 text-neonCyan mx-auto" />
        </div>
      );
    }

    // Render image if enabled
    if (config.image?.enabled && config.image.src) {
      components.push(
        <div key="image" className="relative flex-shrink-0 mb-4">
          <Image
            src={config.image.src}
            alt={config.image.alt || 'Panel image'}
            width={240}
            height={135}
            className="rounded-lg mx-auto object-cover w-full h-20 xs:h-24 sm:h-28 md:h-32 max-w-60 xs:max-w-64 sm:max-w-72"
            sizes="(max-width: 475px) 240px, (max-width: 640px) 256px, 288px"
            priority={false}
            loading="lazy"
          />
        </div>
      );
    }

    // Render schedule if enabled
    if (config.schedule?.enabled && config.schedule.items) {
      components.push(
        <div key="schedule" className="space-y-4 text-sm mb-6">
          {config.schedule.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center px-2">
              <span className="text-gray-300 font-medium min-w-[80px]">{item.day}</span>
              <span className="text-white font-semibold ml-4">{item.hours}</span>
            </div>
          ))}
        </div>
      );
    }

    // Render feature grid if enabled
    if (config.featureGrid?.enabled && config.featureGrid.items) {
      const enabledItems = config.featureGrid.items.filter(item => item.enabled);
      if (enabledItems.length > 0) {
        components.push(
          <div key="featureGrid" className="grid grid-cols-2 gap-1 text-xs mb-3">
            {enabledItems.map((item, index) => {
              const FeatureIcon = iconMap[item.icon];
              return (
                <div key={index} className="flex items-center">
                  {FeatureIcon && <FeatureIcon className="h-3 w-3 mr-1 text-neonPink flex-shrink-0" />}
                  <span className="truncate">{item.text}</span>
                </div>
              );
            })}
          </div>
        );
      }
    }

    // Render feature list if enabled
    if (config.featureList?.enabled && config.featureList.items) {
      const enabledItems = config.featureList.items.filter(item => item.enabled);
      if (enabledItems.length > 0) {
        components.push(
          <div key="featureList" className="space-y-2 text-sm mb-4">
            {enabledItems.map((item, index) => (
              <div key={index} className="text-center font-medium text-gray-200">{item.text}</div>
            ))}
          </div>
        );
      }
    }

    // Render event cards if enabled
    if (config.eventCards?.enabled && config.eventCards.items) {
      const enabledItems = config.eventCards.items.filter(item => item.enabled);
      if (enabledItems.length > 0) {
        components.push(
          <div key="eventCards" className="space-y-2 text-sm mb-4">
            {enabledItems.map((item, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded">
                <p className="text-white font-medium text-xs">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.detail}</p>
              </div>
            ))}
          </div>
        );
      }
    }

    // Render social grid if enabled
    if (config.socialGrid?.enabled && config.socialGrid.items) {
      const enabledItems = config.socialGrid.items.filter(item => item.enabled);
      if (enabledItems.length > 0) {
        components.push(
          <div key="socialGrid" className="grid grid-cols-2 gap-3 text-sm mb-4">
            {enabledItems.map((item, index) => (
              <div key={index} className="bg-gray-700/50 p-3 rounded-lg text-center font-medium">{item.text}</div>
            ))}
          </div>
        );
      }
    }

    // Render handle if enabled
    if (config.handle?.enabled && config.handle.text) {
      components.push(
        <div key="handle" className="text-center text-lg font-semibold text-neonCyan mb-3">
          {config.handle.text}
        </div>
      );
    }

    // Render custom HTML if enabled
    if (config.customHtml?.enabled && config.customHtml.content) {
      components.push(
        <div 
          key="customHtml" 
          className="mb-3"
          dangerouslySetInnerHTML={{ __html: config.customHtml.content }}
        />
      );
    }

    return components;
  };

  if (carouselPanels.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-400">No carousel panels configured</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Container */}
      <div className="relative h-[600px] flex items-center justify-center carousel-3d-container overflow-visible">
        {carouselPanels.map((panel, index) => {
          const cardStyle = getCardTransform(index);
          const isCenterCard = index === currentIndex;

          return (
            <div
              key={panel.id}
              className="absolute carousel-3d-card cursor-pointer transition-all duration-1000 ease-in-out"
              style={{
                transform: cardStyle.transform,
                opacity: cardStyle.opacity,
                zIndex: cardStyle.zIndex,
                visibility: cardStyle.visibility,
                width: cardStyle.width,
                height: cardStyle.height,
              }}
              onClick={() => goToSlide(index)}
            >
              <Card
                className={`
                  w-full h-full bg-gradient-to-br ${panel.config.bgColor} backdrop-blur-sm 
                  border-2 ${panel.config.borderColor} shadow-2xl
                  overflow-hidden hover:shadow-3xl hover:border-opacity-100
                  transition-all duration-300
                `}
              >
                <CardContent className="p-4 h-full flex flex-col justify-between">
                  <div className="flex-shrink-0">
                    {panel.config.title?.enabled && (
                      <h3
                        className={`font-bold text-white mb-2 ${
                          isCenterCard ? 'text-2xl' : 'text-lg'
                        }`}
                      >
                        {panel.config.title.text}
                      </h3>
                    )}
                    {panel.config.description?.enabled && (
                      <p
                        className={`text-gray-300 mb-3 ${
                          isCenterCard ? 'text-sm' : 'text-xs'
                        }`}
                      >
                        {panel.config.description.text}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {renderPanelContent(panel.config, isCenterCard)}
                  </div>

                  {panel.config.badge?.enabled && (
                    <div className="flex-shrink-0 mt-3">
                      <Badge className={`${panel.config.badge.color} text-white w-full justify-center`}>
                        {panel.config.badge.text}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      {carouselPanels.length > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          {carouselPanels.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-neon-green scale-125'
                  : 'bg-gray-600 hover:bg-gray-400'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
