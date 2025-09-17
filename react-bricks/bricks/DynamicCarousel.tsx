'use client'

import React, { useState, useEffect } from 'react'
import { Text, Repeater, types, Image } from 'react-bricks/frontend'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createAdvancedColorProp, NEON_PALETTE, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

// Color value interface for consistency
interface ColorValue {
  color: string
  className?: string
  [key: string]: unknown
}

//========================================
// Advanced Component: Carousel Panel
//========================================
interface CarouselPanelProps {
  panelTitle: types.TextValue
  panelDescription: types.TextValue
  panelIcon?: types.TextValue
  panelImage?: types.IImageSource
  panelBadge?: types.TextValue
  
  // Advanced Color Controls
  backgroundColor: ColorValue
  borderColor: ColorValue
  titleColor: ColorValue
  descriptionColor: ColorValue
  iconColor: ColorValue
  badgeBackgroundColor: ColorValue
  badgeTextColor: ColorValue
  
  // Display Options
  showIcon: boolean
  showImage: boolean
  showBadge: boolean
  customContent?: types.TextValue
  contentColor: ColorValue
}

const CarouselPanel: types.Brick<CarouselPanelProps> = ({
  panelTitle,
  panelDescription,
  panelIcon,
  panelImage,
  panelBadge,
  backgroundColor = { color: '#1f2937' },
  borderColor = { color: '#00ffff' },
  titleColor = { color: '#ffffff' },
  descriptionColor = { color: '#d1d5db' },
  iconColor = { color: '#00ffff' },
  badgeBackgroundColor = { color: '#10b981' },
  badgeTextColor = { color: '#ffffff' },
  showIcon = true,
  showImage = false,
  showBadge = false,
  customContent,
  contentColor = { color: '#e5e7eb' }
}) => {
  const backgroundStyle = {
    backgroundColor: backgroundColor.color !== 'transparent' ? backgroundColor.color : undefined
  }
  
  const borderStyle = {
    borderColor: borderColor.color || '#00ffff'
  }
  
  const titleStyle = {
    color: titleColor.color || '#ffffff'
  }
  
  const descriptionStyle = {
    color: descriptionColor.color || '#d1d5db'
  }
  
  const iconStyle = {
    color: iconColor.color || '#00ffff'
  }
  
  const badgeStyle = {
    backgroundColor: badgeBackgroundColor.color || '#10b981',
    color: badgeTextColor.color || '#ffffff',
    borderColor: badgeBackgroundColor.color || '#10b981'
  }
  
  const contentStyle = {
    color: contentColor.color || '#e5e7eb'
  }

  return (
    <Card 
      className="w-full h-full backdrop-blur-sm border-2 shadow-2xl overflow-hidden hover:shadow-3xl hover:border-opacity-100 transition-all duration-300"
      style={{...backgroundStyle, ...borderStyle}}
    >
      <CardContent className="p-4 h-full flex flex-col justify-between">
        {/* Header Section */}
        <div className="flex-shrink-0">
          <Text
            propName="panelTitle"
            value={panelTitle}
            renderBlock={(props) => (
              <h3 className="font-bold mb-2 text-lg" style={titleStyle}>
                {props.children}
              </h3>
            )}
            placeholder="Panel Title"
          />
          
          <Text
            propName="panelDescription"
            value={panelDescription}
            renderBlock={(props) => (
              <p className="mb-3 text-sm" style={descriptionStyle}>
                {props.children}
              </p>
            )}
            placeholder="Panel description goes here"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          {/* Icon */}
          {showIcon && (
            <div className="text-center">
              <Text
                propName="panelIcon"
                value={panelIcon || '🎯'}
                renderBlock={(props) => (
                  <span className="text-4xl filter drop-shadow-lg" style={iconStyle}>
                    {props.children}
                  </span>
                )}
                placeholder="🎯"
              />
            </div>
          )}

          {/* Image */}
          {showImage && panelImage && (
            <div className="relative flex-shrink-0">
              <Image
                propName="panelImage"
                source={panelImage}
                alt="Panel image"
                maxWidth={240}
                imageClassName="rounded-lg mx-auto object-cover w-full h-20 xs:h-24 sm:h-28 md:h-32 max-w-60"
                sizes="(max-width: 475px) 240px, (max-width: 640px) 256px, 288px"
              />
            </div>
          )}

          {/* Custom Content */}
          {customContent && (
            <div className="text-center">
              <Text
                propName="customContent"
                value={customContent || ''}
                renderBlock={(props) => (
                  <div className="text-sm" style={contentStyle}>
                    {props.children}
                  </div>
                )}
                placeholder="Custom content here"
              />
            </div>
          )}
        </div>

        {/* Badge Section */}
        {showBadge && panelBadge && (
          <div className="flex-shrink-0 mt-3">
            <Text
              propName="panelBadge"
              value={panelBadge || 'NEW'}
              renderBlock={(props) => (
                <Badge 
                  className="border w-full justify-center" 
                  style={badgeStyle}
                >
                  {props.children}
                </Badge>
              )}
              placeholder="NEW"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

CarouselPanel.schema = {
  name: 'carousel-panel',
  label: 'Carousel Panel',
  getDefaultProps: () => ({
    panelTitle: 'Panel Title',
    panelDescription: 'Panel description goes here',
    panelIcon: '🎯',
    panelBadge: 'NEW',
    backgroundColor: { color: '#1f2937' },
    borderColor: { color: '#00ffff' },
    titleColor: { color: '#ffffff' },
    descriptionColor: { color: '#d1d5db' },
    iconColor: { color: '#00ffff' },
    badgeBackgroundColor: { color: '#10b981' },
    badgeTextColor: { color: '#ffffff' },
    contentColor: { color: '#e5e7eb' },
    showIcon: true,
    showImage: false,
    showBadge: false,
    customContent: ''
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    {
      groupName: 'Panel Background',
      defaultOpen: true,
      props: [
        createAdvancedColorProp('backgroundColor', 'Panel Background', { presetColors: BACKGROUND_PALETTE }),
        createAdvancedColorProp('borderColor', 'Border Color', { presetColors: NEON_PALETTE }),
      ],
    },
    {
      groupName: 'Text Colors',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('titleColor', 'Title Color', { presetColors: TEXT_PALETTE }),
        createAdvancedColorProp('descriptionColor', 'Description Color', { presetColors: TEXT_PALETTE }),
        createAdvancedColorProp('contentColor', 'Custom Content Color', { presetColors: TEXT_PALETTE }),
      ],
    },
    {
      groupName: 'Icon & Badge',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('iconColor', 'Icon Color', { presetColors: NEON_PALETTE }),
        createAdvancedColorProp('badgeBackgroundColor', 'Badge Background', { presetColors: NEON_PALETTE }),
        createAdvancedColorProp('badgeTextColor', 'Badge Text Color', { presetColors: TEXT_PALETTE }),
      ],
    },
    {
      groupName: 'Content Options',
      defaultOpen: false,
      props: [
        {
          name: 'showIcon',
          label: 'Show Icon',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showImage',
          label: 'Show Image',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showBadge',
          label: 'Show Badge',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
  ],
}

//========================================
// Main Component: Dynamic Carousel
//========================================
interface DynamicCarouselProps {
  carouselTitle?: types.TextValue
  panels: types.RepeaterItems
  autoRotate: boolean
  rotationSpeed: number
  showTitle: boolean
  showNavigation: boolean
  carouselHeight: 'compact' | 'standard' | 'tall'
  backgroundColor: string
  titleColor: { color: string }
}

const DynamicCarousel: types.Brick<DynamicCarouselProps> = ({
  carouselTitle,
  panels,
  autoRotate = true,
  rotationSpeed = 8000,
  showTitle = false,
  showNavigation = true,
  carouselHeight = 'standard',
  backgroundColor = 'transparent',
  titleColor = { color: '#ffffff' }
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const getHeightClass = () => {
    switch (carouselHeight) {
      case 'compact': return 'h-[400px]'
      case 'standard': return 'h-[600px]'
      case 'tall': return 'h-[800px]'
      default: return 'h-[600px]'
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || panels.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % panels.length)
    }, rotationSpeed)

    return () => clearInterval(interval)
  }, [autoRotate, rotationSpeed, panels.length])

  const hasPanels = panels && panels.length > 0

  return (
    <section 
      className="w-full rounded-xl animate-fade-in py-8"
      style={{ backgroundColor }}
    >
      {/* Title */}
      {showTitle && carouselTitle && (
        <div className="text-center mb-8 px-6">
          <Text
            propName="carouselTitle"
            value={carouselTitle}
            renderBlock={(props) => (
              <h2 
                className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent"
                style={{ color: titleColor.color }}
              >
                {props.children}
              </h2>
            )}
            placeholder="🎠 Dynamic Carousel"
          />
        </div>
      )}

      {/* Carousel */}
      {hasPanels ? (
        <div className="relative">
          {/* Carousel Container */}
          <div className={`relative ${getHeightClass()} flex items-center justify-center carousel-3d-container overflow-visible`}>
            <Repeater
              propName="panels"
              items={panels}
              renderWrapper={(items) => (
                <div className="relative w-full h-full">
                  {items}
                </div>
              )}
            />
          </div>

          {/* Navigation Dots */}
          {showNavigation && panels.length > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              {panels.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-neonCyan scale-125 shadow-neon'
                      : 'bg-gray-600 hover:bg-gray-400'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎠</div>
          <p className="text-gray-400 text-lg">No carousel panels configured</p>
        </div>
      )}
    </section>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
DynamicCarousel.schema = {
  name: 'dynamic-carousel',
  label: 'Dynamic Carousel',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    carouselTitle: '🎠 Featured Content',
    autoRotate: true,
    rotationSpeed: 8000,
    showTitle: false,
    showNavigation: true,
    carouselHeight: 'standard',
    backgroundColor: 'transparent',
    titleColor: { color: '#ffffff' },
    panels: [
      {
        type: 'carousel-panel',
        props: {
          panelTitle: 'Opening Hours',
          panelDescription: 'Visit us during these times',
          panelIcon: '🕐',
          backgroundColor: { color: '#1f2937' },
          borderColor: { color: '#00ffff' },
          titleColor: { color: '#ffffff' },
          descriptionColor: { color: '#d1d5db' },
          iconColor: { color: '#00ffff' },
          badgeBackgroundColor: { color: '#10b981' },
          badgeTextColor: { color: '#ffffff' },
          contentColor: { color: '#e5e7eb' },
          showIcon: true,
          showImage: false,
          showBadge: false,
          customContent: 'Mon-Fri: 7AM-9PM\nSat-Sun: 8AM-10PM'
        }
      },
      {
        type: 'carousel-panel',
        props: {
          panelTitle: 'Featured Menu',
          panelDescription: 'Try our signature items',
          panelIcon: '🍕',
          backgroundColor: { color: '#4c1d95' },
          borderColor: { color: '#ff00ff' },
          titleColor: { color: '#ffffff' },
          descriptionColor: { color: '#d1d5db' },
          iconColor: { color: '#ff00ff' },
          badgeBackgroundColor: { color: '#ec4899' },
          badgeTextColor: { color: '#ffffff' },
          contentColor: { color: '#e5e7eb' },
          showIcon: true,
          showImage: false,
          showBadge: true,
          panelBadge: 'POPULAR',
          customContent: 'Artisan Pizzas\nSpecialty Coffee\nFresh Smoothies'
        }
      },
      {
        type: 'carousel-panel',
        props: {
          panelTitle: 'Contact Info',
          panelDescription: 'Get in touch with us',
          panelIcon: '📞',
          backgroundColor: { color: '#581c87' },
          borderColor: { color: '#8b5cf6' },
          titleColor: { color: '#ffffff' },
          descriptionColor: { color: '#d1d5db' },
          iconColor: { color: '#8b5cf6' },
          badgeBackgroundColor: { color: '#3b82f6' },
          badgeTextColor: { color: '#ffffff' },
          contentColor: { color: '#e5e7eb' },
          showIcon: true,
          showImage: false,
          showBadge: false,
          customContent: 'Phone: (555) 123-4567\nEmail: info@littlelatte.com\nAddress: 123 Coffee Lane'
        }
      }
    ]
  }),

  repeaterItems: [
    {
      name: 'panels',
      itemType: 'carousel-panel',
      itemLabel: 'Panel',
      min: 1,
      max: 10
    }
  ],

  sideEditProps: [
    {
      groupName: 'Carousel Settings',
      defaultOpen: true,
      props: [
        {
          name: 'autoRotate',
          label: 'Auto Rotate',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'rotationSpeed',
          label: 'Rotation Speed (ms)',
          type: types.SideEditPropType.Number,
          show: (props) => props.autoRotate,
        },
        {
          name: 'carouselHeight',
          label: 'Carousel Height',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'compact', label: 'Compact (400px)' },
              { value: 'standard', label: 'Standard (600px)' },
              { value: 'tall', label: 'Tall (800px)' },
            ],
          },
        },
        {
          name: 'showNavigation',
          label: 'Show Navigation Dots',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
    {
      groupName: 'Title & Background',
      defaultOpen: false,
      props: [
        {
          name: 'showTitle',
          label: 'Show Title',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'backgroundColor',
          label: 'Background Color',
          type: types.SideEditPropType.Text,
        },
        createAdvancedColorProp(
          'titleColor',
          'Title Color',
          { 
            presetColors: TEXT_PALETTE,
            show: (props: Record<string, unknown>) => props.showTitle as boolean
          }
        ),
      ],
    },
  ],
}

export default DynamicCarousel
export { CarouselPanel }
