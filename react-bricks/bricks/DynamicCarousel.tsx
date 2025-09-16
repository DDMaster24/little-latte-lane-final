'use client'

import React, { useState, useEffect } from 'react'
import { Text, Repeater, types, Image } from 'react-bricks/frontend'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

//========================================
// Nested Component: Carousel Panel
//========================================
interface CarouselPanelProps {
  panelTitle: types.TextValue
  panelDescription: types.TextValue
  panelIcon?: types.TextValue
  panelImage?: types.IImageSource
  panelBadge?: types.TextValue
  backgroundColor: 'dark' | 'gradient-cyan' | 'gradient-pink' | 'gradient-purple'
  borderColor: 'cyan' | 'pink' | 'purple' | 'yellow'
  badgeColor: 'green' | 'blue' | 'pink' | 'yellow'
  showIcon: boolean
  showImage: boolean
  showBadge: boolean
  customContent?: types.TextValue
}

const CarouselPanel: types.Brick<CarouselPanelProps> = ({
  panelTitle,
  panelDescription,
  panelIcon,
  panelImage,
  panelBadge,
  backgroundColor = 'dark',
  borderColor = 'cyan',
  badgeColor = 'green',
  showIcon = true,
  showImage = false,
  showBadge = false,
  customContent
}) => {
  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case 'dark': return 'from-gray-900 to-black'
      case 'gradient-cyan': return 'from-gray-900 via-blue-900/30 to-black'
      case 'gradient-pink': return 'from-gray-900 via-pink-900/30 to-black'
      case 'gradient-purple': return 'from-gray-900 via-purple-900/30 to-black'
      default: return 'from-gray-900 to-black'
    }
  }

  const getBorderClass = () => {
    switch (borderColor) {
      case 'cyan': return 'border-neonCyan/50'
      case 'pink': return 'border-neonPink/50'
      case 'purple': return 'border-purple-400/50'
      case 'yellow': return 'border-neonYellow/50'
      default: return 'border-neonCyan/50'
    }
  }

  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'green': return 'bg-green-500/20 border-green-400 text-green-400'
      case 'blue': return 'bg-blue-500/20 border-blue-400 text-blue-400'
      case 'pink': return 'bg-pink-500/20 border-pink-400 text-pink-400'
      case 'yellow': return 'bg-yellow-500/20 border-yellow-400 text-yellow-400'
      default: return 'bg-green-500/20 border-green-400 text-green-400'
    }
  }

  return (
    <Card className={`w-full h-full bg-gradient-to-br ${getBackgroundClass()} backdrop-blur-sm border-2 ${getBorderClass()} shadow-2xl overflow-hidden hover:shadow-3xl hover:border-opacity-100 transition-all duration-300`}>
      <CardContent className="p-4 h-full flex flex-col justify-between">
        {/* Header Section */}
        <div className="flex-shrink-0">
          <Text
            propName="panelTitle"
            value={panelTitle}
            renderBlock={(props) => (
              <h3 className="font-bold text-white mb-2 text-lg">
                {props.children}
              </h3>
            )}
            placeholder="Panel Title"
          />
          
          <Text
            propName="panelDescription"
            value={panelDescription}
            renderBlock={(props) => (
              <p className="text-gray-300 mb-3 text-sm">
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
                  <span className="text-4xl filter drop-shadow-lg text-neonCyan">
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
                  <div className="text-sm text-gray-200">
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
                <Badge className={`${getBadgeClass()} border text-white w-full justify-center`}>
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
    backgroundColor: 'dark',
    borderColor: 'cyan',
    badgeColor: 'green',
    showIcon: true,
    showImage: false,
    showBadge: false,
    customContent: ''
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    {
      groupName: 'Panel Design',
      defaultOpen: true,
      props: [
        {
          name: 'backgroundColor',
          label: 'Background Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'dark', label: 'Dark' },
              { value: 'gradient-cyan', label: 'Cyan Gradient' },
              { value: 'gradient-pink', label: 'Pink Gradient' },
              { value: 'gradient-purple', label: 'Purple Gradient' },
            ],
          },
        },
        {
          name: 'borderColor',
          label: 'Border Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'cyan', label: 'Neon Cyan' },
              { value: 'pink', label: 'Neon Pink' },
              { value: 'purple', label: 'Purple' },
              { value: 'yellow', label: 'Yellow' },
            ],
          },
        },
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
        {
          name: 'badgeColor',
          label: 'Badge Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'green', label: 'Green' },
              { value: 'blue', label: 'Blue' },
              { value: 'pink', label: 'Pink' },
              { value: 'yellow', label: 'Yellow' },
            ],
          },
          show: (props) => props.showBadge,
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
          backgroundColor: 'gradient-cyan',
          borderColor: 'cyan',
          badgeColor: 'green',
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
          backgroundColor: 'gradient-pink',
          borderColor: 'pink',
          badgeColor: 'pink',
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
          backgroundColor: 'gradient-purple',
          borderColor: 'purple',
          badgeColor: 'blue',
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
        {
          name: 'titleColor',
          label: 'Title Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Color,
            options: [
              { value: { color: '#ffffff' }, label: 'White' },
              { value: { color: '#00ffff' }, label: 'Neon Cyan' },
              { value: { color: '#ff00ff' }, label: 'Neon Pink' },
              { value: { color: '#ffff00' }, label: 'Yellow' },
            ],
          },
          show: (props) => props.showTitle,
        },
      ],
    },
  ],
}

export default DynamicCarousel
export { CarouselPanel }
