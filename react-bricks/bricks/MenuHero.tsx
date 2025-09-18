import React from 'react'
import { Text, types } from 'react-bricks/frontend'
import Link from 'next/link'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Main Component: Menu Hero Section
//========================================
interface MenuHeroProps {
  // Content Properties
  heroTitle: types.TextValue
  heroSubtitle: types.TextValue
  heroDescription?: types.TextValue
  leftEmoji: types.TextValue
  rightEmoji: types.TextValue
  
  // Button Settings
  ctaButtonText: types.TextValue
  ctaButtonLink: string
  secondaryButtonText?: types.TextValue
  secondaryButtonLink?: string
  showSecondaryButton: boolean
  
  // Content Display Controls
  showTitle: boolean
  showSubtitle: boolean
  showDescription: boolean
  showEmojis: boolean
  showButtons: boolean
  
  // Layout & Positioning
  contentAlignment: 'left' | 'center' | 'right'
  sectionPadding: 'sm' | 'md' | 'lg' | 'xl'
  
  // Colors & Styling
  backgroundColor: string | { color: string }
  backgroundImage?: types.IImageSource
  titleColor: { color: string }
  subtitleColor: { color: string }
  descriptionColor: { color: string }
  
  // Advanced Styling
  heroStyle: 'minimal' | 'decorative' | 'full'
  buttonStyle: 'neon' | 'solid' | 'outline' | 'gradient'
  textShadow: 'none' | 'subtle' | 'strong'
  backgroundOverlay: number
}

const MenuHero: types.Brick<MenuHeroProps> = ({
  // Content
  heroTitle,
  heroSubtitle,
  heroDescription,
  leftEmoji,
  rightEmoji,
  
  // Buttons
  ctaButtonText,
  ctaButtonLink = '/menu/modern',
  secondaryButtonText,
  secondaryButtonLink = '/menu/pizza',
  showSecondaryButton = false,
  
  // Display Controls
  showTitle = true,
  showSubtitle = true, 
  showDescription = false,
  showEmojis = true,
  showButtons = true,
  
  // Layout
  contentAlignment = 'center',
  sectionPadding = 'lg',
  
  // Colors
  backgroundColor = '#0f0f0f',
  backgroundImage,
  titleColor = { color: '#ffffff' },
  subtitleColor = { color: '#d1d5db' },
  descriptionColor = { color: '#d1d5db' },
  
  // Advanced
  heroStyle = 'decorative',
  buttonStyle = 'neon',
  textShadow = 'subtle',
  backgroundOverlay = 0.7
}) => {
  
  const getPaddingClass = () => {
    switch (sectionPadding) {
      case 'sm': return 'py-4 sm:py-6'
      case 'md': return 'py-6 sm:py-8'
      case 'lg': return 'py-8 sm:py-12'
      case 'xl': return 'py-12 sm:py-16'
      default: return 'py-8 sm:py-12'
    }
  }

  const getContentAlignmentClass = () => {
    switch (contentAlignment) {
      case 'left': return 'text-left items-start'
      case 'center': return 'text-center items-center'
      case 'right': return 'text-right items-end'
      default: return 'text-center items-center'
    }
  }

  const getTextShadowClass = () => {
    switch (textShadow) {
      case 'none': return ''
      case 'subtle': return 'drop-shadow-sm'
      case 'strong': return 'drop-shadow-lg'
      default: return 'drop-shadow-sm'
    }
  }

  const getButtonClass = () => {
    switch (buttonStyle) {
      case 'neon': return 'neon-button bg-black/20 backdrop-blur-md border border-neonCyan/50 hover:border-neonPink/70 text-neonCyan hover:text-neonPink hover:scale-105 hover:shadow-neon'
      case 'solid': return 'bg-neonCyan text-black hover:bg-neonPink transition-all duration-300 font-semibold hover:scale-105'
      case 'outline': return 'border-2 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black transition-all duration-300 font-semibold hover:scale-105'
      case 'gradient': return 'bg-gradient-to-r from-neonCyan to-neonPink text-black hover:from-neonPink hover:to-neonYellow transition-all duration-300 font-semibold hover:scale-105'
      default: return 'neon-button bg-black/20 backdrop-blur-md border border-neonCyan/50 hover:border-neonPink/70 text-neonCyan hover:text-neonPink hover:scale-105 hover:shadow-neon'
    }
  }

  const getBackgroundStyle = () => {
    const bgColor = typeof backgroundColor === 'string' ? backgroundColor : backgroundColor?.color || '#0f0f0f'
    const baseStyle = { backgroundColor: bgColor }
    
    if (backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `linear-gradient(rgba(0,0,0,${backgroundOverlay}), rgba(0,0,0,${backgroundOverlay})), url(${backgroundImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
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
      className={`w-full overflow-hidden ${getPaddingClass()}`}
      style={getBackgroundStyle()}
    >
      <div className="px-4 sm:px-6">
        <div className={`${getContentMaxWidth()} mx-auto flex flex-col ${getContentAlignmentClass()}`}>
          
          {/* Hero Title */}
          {showTitle && (
            <Text
              propName="heroTitle"
              value={heroTitle}
              renderBlock={(props) => (
                <h1 
                  className={`text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-neonCyan via-neonBlue to-neonPink bg-clip-text text-transparent mb-4 flex items-center justify-center gap-2 sm:gap-4 ${getTextShadowClass()}`}
                  style={{ color: titleColor.color }}
                >
                  {showEmojis && (
                    <Text
                      propName="leftEmoji"
                      value={leftEmoji}
                      renderBlock={(emojiProps) => (
                        <span className="text-2xl sm:text-3xl lg:text-4xl">
                          {emojiProps.children}
                        </span>
                      )}
                      placeholder="🍽️"
                    />
                  )}
                  <span>{props.children}</span>
                  {showEmojis && (
                    <Text
                      propName="rightEmoji"
                      value={rightEmoji}
                      renderBlock={(emojiProps) => (
                        <span className="text-2xl sm:text-3xl lg:text-4xl">
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
          )}

          {/* Hero Subtitle */}
          {showSubtitle && (
            <Text
              propName="heroSubtitle"
              value={heroSubtitle}
              renderBlock={(props) => (
                <p 
                  className={`text-gray-300 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 ${getTextShadowClass()}`}
                  style={{ color: subtitleColor.color }}
                >
                  {props.children}
                </p>
              )}
              placeholder="Organized by category for easy browsing"
            />
          )}

          {/* Hero Description */}
          {showDescription && heroDescription && (
            <Text
              propName="heroDescription"
              value={heroDescription}
              renderBlock={(props) => (
                <p 
                  className={`text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 max-w-3xl mx-auto ${getTextShadowClass()}`}
                  style={{ color: descriptionColor.color }}
                >
                  {props.children}
                </p>
              )}
              placeholder="Discover our carefully crafted menu items, made fresh daily with the finest ingredients."
            />
          )}

          {/* CTA Buttons */}
          {showButtons && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              {/* Primary Button */}
              <Link
                href={ctaButtonLink}
                className={`${getButtonClass()} text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center gap-3 touch-target rounded-xl transition-all duration-300`}
                style={{
                  background: buttonStyle === 'neon' ? 'rgba(0, 0, 0, 0.4)' : undefined,
                  backdropFilter: buttonStyle === 'neon' ? 'blur(10px)' : undefined,
                  boxShadow: buttonStyle === 'neon' ? '0 0 20px rgba(0, 255, 255, 0.2)' : undefined
                }}
              >
                <span className="text-xl sm:text-2xl">🍽️</span>
                <Text
                  propName="ctaButtonText"
                  value={ctaButtonText}
                  renderBlock={(props) => (
                    <span>{props.children}</span>
                  )}
                  placeholder="Browse All Menu Items"
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
          )}

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
// Schema with Professional 6-Group Architecture
//========================================
MenuHero.schema = {
  name: 'menu-hero',
  label: 'Menu Hero Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    heroTitle: 'Our Full Menu',
    heroSubtitle: 'Organized by category for easy browsing',
    heroDescription: 'Discover our carefully crafted menu items, made fresh daily with the finest ingredients.',
    leftEmoji: '🍽️',
    rightEmoji: '🍽️',
    ctaButtonText: 'Browse All Menu Items',
    ctaButtonLink: '/menu/modern',
    secondaryButtonText: 'Categories View',
    secondaryButtonLink: '/menu',
    showSecondaryButton: false,
    showTitle: true,
    showSubtitle: true,
    showDescription: false,
    showEmojis: true,
    showButtons: true,
    contentAlignment: 'center',
    sectionPadding: 'lg',
    backgroundColor: '#0f0f0f',
    titleColor: { color: '#ffffff' },
    subtitleColor: { color: '#d1d5db' },
    descriptionColor: { color: '#d1d5db' },
    heroStyle: 'decorative',
    buttonStyle: 'neon',
    textShadow: 'subtle',
    backgroundOverlay: 0.7
  }),

  sideEditProps: [
    // Group 1: Content Display
    {
      groupName: 'Content Display',
      defaultOpen: true,
      props: [
        {
          name: 'showTitle',
          label: 'Show Title',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showSubtitle',
          label: 'Show Subtitle',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showDescription',
          label: 'Show Description',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showEmojis',
          label: 'Show Emojis',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showButtons',
          label: 'Show Buttons',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },

    // Group 2: Hero Style & Layout
    {
      groupName: 'Hero Style & Layout',
      defaultOpen: false,
      props: [
        {
          name: 'heroStyle',
          label: 'Hero Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'minimal', label: 'Minimal' },
              { value: 'decorative', label: 'Decorative' },
              { value: 'full', label: 'Full Features' },
            ],
          },
        },
        {
          name: 'contentAlignment',
          label: 'Content Alignment',
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
              { value: 'xl', label: 'Extra Large' },
            ],
          },
        },
      ],
    },

    // Group 3: Colors & Styling
    {
      groupName: 'Colors & Styling',
      defaultOpen: false,
      props: [
        createAdvancedColorProp(
          'backgroundColor',
          'Background Color',
          { presetColors: BACKGROUND_PALETTE }
        ),
        {
          name: 'backgroundImage',
          label: 'Background Image',
          type: types.SideEditPropType.Image,
        },
        {
          name: 'backgroundOverlay',
          label: 'Background Overlay',
          type: types.SideEditPropType.Range,
          rangeOptions: {
            min: 0,
            max: 1,
            step: 0.1,
          },
          show: (props) => !!props.backgroundImage,
        },
        createAdvancedColorProp(
          'titleColor',
          'Title Color',
          { presetColors: TEXT_PALETTE }
        ),
        createAdvancedColorProp(
          'subtitleColor',
          'Subtitle Color',
          { presetColors: TEXT_PALETTE }
        ),
        createAdvancedColorProp(
          'descriptionColor',
          'Description Color',
          { presetColors: TEXT_PALETTE }
        ),
      ],
    },

    // Group 4: Button Settings
    {
      groupName: 'Button Settings',
      defaultOpen: false,
      props: [
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
          show: (props) => props.showButtons,
        },
        {
          name: 'ctaButtonLink',
          label: 'Primary Button Link',
          type: types.SideEditPropType.Text,
          show: (props) => props.showButtons,
        },
        {
          name: 'showSecondaryButton',
          label: 'Show Secondary Button',
          type: types.SideEditPropType.Boolean,
          show: (props) => props.showButtons,
        },
        {
          name: 'secondaryButtonLink',
          label: 'Secondary Button Link',
          type: types.SideEditPropType.Text,
          show: (props) => props.showSecondaryButton && props.showButtons,
        },
      ],
    },

    // Group 5: Advanced Styling
    {
      groupName: 'Advanced Styling',
      defaultOpen: false,
      props: [
        {
          name: 'textShadow',
          label: 'Text Shadow',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'subtle', label: 'Subtle' },
              { value: 'strong', label: 'Strong' },
            ],
          },
        },
      ],
    },
  ],
}

export default MenuHero
