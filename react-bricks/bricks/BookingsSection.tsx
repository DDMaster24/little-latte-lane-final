import React from 'react'
import { Text, types } from 'react-bricks/rsc'
import Link from 'next/link'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Main Component: Bookings Section
//========================================
interface BookingsSectionProps {
  sectionTitle: types.TextValue
  sectionDescription: types.TextValue
  ctaButtonText: types.TextValue
  ctaButtonLink: string
  backgroundColor: string
  titleColor: { color: string }
  descriptionColor: { color: string }
  buttonStyle: 'neon' | 'solid' | 'outline' | 'gradient'
  sectionPadding: 'sm' | 'md' | 'lg'
  backgroundImage?: types.IImageSource
  showIcon: boolean
  sectionIcon: types.TextValue
  textAlignment: 'left' | 'center' | 'right'
  enableGlassEffect: boolean
  showSecondaryButton: boolean
  secondaryButtonText?: types.TextValue
  secondaryButtonLink?: string
}

const BookingsSection: types.Brick<BookingsSectionProps> = ({
  sectionTitle,
  sectionDescription,
  ctaButtonText,
  ctaButtonLink = '/bookings',
  backgroundColor = '#0f0f0f',
  titleColor = { color: '#ffffff' },
  descriptionColor = { color: '#d1d5db' },
  buttonStyle = 'neon',
  sectionPadding = 'md',
  backgroundImage,
  showIcon = true,
  sectionIcon,
  textAlignment = 'center',
  enableGlassEffect = true,
  showSecondaryButton = false,
  secondaryButtonText,
  secondaryButtonLink = '/menu'
}) => {
  const getPaddingClass = () => {
    switch (sectionPadding) {
      case 'sm': return 'py-8 xs:py-12'
      case 'md': return 'py-8 xs:py-12'
      case 'lg': return 'py-12 xs:py-16'
      default: return 'py-8 xs:py-12'
    }
  }

  const getTextAlignmentClass = () => {
    switch (textAlignment) {
      case 'left': return 'text-left'
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  const getButtonClass = () => {
    switch (buttonStyle) {
      case 'neon': return 'neon-button'
      case 'solid': return 'bg-neonCyan text-black hover:bg-neonPink transition-all duration-300 font-semibold'
      case 'outline': return 'border-2 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black transition-all duration-300 font-semibold'
      case 'gradient': return 'bg-gradient-to-r from-neonCyan to-neonPink text-black hover:from-neonPink hover:to-neonYellow transition-all duration-300 font-semibold'
      default: return 'neon-button'
    }
  }

  const getBackgroundStyle = () => {
    const baseStyle = { backgroundColor }
    
    if (backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    
    return baseStyle
  }

  const getContainerClass = () => {
    if (enableGlassEffect) {
      return 'bg-black/20 backdrop-blur-md border border-neonCyan/30 rounded-xl p-6 xs:p-8 shadow-lg'
    }
    return 'p-6 xs:p-8'
  }

  return (
    <section 
      className={`w-full shadow-neon rounded-xl animate-fade-in ${getPaddingClass()}`}
      style={getBackgroundStyle()}
    >
      <div className="px-4 xs:px-6 sm:px-8">
        <div className={`max-w-4xl mx-auto ${getContainerClass()} ${getTextAlignmentClass()}`}>
          {/* Icon */}
          {showIcon && (
            <div className="mb-4">
              <Text
                propName="sectionIcon"
                value={sectionIcon}
                renderBlock={(props) => (
                  <span className="text-4xl xs:text-5xl sm:text-6xl filter drop-shadow-lg">
                    {props.children}
                  </span>
                )}
                placeholder="📅"
              />
            </div>
          )}

          {/* Title */}
          <Text
            propName="sectionTitle"
            value={sectionTitle}
            renderBlock={(props) => (
              <h2 
                className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold mb-4 xs:mb-6"
                style={{ color: titleColor.color }}
              >
                {props.children}
              </h2>
            )}
            placeholder="🏓 Ready to Play?"
          />

          {/* Description */}
          <Text
            propName="sectionDescription"
            value={sectionDescription}
            renderBlock={(props) => (
              <p 
                className="text-fluid-base xs:text-fluid-lg leading-relaxed mb-6 xs:mb-8 max-w-2xl mx-auto"
                style={{ color: descriptionColor.color }}
              >
                {props.children}
              </p>
            )}
            placeholder="Book your virtual golf experience today and enjoy great food while you play!"
          />

          {/* CTA Buttons */}
          <div className="flex flex-col xs:flex-row gap-4 items-center justify-center">
            {/* Primary Button */}
            <Link
              href={ctaButtonLink}
              className={`${getButtonClass()} text-fluid-base xs:text-fluid-lg px-6 xs:px-8 py-3 xs:py-4 inline-flex items-center gap-2 touch-target rounded-xl transition-all duration-300 hover:scale-105`}
            >
              <span>🏓</span>
              <Text
                propName="ctaButtonText"
                value={ctaButtonText}
                renderBlock={(props) => (
                  <span>{props.children}</span>
                )}
                placeholder="Book Now"
              />
            </Link>

            {/* Secondary Button */}
            {showSecondaryButton && secondaryButtonText && (
              <Link
                href={secondaryButtonLink || '/menu'}
                className="border-2 border-gray-400 text-gray-300 hover:border-neonCyan hover:text-neonCyan transition-all duration-300 font-semibold text-fluid-base xs:text-fluid-lg px-6 xs:px-8 py-3 xs:py-4 inline-flex items-center gap-2 touch-target rounded-xl hover:scale-105"
              >
                <span>🍽️</span>
                <Text
                  propName="secondaryButtonText"
                  value={secondaryButtonText}
                  renderBlock={(props) => (
                    <span>{props.children}</span>
                  )}
                  placeholder="View Menu"
                />
              </Link>
            )}
          </div>

          {/* Decorative Element */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-neonCyan rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-neonPink rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 bg-neonYellow rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
BookingsSection.schema = {
  name: 'bookings-section',
  label: 'Bookings Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    sectionTitle: '🏓 Ready to Play?',
    sectionDescription: 'Book your virtual golf experience today and enjoy great food while you play!',
    ctaButtonText: 'Book Now',
    ctaButtonLink: '/bookings',
    backgroundColor: '#0f0f0f',
    titleColor: { color: '#ffffff' },
    descriptionColor: { color: '#d1d5db' },
    buttonStyle: 'neon',
    sectionPadding: 'md',
    showIcon: true,
    sectionIcon: '📅',
    textAlignment: 'center',
    enableGlassEffect: true,
    showSecondaryButton: false,
    secondaryButtonText: 'View Menu',
    secondaryButtonLink: '/menu'
  }),

  sideEditProps: [
    {
      groupName: 'Content & Layout',
      defaultOpen: true,
      props: [
        {
          name: 'ctaButtonLink',
          label: 'Primary Button Link',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'textAlignment',
          label: 'Text Alignment',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ],
          },
        },
        {
          name: 'sectionPadding',
          label: 'Section Padding',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Background & Design',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('backgroundColor', 'Background Color', {
          presetColors: BACKGROUND_PALETTE,
          includeTransparency: true
        }),
        {
          name: 'backgroundImage',
          label: 'Background Image',
          type: types.SideEditPropType.Image,
          imageOptions: {
            maxWidth: 2000,
            quality: 85,
          },
        },
        {
          name: 'enableGlassEffect',
          label: 'Enable Glass Effect',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
    {
      groupName: 'Typography & Colors',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('titleColor', 'Title Color', {
          presetColors: TEXT_PALETTE
        }),
        createAdvancedColorProp('descriptionColor', 'Description Color', {
          presetColors: TEXT_PALETTE
        }),
      ],
    },
    {
      groupName: 'Button Settings',
      defaultOpen: false,
      props: [
        {
          name: 'buttonStyle',
          label: 'Primary Button Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'neon', label: 'Neon Effect' },
              { value: 'solid', label: 'Solid' },
              { value: 'outline', label: 'Outline' },
              { value: 'gradient', label: 'Gradient' },
            ],
          },
        },
        {
          name: 'showSecondaryButton',
          label: 'Show Secondary Button',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'secondaryButtonLink',
          label: 'Secondary Button Link',
          type: types.SideEditPropType.Text,
          show: (props) => props.showSecondaryButton,
        },
      ],
    },
    {
      groupName: 'Icon Settings',
      defaultOpen: false,
      props: [
        {
          name: 'showIcon',
          label: 'Show Icon',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
  ],
}

export default BookingsSection