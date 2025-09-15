import React from 'react'
import { Text, types } from 'react-bricks/rsc'
import Link from 'next/link'

//========================================
// Main Component: Menu Hero Section
//========================================
interface MenuHeroProps {
  heroTitle: types.TextValue
  heroSubtitle: types.TextValue
  heroDescription?: types.TextValue
  ctaButtonText: types.TextValue
  ctaButtonLink: string
  secondaryButtonText?: types.TextValue
  secondaryButtonLink?: string
  showSecondaryButton: boolean
  backgroundColor: string
  titleColor: { color: string }
  subtitleColor: { color: string }
  descriptionColor: { color: string }
  buttonStyle: 'neon' | 'solid' | 'outline' | 'gradient'
  heroStyle: 'minimal' | 'decorative' | 'full'
  backgroundImage?: types.IImageSource
  showEmojis: boolean
  heroEmoji: types.TextValue
  textAlignment: 'left' | 'center' | 'right'
}

const MenuHero: types.Brick<MenuHeroProps> = ({
  heroTitle,
  heroSubtitle,
  heroDescription,
  ctaButtonText,
  ctaButtonLink = '/menu',
  secondaryButtonText,
  secondaryButtonLink = '/menu/modern',
  showSecondaryButton = false,
  backgroundColor = '#0f0f0f',
  titleColor = { color: '#ffffff' },
  subtitleColor = { color: '#d1d5db' },
  descriptionColor = { color: '#d1d5db' },
  buttonStyle = 'neon',
  heroStyle = 'decorative',
  backgroundImage,
  showEmojis = true,
  heroEmoji,
  textAlignment = 'center'
}) => {
  const getButtonClass = () => {
    switch (buttonStyle) {
      case 'neon': return 'neon-button'
      case 'solid': return 'bg-neonCyan text-black hover:bg-neonPink transition-all duration-300 font-semibold'
      case 'outline': return 'border-2 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black transition-all duration-300 font-semibold'
      case 'gradient': return 'bg-gradient-to-r from-neonCyan to-neonPink text-black hover:from-neonPink hover:to-neonYellow transition-all duration-300 font-semibold'
      default: return 'neon-button'
    }
  }

  const getHeroClass = () => {
    switch (heroStyle) {
      case 'minimal': return 'py-8 sm:py-12'
      case 'decorative': return 'py-12 sm:py-16 lg:py-20'
      case 'full': return 'py-16 sm:py-20 lg:py-24'
      default: return 'py-12 sm:py-16 lg:py-20'
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

  const getContentMaxWidth = () => {
    switch (heroStyle) {
      case 'minimal': return 'max-w-2xl'
      case 'decorative': return 'max-w-4xl'
      case 'full': return 'max-w-6xl'
      default: return 'max-w-4xl'
    }
  }

  return (
    <section 
      className={`w-full shadow-neon rounded-xl animate-fade-in ${getHeroClass()}`}
      style={getBackgroundStyle()}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={`${getContentMaxWidth()} mx-auto ${getTextAlignmentClass()}`}>
          {/* Hero Title */}
          <Text
            propName="heroTitle"
            value={heroTitle}
            renderBlock={(props) => (
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-neonCyan via-neonBlue to-neonPink bg-clip-text text-transparent mb-4 flex items-center justify-center gap-2 sm:gap-4"
                style={{ color: titleColor.color }}
              >
                {showEmojis && (
                  <Text
                    propName="heroEmoji"
                    value={heroEmoji}
                    renderBlock={(emojiProps) => (
                      <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
                        {emojiProps.children}
                      </span>
                    )}
                    placeholder="🍽️"
                  />
                )}
                <span>{props.children}</span>
                {showEmojis && (
                  <Text
                    propName="heroEmoji"
                    value={heroEmoji}
                    renderBlock={(emojiProps) => (
                      <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
                        {emojiProps.children}
                      </span>
                    )}
                    placeholder="🍽️"
                  />
                )}
              </h1>
            )}
            placeholder="Our Full Menu"
          />

          {/* Hero Subtitle */}
          <Text
            propName="heroSubtitle"
            value={heroSubtitle}
            renderBlock={(props) => (
              <h2 
                className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6"
                style={{ color: subtitleColor.color }}
              >
                {props.children}
              </h2>
            )}
            placeholder="Organized by category for easy browsing"
          />

          {/* Hero Description */}
          {heroDescription && (
            <Text
              propName="heroDescription"
              value={heroDescription}
              renderBlock={(props) => (
                <p 
                  className="text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 max-w-3xl mx-auto"
                  style={{ color: descriptionColor.color }}
                >
                  {props.children}
                </p>
              )}
              placeholder="Discover our carefully crafted menu items, made fresh daily with the finest ingredients."
            />
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Primary Button */}
            <Link
              href={ctaButtonLink}
              className={`${getButtonClass()} text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center gap-3 touch-target rounded-xl transition-all duration-300 hover:scale-105`}
            >
              <span className="text-xl sm:text-2xl">🍽️</span>
              <Text
                propName="ctaButtonText"
                value={ctaButtonText}
                renderBlock={(props) => (
                  <span>{props.children}</span>
                )}
                placeholder="View Menu"
              />
            </Link>

            {/* Secondary Button */}
            {showSecondaryButton && secondaryButtonText && (
              <Link
                href={secondaryButtonLink || '/menu/modern'}
                className="border-2 border-gray-400 text-gray-300 hover:border-neonCyan hover:text-neonCyan transition-all duration-300 font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center gap-3 touch-target rounded-xl hover:scale-105"
              >
                <span className="text-xl sm:text-2xl">📱</span>
                <Text
                  propName="secondaryButtonText"
                  value={secondaryButtonText}
                  renderBlock={(props) => (
                    <span>{props.children}</span>
                  )}
                  placeholder="Modern View"
                />
              </Link>
            )}
          </div>

          {/* Decorative Elements */}
          {heroStyle === 'decorative' && (
            <div className="mt-8 sm:mt-12 flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-neonCyan rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-neonPink rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-neonYellow rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          )}

          {/* Full Hero Extra Content */}
          {heroStyle === 'full' && (
            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                <h3 className="text-lg font-semibold text-neonCyan mb-1">Premium Quality</h3>
                <p className="text-sm text-gray-400">Fresh ingredients daily</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">⚡</div>
                <h3 className="text-lg font-semibold text-neonPink mb-1">Fast Service</h3>
                <p className="text-sm text-gray-400">Quick preparation</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">❤️</div>
                <h3 className="text-lg font-semibold text-neonYellow mb-1">Made with Love</h3>
                <p className="text-sm text-gray-400">Crafted with care</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
MenuHero.schema = {
  name: 'menu-hero',
  label: 'Menu Hero Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    heroTitle: 'Our Full Menu',
    heroSubtitle: 'Organized by category for easy browsing',
    heroDescription: 'Discover our carefully crafted menu items, made fresh daily with the finest ingredients.',
    ctaButtonText: 'View Menu',
    ctaButtonLink: '/menu',
    secondaryButtonText: 'Modern View',
    secondaryButtonLink: '/menu/modern',
    showSecondaryButton: false,
    backgroundColor: '#0f0f0f',
    titleColor: { color: '#ffffff' },
    subtitleColor: { color: '#d1d5db' },
    descriptionColor: { color: '#d1d5db' },
    buttonStyle: 'neon',
    heroStyle: 'decorative',
    showEmojis: true,
    heroEmoji: '🍽️',
    textAlignment: 'center'
  }),

  sideEditProps: [
    {
      groupName: 'Content & Layout',
      defaultOpen: true,
      props: [
        {
          name: 'heroStyle',
          label: 'Hero Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'minimal', label: 'Minimal' },
              { value: 'decorative', label: 'Decorative' },
              { value: 'full', label: 'Full Features' },
            ],
          },
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
          name: 'showEmojis',
          label: 'Show Emojis',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
    {
      groupName: 'Background & Design',
      defaultOpen: false,
      props: [
        {
          name: 'backgroundColor',
          label: 'Background Color',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'backgroundImage',
          label: 'Background Image',
          type: types.SideEditPropType.Image,
          imageOptions: {
            maxWidth: 2000,
            quality: 85,
          },
        },
      ],
    },
    {
      groupName: 'Typography & Colors',
      defaultOpen: false,
      props: [
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
        },
        {
          name: 'subtitleColor',
          label: 'Subtitle Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Color,
            options: [
              { value: { color: '#d1d5db' }, label: 'Light Gray' },
              { value: { color: '#ffffff' }, label: 'White' },
              { value: { color: '#00ffff' }, label: 'Neon Cyan' },
            ],
          },
        },
        {
          name: 'descriptionColor',
          label: 'Description Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Color,
            options: [
              { value: { color: '#d1d5db' }, label: 'Light Gray' },
              { value: { color: '#ffffff' }, label: 'White' },
              { value: { color: '#9ca3af' }, label: 'Medium Gray' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Button Settings',
      defaultOpen: false,
      props: [
        {
          name: 'ctaButtonLink',
          label: 'Primary Button Link',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'buttonStyle',
          label: 'Button Style',
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
  ],
}

export default MenuHero