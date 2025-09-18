import React from 'react'
import { Text, Repeater, types, Image } from 'react-bricks/frontend'
import Link from 'next/link'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Nested Component: Menu Category Card
//========================================
interface MenuCategoryCardProps {
  // Content Properties
  categoryName: types.TextValue
  categoryDescription: types.TextValue
  categoryIcon: types.TextValue
  categoryImage?: types.IImageSource
  categoryLink: string
  
  // Content Display Controls
  showName: boolean
  showDescription: boolean
  showIcon: boolean
  showImage: boolean
  
  // Layout & Positioning
  contentAlignment: 'left' | 'center' | 'right'
  imagePosition: 'background' | 'icon' | 'top'
  
  // Card Style
  cardStyle: 'glass' | 'solid' | 'gradient' | 'minimal'
  cardBackground: { color: string }
  nameColor: { color: string }
  descriptionColor: { color: string }
  borderColor: { color: string }
  
  // Advanced Styling
  customPadding: 'sm' | 'md' | 'lg' | 'xl'
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  borderWidth: 'none' | 'thin' | 'medium' | 'thick'
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong'
  
  // Image Effects
  imageOpacity: number
  imageBlur: 'none' | 'sm' | 'md' | 'lg'
}

const MenuCategoryCard: types.Brick<MenuCategoryCardProps> = ({
  // Content
  categoryName,
  categoryDescription,
  categoryIcon,
  categoryImage,
  categoryLink = '/menu/modern',
  
  // Visibility
  showName = true,
  showDescription = true,
  showIcon = true,
  showImage = false,
  
  // Layout
  contentAlignment = 'center',
  imagePosition = 'icon',
  
  // Styling
  cardStyle = 'glass',
  cardBackground = { color: 'transparent' },
  nameColor = { color: '#00ffff' },
  descriptionColor = { color: '#d1d5db' },
  borderColor = { color: '#00ffff' },
  
  // Advanced
  customPadding = 'md',
  borderRadius = 'xl',
  borderWidth = 'thin',
  shadowIntensity = 'medium',
  
  // Image Effects
  imageOpacity = 0.3,
  imageBlur = 'none'
}) => {
  
  const getPaddingClass = () => {
    switch (customPadding) {
      case 'sm': return 'p-3 sm:p-4'
      case 'md': return 'p-4 sm:p-6'
      case 'lg': return 'p-6 sm:p-8'
      case 'xl': return 'p-8 sm:p-10'
      default: return 'p-4 sm:p-6'
    }
  }

  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case 'none': return 'rounded-none'
      case 'sm': return 'rounded-sm'
      case 'md': return 'rounded-md'
      case 'lg': return 'rounded-lg'
      case 'xl': return 'rounded-xl'
      default: return 'rounded-xl'
    }
  }

  const getCardStyleClass = () => {
    switch (cardStyle) {
      case 'glass': return 'bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50'
      case 'solid': return 'bg-gray-800 border border-gray-600 hover:border-neonCyan/50'
      case 'gradient': return 'bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-neonCyan/30 hover:border-neonPink/50'
      case 'minimal': return 'border border-gray-700 hover:border-neonCyan/50'
      default: return 'bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50'
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

  const getShadowClass = () => {
    switch (shadowIntensity) {
      case 'none': return ''
      case 'subtle': return 'shadow-sm'
      case 'medium': return 'shadow-lg'
      case 'strong': return 'shadow-2xl shadow-neonCyan/20'
      default: return 'shadow-lg'
    }
  }

  const getCardStyle = () => {
    const style: React.CSSProperties = {}
    
    if (cardBackground?.color && cardBackground.color !== 'transparent') {
      style.backgroundColor = cardBackground.color
    }
    
    const borderWidthMap: Record<string, string> = {
      'none': '0px',
      'thin': '1px',
      'medium': '2px', 
      'thick': '3px'
    }
    
    if (borderWidth !== 'none') {
      style.borderWidth = borderWidthMap[borderWidth]
      style.borderColor = borderColor.color
    }
    
    if (cardStyle === 'glass') {
      style.background = 'rgba(0, 0, 0, 0.4)'
      style.backdropFilter = 'blur(10px)'
      style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
    }
    
    return style
  }

  const getImageStyle = () => {
    const style: React.CSSProperties = {}
    
    if (imagePosition === 'background') {
      style.opacity = imageOpacity
      
      const blurMap: Record<string, string> = {
        'none': 'blur(0)',
        'sm': 'blur(2px)',
        'md': 'blur(4px)',
        'lg': 'blur(8px)'
      }
      style.filter = blurMap[imageBlur]
    }
    
    return style
  }

  return (
    <div className="category-card flex-none w-72 sm:w-80">
      <Link
        href={categoryLink}
        className={`group relative ${getCardStyleClass()} ${getPaddingClass()} ${getBorderRadiusClass()} ${getShadowClass()} transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in w-full h-full block`}
        style={getCardStyle()}
        prefetch={true}
      >
        {/* Background Image */}
        {showImage && categoryImage && imagePosition === 'background' && (
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
            <Image
              propName="categoryImage"
              source={categoryImage}
              alt="Category background"
              imageStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                ...getImageStyle()
              }}
            />
          </div>
        )}

        {/* Main Content Container */}
        <div className={`relative z-10 h-full flex flex-col ${getContentAlignmentClass()}`}>
          
          {/* Top Image (if positioned at top) */}
          {showImage && categoryImage && imagePosition === 'top' && (
            <div className="mb-4">
              <Image
                propName="categoryImage"
                source={categoryImage}
                alt="Category image"
                imageStyle={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  ...getImageStyle()
                }}
              />
            </div>
          )}

          {/* Icon Section */}
          {showIcon && (
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-3 sm:mb-4 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm border border-neonCyan/20 group-hover:border-neonPink/40 transition-all duration-300"
            >
              <Text
                propName="categoryIcon"
                value={categoryIcon}
                renderBlock={(props) => (
                  <span className="text-2xl sm:text-3xl lg:text-4xl filter drop-shadow-lg">
                    {props.children}
                  </span>
                )}
                placeholder="🍕"
              />
            </div>
          )}
          
          {/* Category Name */}
          {showName && (
            <Text
              propName="categoryName"
              value={categoryName}
              renderBlock={(props) => (
                <h3 
                  className="text-lg sm:text-xl font-bold group-hover:text-neonPink transition-colors duration-300 mb-2"
                  style={{ color: nameColor.color }}
                >
                  {props.children}
                </h3>
              )}
              placeholder="Category Name"
            />
          )}
          
          {/* Category Description */}
          {showDescription && (
            <Text
              propName="categoryDescription"
              value={categoryDescription}
              renderBlock={(props) => (
                <p 
                  className="text-xs sm:text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300 line-clamp-3"
                  style={{ color: descriptionColor.color }}
                >
                  {props.children}
                </p>
              )}
              placeholder="Category description"
            />
          )}
          
          {/* Hover Effect Glow */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </Link>
    </div>
  )
}

//========================================
// MenuCategoryCard Schema with Professional Architecture
//========================================
MenuCategoryCard.schema = {
  name: 'menu-category-card',
  label: 'Menu Category Card',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    categoryName: 'Category Name',
    categoryDescription: 'Category description',
    categoryIcon: '🍕',
    categoryLink: '/menu/modern',
    showName: true,
    showDescription: true,
    showIcon: true,
    showImage: false,
    contentAlignment: 'center',
    imagePosition: 'icon',
    cardStyle: 'glass',
    cardBackground: { color: 'transparent' },
    nameColor: { color: '#00ffff' },
    descriptionColor: { color: '#d1d5db' },
    borderColor: { color: '#00ffff' },
    customPadding: 'md',
    borderRadius: 'xl',
    borderWidth: 'thin',
    shadowIntensity: 'medium',
    imageOpacity: 0.3,
    imageBlur: 'none'
  }),

  sideEditProps: [
    // Group 1: Content Display
    {
      groupName: 'Content Display',
      defaultOpen: true,
      props: [
        {
          name: 'showName',
          label: 'Show Category Name',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showDescription',
          label: 'Show Description',
          type: types.SideEditPropType.Boolean,
        },
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
          name: 'categoryLink',
          label: 'Category Link',
          type: types.SideEditPropType.Text,
        },
      ],
    },

    // Group 2: Card Style & Colors
    {
      groupName: 'Card Style & Colors',
      defaultOpen: false,
      props: [
        {
          name: 'cardStyle',
          label: 'Card Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'glass', label: 'Glass Effect' },
              { value: 'solid', label: 'Solid' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'minimal', label: 'Minimal' },
            ],
          },
        },
        createAdvancedColorProp('cardBackground', 'Card Background', { presetColors: BACKGROUND_PALETTE }),
        createAdvancedColorProp('nameColor', 'Name Color', { presetColors: TEXT_PALETTE }),
        createAdvancedColorProp('descriptionColor', 'Description Color', { presetColors: TEXT_PALETTE }),
        createAdvancedColorProp('borderColor', 'Border Color', { presetColors: TEXT_PALETTE })
      ]
    },

    // Group 3: Layout & Positioning
    {
      groupName: 'Layout & Positioning',
      defaultOpen: false,
      props: [
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
          name: 'imagePosition',
          label: 'Image Position',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'background', label: 'Background' },
              { value: 'icon', label: 'Icon Only' },
              { value: 'top', label: 'Top' },
            ],
          },
          show: (props) => props.showImage,
        },
        {
          name: 'customPadding',
          label: 'Card Padding',
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

    // Group 4: Image Effects
    {
      groupName: 'Image Effects',
      defaultOpen: false,
      props: [
        {
          name: 'imageOpacity',
          label: 'Image Opacity',
          type: types.SideEditPropType.Range,
          rangeOptions: {
            min: 0,
            max: 1,
            step: 0.1,
          },
          show: (props) => props.showImage && props.imagePosition === 'background',
        },
        {
          name: 'imageBlur',
          label: 'Image Blur',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ],
          },
          show: (props) => props.showImage && props.imagePosition === 'background',
        },
      ],
    },

    // Group 5: Advanced Styling
    {
      groupName: 'Advanced Styling',
      defaultOpen: false,
      props: [
        {
          name: 'borderRadius',
          label: 'Border Radius',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'xl', label: 'Extra Large' },
            ],
          },
        },
        {
          name: 'borderWidth',
          label: 'Border Width',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'thin', label: 'Thin' },
              { value: 'medium', label: 'Medium' },
              { value: 'thick', label: 'Thick' },
            ],
          },
        },
        {
          name: 'shadowIntensity',
          label: 'Shadow Intensity',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'subtle', label: 'Subtle' },
              { value: 'medium', label: 'Medium' },
              { value: 'strong', label: 'Strong' },
            ],
          },
        },
      ],
    },
  ],
}

//========================================
// Main Component: Menu Section
//========================================
interface MenuSectionProps {
  // Content Properties
  sectionTitle: types.TextValue
  leftEmoji: types.TextValue
  rightEmoji: types.TextValue
  sectionSubtitle?: types.TextValue
  
  // Content Display Controls
  showTitle: boolean
  showEmojis: boolean
  showSubtitle: boolean
  showCategories: boolean
  
  // Layout & Positioning
  sectionAlignment: 'left' | 'center' | 'right'
  categoriesLayout: 'centered' | 'grid' | 'flex'
  sectionPadding: 'sm' | 'md' | 'lg' | 'xl'
  
  // Colors & Styling
  backgroundColor: string | { color: string }
  backgroundImage?: types.IImageSource
  titleColor: { color: string }
  subtitleColor: { color: string }
  borderColor: { color: string }
  
  // Advanced Styling
  sectionStyle: 'minimal' | 'bordered' | 'elevated' | 'full-width'
  textShadow: 'none' | 'subtle' | 'strong'
  backgroundOverlay: number
  borderStyle: 'none' | 'top-bottom' | 'full' | 'gradient'
}

const MenuSection: types.Brick<MenuSectionProps> = ({
  // Content
  sectionTitle,
  leftEmoji,
  rightEmoji,
  sectionSubtitle,
  
  // Display Controls
  showTitle = true,
  showEmojis = true,
  showSubtitle = false,
  showCategories = true,
  
  // Layout
  sectionAlignment = 'center',
  categoriesLayout = 'centered',
  sectionPadding = 'lg',
  
  // Colors
  backgroundColor = 'transparent',
  backgroundImage,
  titleColor = { color: '#00ffff' },
  subtitleColor = { color: '#d1d5db' },
  borderColor = { color: '#374151' },
  
  // Advanced
  sectionStyle = 'bordered',
  textShadow = 'subtle',
  backgroundOverlay = 0.5,
  borderStyle = 'top-bottom'
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

  const getSectionAlignmentClass = () => {
    switch (sectionAlignment) {
      case 'left': return 'text-left'
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  const getCategoriesLayoutClass = () => {
    switch (categoriesLayout) {
      case 'centered': return 'flex flex-wrap justify-center gap-4 sm:gap-6'
      case 'grid': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
      case 'flex': return 'flex flex-wrap gap-4 sm:gap-6'
      default: return 'flex flex-wrap justify-center gap-4 sm:gap-6'
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

  const getSectionStyleClass = () => {
    switch (sectionStyle) {
      case 'minimal': return ''
      case 'bordered': return 'border-gray-700/50'
      case 'elevated': return 'shadow-lg'
      case 'full-width': return 'bg-gray-900/50'
      default: return 'border-gray-700/50'
    }
  }

  const getBorderStyleClass = () => {
    switch (borderStyle) {
      case 'none': return ''
      case 'top-bottom': return 'border-y'
      case 'full': return 'border'
      case 'gradient': return 'border-y border-gradient-to-r from-neonCyan/20 via-neonPink/20 to-neonCyan/20'
      default: return 'border-y'
    }
  }

  const getBackgroundStyle = () => {
    const bgColor = typeof backgroundColor === 'string' ? backgroundColor : backgroundColor?.color || 'transparent'
    const baseStyle = bgColor !== 'transparent' ? { backgroundColor: bgColor } : {}
    
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

  return (
    <div className="w-full">
      <div 
        className={`${getSectionStyleClass()} ${getBorderStyleClass()} ${getPaddingClass()}`}
        style={{
          ...getBackgroundStyle(),
          borderColor: borderColor.color
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className={`mb-6 sm:mb-8 ${getSectionAlignmentClass()}`}>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
              {showEmojis && (
                <Text
                  propName="leftEmoji"
                  value={leftEmoji}
                  renderBlock={(props) => (
                    <span className="text-2xl sm:text-3xl">
                      {props.children}
                    </span>
                  )}
                  placeholder="☕"
                />
              )}
              
              {showTitle && (
                <Text
                  propName="sectionTitle"
                  value={sectionTitle}
                  renderBlock={(props) => (
                    <h2 
                      className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent ${getTextShadowClass()}`}
                      style={{ color: titleColor.color }}
                    >
                      {props.children}
                    </h2>
                  )}
                  placeholder="Drinks & Beverages"
                />
              )}
              
              {showEmojis && (
                <Text
                  propName="rightEmoji"
                  value={rightEmoji}
                  renderBlock={(props) => (
                    <span className="text-2xl sm:text-3xl">
                      {props.children}
                    </span>
                  )}
                  placeholder="☕"
                />
              )}
            </div>
            
            {showSubtitle && sectionSubtitle && (
              <Text
                propName="sectionSubtitle"
                value={sectionSubtitle}
                renderBlock={(props) => (
                  <p 
                    className={`text-sm sm:text-base text-gray-400 ${getTextShadowClass()}`}
                    style={{ color: subtitleColor.color }}
                  >
                    {props.children}
                  </p>
                )}
                placeholder="Section description"
              />
            )}
          </div>

          {/* Categories Grid/Layout */}
          {showCategories && (
            <div className={getCategoriesLayoutClass()}>
              <Repeater
                propName="categories"
                items={[]}
                renderWrapper={(items) => <>{items}</>}
                renderItemWrapper={(item) => item}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

//========================================
// MenuSection Schema with Professional Architecture
//========================================
MenuSection.schema = {
  name: 'menu-section',
  label: 'Menu Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    sectionTitle: 'Drinks & Beverages',
    leftEmoji: '☕',
    rightEmoji: '☕',
    sectionSubtitle: 'Section description',
    showTitle: true,
    showEmojis: true,
    showSubtitle: false,
    showCategories: true,
    sectionAlignment: 'center',
    categoriesLayout: 'centered',
    sectionPadding: 'lg',
    backgroundColor: 'transparent',
    titleColor: { color: '#00ffff' },
    subtitleColor: { color: '#d1d5db' },
    borderColor: { color: '#374151' },
    sectionStyle: 'bordered',
    textShadow: 'subtle',
    backgroundOverlay: 0.5,
    borderStyle: 'top-bottom'
  }),

  sideEditProps: [
    // Group 1: Content Display
    {
      groupName: 'Content Display',
      defaultOpen: true,
      props: [
        {
          name: 'showTitle',
          label: 'Show Section Title',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showEmojis',
          label: 'Show Emojis',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showSubtitle',
          label: 'Show Subtitle',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showCategories',
          label: 'Show Categories',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },

    // Group 2: Section Style & Layout
    {
      groupName: 'Section Style & Layout',
      defaultOpen: false,
      props: [
        {
          name: 'sectionStyle',
          label: 'Section Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'minimal', label: 'Minimal' },
              { value: 'bordered', label: 'Bordered' },
              { value: 'elevated', label: 'Elevated' },
              { value: 'full-width', label: 'Full Width' },
            ],
          },
        },
        {
          name: 'sectionAlignment',
          label: 'Section Alignment',
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
          name: 'categoriesLayout',
          label: 'Categories Layout',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'centered', label: 'Centered' },
              { value: 'grid', label: 'Grid' },
              { value: 'flex', label: 'Flexible' },
            ],
          },
          show: (props) => props.showCategories,
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
          'borderColor',
          'Border Color',
          { presetColors: TEXT_PALETTE }
        ),
      ],
    },

    // Group 4: Advanced Styling
    {
      groupName: 'Advanced Styling',
      defaultOpen: false,
      props: [
        {
          name: 'borderStyle',
          label: 'Border Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'top-bottom', label: 'Top & Bottom' },
              { value: 'full', label: 'Full Border' },
              { value: 'gradient', label: 'Gradient' },
            ],
          },
        },
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

  repeaterItems: [
    {
      name: 'categories',
      itemType: 'menu-category-card',
      itemLabel: 'Category',
      min: 0,
      max: 10,
    },
  ],
}

export default MenuSection
export { MenuCategoryCard }
