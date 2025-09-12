import React, { useState, useEffect } from 'react'
import { Repeater, types } from 'react-bricks/frontend'

//=============================
interface DynamicCarouselProps {
  carouselHeight: string
  autoPlay: boolean
  autoPlayInterval: number
  showDots: boolean
  containerPadding: string
  backgroundStyle: string
  threeDEffect: boolean
  navigationStyle: string
}

//=============================
// Component to be rendered
//=============================
const DynamicCarousel: types.Brick<DynamicCarouselProps> = ({
  carouselHeight = 'h-[600px]',
  autoPlay = true,
  autoPlayInterval = 8000,
  showDots = true,
  containerPadding = 'px-4',
  backgroundStyle = 'bg-transparent',
  threeDEffect = true,
  navigationStyle = 'modern',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [panelCount, setPanelCount] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % panelCount)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-rotation effect
  useEffect(() => {
    if (!autoPlay || panelCount === 0) return
    
    const interval = setInterval(() => {
      nextSlide()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, panelCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // Get 3D transform and styling for each card
  const getCardTransform = (index: number, totalPanels: number) => {
    if (totalPanels === 0) return { 
      transform: 'scale(0)', 
      opacity: 0, 
      zIndex: 0, 
      visibility: 'hidden' as const 
    }
    
    const relativeIndex = index - currentIndex
    const normalizedIndex = ((relativeIndex % totalPanels) + totalPanels) % totalPanels

    if (!threeDEffect) {
      // Simple 2D carousel effect
      return {
        transform: normalizedIndex === 0 ? 'translateX(0) scale(1)' : `translateX(${normalizedIndex > totalPanels / 2 ? '-' : ''}100%) scale(0.8)`,
        opacity: normalizedIndex === 0 ? 1 : 0.6,
        zIndex: normalizedIndex === 0 ? 50 : 30,
        visibility: 'visible' as const,
        width: '400px',
        height: 'auto',
      }
    }

    // 3D carousel effects based on panel count
    if (totalPanels === 1) {
      return {
        transform: 'translateX(0) translateZ(100px) rotateY(0deg) scale(1.2)',
        opacity: 1,
        zIndex: 50,
        visibility: 'visible' as const,
        width: '400px',
        height: 'auto',
      }
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
            height: 'auto',
          }
        case 1: // Right
          return {
            transform: 'translateX(240px) translateZ(20px) rotateY(-15deg) scale(0.9)',
            opacity: 0.8,
            zIndex: 40,
            visibility: 'visible' as const,
            width: '320px',
            height: 'auto',
          }
        default:
          return {
            transform: 'scale(0)',
            opacity: 0,
            zIndex: 0,
            visibility: 'hidden' as const,
            width: '320px',
            height: 'auto',
          }
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
            height: 'auto',
          }
        case 1: // Right
          return {
            transform: 'translateX(320px) translateZ(20px) rotateY(-15deg) scale(0.9)',
            opacity: 0.8,
            zIndex: 40,
            visibility: 'visible' as const,
            width: '320px',
            height: 'auto',
          }
        case 2: // Left
          return {
            transform: 'translateX(-320px) translateZ(20px) rotateY(15deg) scale(0.9)',
            opacity: 0.8,
            zIndex: 40,
            visibility: 'visible' as const,
            width: '320px',
            height: 'auto',
          }
        default:
          return {
            transform: 'scale(0)',
            opacity: 0,
            zIndex: 0,
            visibility: 'hidden' as const,
            width: '320px',
            height: 'auto',
          }
      }
    }

    // 5+ panel logic
    switch (normalizedIndex) {
      case 0: // Center
        return {
          transform: 'translateX(0) translateZ(100px) rotateY(0deg) scale(1.2)',
          opacity: 1,
          zIndex: 50,
          visibility: 'visible' as const,
          width: '400px',
          height: 'auto',
        }
      case 1: // Right medium
        return {
          transform: 'translateX(320px) translateZ(20px) rotateY(-15deg) scale(0.9)',
          opacity: 0.8,
          zIndex: 40,
          visibility: 'visible' as const,
          width: '320px',
          height: 'auto',
        }
      case 2: // Far right small
        return {
          transform: 'translateX(560px) translateZ(-50px) rotateY(-30deg) scale(0.7)',
          opacity: 0.6,
          zIndex: 30,
          visibility: 'visible' as const,
          width: '260px',
          height: 'auto',
        }
      case 3: // Far left small
        return {
          transform: 'translateX(-560px) translateZ(-50px) rotateY(30deg) scale(0.7)',
          opacity: 0.6,
          zIndex: 30,
          visibility: 'visible' as const,
          width: '260px',
          height: 'auto',
        }
      case 4: // Left medium
        return {
          transform: 'translateX(-320px) translateZ(20px) rotateY(15deg) scale(0.9)',
          opacity: 0.8,
          zIndex: 40,
          visibility: 'visible' as const,
          width: '320px',
          height: 'auto',
        }
      default:
        return {
          transform: 'translateX(0) translateZ(-400px) rotateY(0deg) scale(0.3)',
          opacity: 0,
          zIndex: 10,
          visibility: 'hidden' as const,
          width: '320px',
          height: 'auto',
        }
    }
  }

  return (
    <div className={`relative ${containerPadding} ${backgroundStyle}`}>
      {/* Carousel Container */}
      <div className={`relative ${carouselHeight} flex items-center justify-center carousel-3d-container overflow-visible`}>
        <Repeater
          propName="panels"
          renderWrapper={(items) => {
            const itemsArray = React.Children.toArray(items)
            setPanelCount(itemsArray.length)
            
            if (itemsArray.length === 0) {
              return (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No panels added yet</p>
                  <p className="text-sm text-gray-500">
                    Click the + button in the sidebar to add your first carousel panel
                  </p>
                </div>
              )
            }

            return (
              <>
                {itemsArray.map((item, index) => {
                  const cardStyle = getCardTransform(index, itemsArray.length)
                  
                  return (
                    <div
                      key={`panel-${index}`}
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
                      {item}
                    </div>
                  )
                })}
              </>
            )
          }}
        />
      </div>

      {/* Navigation Dots */}
      {showDots && panelCount > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: panelCount }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                navigationStyle === 'modern'
                  ? index === currentIndex
                    ? 'bg-neon-green scale-125 shadow-lg shadow-neon-green/50'
                    : 'bg-gray-600 hover:bg-gray-400'
                  : navigationStyle === 'minimal'
                  ? index === currentIndex
                    ? 'bg-white scale-110'
                    : 'bg-gray-500 hover:bg-gray-300'
                  : index === currentIndex
                  ? 'bg-neonCyan scale-125'
                  : 'bg-gray-600 hover:bg-gray-400'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Custom CSS for 3D effects */}
      <style jsx>{`
        .carousel-3d-container {
          perspective: 1200px;
          perspective-origin: center center;
        }
        .carousel-3d-card {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  )
}

//=============================
// Brick Schema
//=============================
DynamicCarousel.schema = {
  name: 'dynamic-carousel',
  label: 'Dynamic Carousel',
  category: 'layout',
  tags: ['carousel', 'gallery', 'content', 'interactive'],

  // Default props when brick is added
  getDefaultProps: () => ({
    carouselHeight: 'h-[600px]',
    autoPlay: true,
    autoPlayInterval: 8000,
    showDots: true,
    containerPadding: 'px-4',
    backgroundStyle: 'bg-transparent',
    threeDEffect: true,
    navigationStyle: 'modern',
    panels: [
      {
        title: 'Welcome Panel',
        description: 'Your first carousel panel',
        backgroundGradient: 'from-neonCyan to-blue-600',
        borderColor: 'border-neonCyan',
        badgeText: 'Featured',
      },
      {
        title: 'Second Panel',
        description: 'Add more panels as needed',
        backgroundGradient: 'from-neonPink to-purple-600',
        borderColor: 'border-neonPink',
        badgeText: 'Popular',
      },
    ],
  }),

  // Repeater bricks (panels can only contain CarouselPanel bricks)
  repeaterItems: [
    {
      name: 'panels',
      itemType: 'carousel-panel',
      itemLabel: 'Panel',
      min: 0,
      max: 10,
    },
  ],

  // Sidebar controls for editing
  sideEditProps: [
    {
      groupName: 'Carousel Settings',
      props: [
        {
          name: 'carouselHeight',
          label: 'Carousel Height',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'h-96', label: 'Small (384px)' },
              { value: 'h-[28rem]', label: 'Medium (448px)' },
              { value: 'h-[32rem]', label: 'Large (512px)' },
              { value: 'h-[36rem]', label: 'X-Large (576px)' },
              { value: 'h-[600px]', label: 'XX-Large (600px) - Default' },
              { value: 'h-[40rem]', label: 'Huge (640px)' },
            ],
          },
        },
        {
          name: 'threeDEffect',
          label: 'Enable 3D Effect',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'containerPadding',
          label: 'Container Padding',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'px-0', label: 'No Padding' },
              { value: 'px-2', label: 'Small Padding' },
              { value: 'px-4', label: 'Medium Padding (Default)' },
              { value: 'px-6', label: 'Large Padding' },
              { value: 'px-8', label: 'Extra Large Padding' },
            ],
          },
        },
        {
          name: 'backgroundStyle',
          label: 'Background Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'bg-transparent', label: 'Transparent (Default)' },
              { value: 'bg-black/20', label: 'Dark Overlay' },
              { value: 'bg-gradient-to-b from-transparent to-black/30', label: 'Gradient Overlay' },
              { value: 'bg-gray-900/50', label: 'Dark Background' },
              { value: 'bg-neonCyan/5', label: 'Cyan Tint' },
              { value: 'bg-neonPink/5', label: 'Pink Tint' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Auto-Play Settings',
      props: [
        {
          name: 'autoPlay',
          label: 'Enable Auto-Play',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'autoPlayInterval',
          label: 'Auto-Play Interval (ms)',
          type: types.SideEditPropType.Number,
          validate: (value) => value >= 1000 && value <= 30000,
        },
      ],
    },
    {
      groupName: 'Navigation',
      props: [
        {
          name: 'showDots',
          label: 'Show Navigation Dots',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'navigationStyle',
          label: 'Navigation Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'modern', label: 'Modern (Neon Green)' },
              { value: 'classic', label: 'Classic (Neon Cyan)' },
              { value: 'minimal', label: 'Minimal (White)' },
            ],
          },
        },
      ],
    },
  ],
}

export default DynamicCarousel