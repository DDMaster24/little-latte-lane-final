import React from 'react'
import { Text, Repeater, types, Image, useAdminContext } from 'react-bricks/frontend'
import Link from 'next/link'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'
import { useMenuCategories } from '@/hooks/useMenuCategories'

//========================================
// Nested Component: Category Card
//========================================
interface CategoryCardProps {
  // Content Properties
  categoryName: types.TextValue
  categoryDescription: types.TextValue
  categoryIcon: types.TextValue
  categoryBadge?: types.TextValue
  categoryImage?: types.IImageSource
  categoryLink: string
  categoryId?: string  // NEW: Link to database category

  // Content Display Controls
  showName: boolean
  showDescription: boolean
  showIcon: boolean
  showBadge: boolean
  showImage: boolean

  // Layout & Positioning
  contentAlignment: 'left' | 'center' | 'right'
  titlePosition: 'top' | 'middle' | 'bottom'
  imagePosition: 'background' | 'top' | 'side' | 'overlay' | 'content'

  // Card Style
  cardStyle: 'glass' | 'solid' | 'gradient' | 'minimal'
  cardColor: 'neon' | 'pink' | 'cyan' | 'yellow'
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
  imageObjectPosition: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  // Legacy props for backward compatibility
  _hoverEffect?: 'scale' | 'glow' | 'both'
  iconSize?: 'sm' | 'md' | 'lg'
}

const CategoryCard: types.Brick<CategoryCardProps> = ({ 
  // Content
  categoryName,
  categoryDescription,
  categoryIcon,
  categoryBadge,
  categoryImage,
  categoryLink = '/menu',
  categoryId = '', // NEW: Database category link
  
  // Visibility
  showName = true,
  showDescription = true,
  showIcon = true,
  showBadge = false,
  showImage = false,
  
  // Positioning
  contentAlignment = 'center',
  titlePosition = 'top',
  imagePosition = 'content',
  
  // Basic Styling
  cardStyle = 'glass',
  cardColor = 'neon',
  cardBackground = { color: 'transparent' },
  nameColor = { color: '#00ffff' },
  descriptionColor = { color: '#d1d5db' },
  borderColor = { color: '#00ffff' },
  
  // Advanced Styling
  customPadding = 'md',
  borderRadius = 'lg',
  borderWidth = 'thin',
  shadowIntensity = 'medium',
  
  // Image Styling
  imageOpacity = 0.3,
  imageBlur = 'none',
  imageObjectPosition = 'center',
  
  // Legacy props
  _hoverEffect = 'both',
  iconSize = 'md'
}) => {
  // Fetch database category data if categoryId is provided
  const { categories } = useMenuCategories()
  const dbCategory = categoryId ? categories.find(cat => cat.id === categoryId) : null
  
  // Use database data if available, otherwise fall back to manual input
  const effectiveName = dbCategory ? dbCategory.name : categoryName
  const effectiveDescription = dbCategory ? dbCategory.description || '' : categoryDescription
  const effectiveLink = dbCategory ? `/menu/modern?category=${dbCategory.id}` : categoryLink

  // Enhanced styling functions (similar to WelcomeCard)
  const getCardStyleClass = () => {
    const baseClasses = ['group', 'relative', 'transition-all', 'duration-300', 'hover:scale-105', 'touch-target', 'block']
    
    // Border radius
    const radiusMap: Record<string, string> = {
      'none': 'rounded-none',
      'sm': 'rounded-sm',
      'md': 'rounded-md', 
      'lg': 'rounded-xl',
      'xl': 'rounded-2xl'
    }
    baseClasses.push(radiusMap[borderRadius])

    // Shadow
    const shadowMap: Record<string, string> = {
      'none': '',
      'subtle': 'shadow-sm',
      'medium': 'shadow-lg',
      'strong': 'shadow-2xl shadow-neon'
    }
    if (shadowMap[shadowIntensity]) {
      baseClasses.push(shadowMap[shadowIntensity])
    }

    // Card style base
    switch (cardStyle) {
      case 'glass':
        baseClasses.push('bg-black/20', 'backdrop-blur-md', 'hover:border-neonPink/50')
        break
      case 'solid':
        baseClasses.push('bg-gray-800/90', 'hover:border-neonCyan/50')
        break
      case 'gradient':
        baseClasses.push('bg-gradient-to-br', 'from-black/30', 'to-gray-900/30', 'hover:border-neonPink/40')
        break
      case 'minimal':
        baseClasses.push('bg-transparent', 'hover:bg-black/10')
        break
    }

    return baseClasses.join(' ')
  }

  const getCardStyle = () => {
    const style: React.CSSProperties = {}
    
    // Custom background color
    if (cardBackground?.color && cardBackground.color !== 'transparent') {
      style.backgroundColor = cardBackground.color
    }
    
    // Border styling
    const borderWidthMap: Record<string, string> = {
      'none': '0px',
      'thin': '1px', 
      'medium': '2px',
      'thick': '3px'
    }
    
    if (borderWidth !== 'none') {
      style.borderWidth = borderWidthMap[borderWidth]
      style.borderStyle = 'solid'
      style.borderColor = borderColor?.color || '#00ffff'
    }

    // Glass effect styling
    if (cardStyle === 'glass') {
      style.backdropFilter = 'blur(10px)'
      style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
    }

    // Minimum height and padding
    const paddingMap: Record<string, string> = {
      'sm': '12px',
      'md': '16px 24px',
      'lg': '20px 32px', 
      'xl': '28px 40px'
    }
    style.padding = paddingMap[customPadding]
    style.minHeight = '200px'

    return style
  }

  const getColorAccent = () => {
    switch (cardColor) {
      case 'neon': return 'text-neonCyan group-hover:text-neonPink'
      case 'pink': return 'text-neonPink group-hover:text-neonYellow'
      case 'cyan': return 'text-neonCyan group-hover:text-white'
      case 'yellow': return 'text-neonYellow group-hover:text-neonPink'
      default: return 'text-neonCyan group-hover:text-neonPink'
    }
  }

  const getContentAlignmentClass = () => {
    switch (contentAlignment) {
      case 'left': return 'text-left'
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  }

  const getImageStyle = () => {
    const style: React.CSSProperties = {}
    
    // Object position for better image positioning
    const objectPositionMap: Record<string, string> = {
      'center': 'center center',
      'top': 'center top',
      'bottom': 'center bottom',
      'left': 'left center',
      'right': 'right center',
      'top-left': 'left top',
      'top-right': 'right top',
      'bottom-left': 'left bottom',
      'bottom-right': 'right bottom'
    }
    style.objectPosition = objectPositionMap[imageObjectPosition] || 'center center'
    
    if (imagePosition === 'background') {
      style.opacity = imageOpacity
      
      // Image blur effect
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

  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'sm': return 'text-2xl xs:text-3xl'
      case 'md': return 'text-2xl xs:text-3xl sm:text-4xl'
      case 'lg': return 'text-3xl xs:text-4xl sm:text-5xl'
      default: return 'text-2xl xs:text-3xl sm:text-4xl'
    }
  }

  // Use admin context to detect edit mode
  const { isAdmin } = useAdminContext()

  // Card content that will be wrapped conditionally
  const cardContent = (
    <>
      {/* Background Image (if enabled and positioned as background) */}
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

        {/* Header with Icon/Image and Badge */}
        <div className="flex items-start justify-between mb-3">
          {(showIcon || showImage) && (
            <div className="w-full h-20 xs:h-24 sm:h-32 bg-gradient-to-br from-neonCyan/10 to-neonPink/10 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:from-neonCyan/20 group-hover:to-neonPink/20 transition-all duration-300 border border-neonCyan/20 hover:border-neonPink/50 relative overflow-hidden">
              {/* Image Upload (when enabled and showImage is true) */}
              {showImage && (
                <Image
                  propName="categoryImage"
                  source={categoryImage}
                  alt="Category image"
                  aspectRatio={4/3} // Set aspect ratio to match container proportions
                  maxWidth={400} // Reasonable max width for crisp images
                  imageStyle={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    ...getImageStyle() // Apply enhanced image styling including object-position
                  }}
                  renderWrapper={(props) => (
                    <div className="absolute inset-0">
                      {props.children}
                    </div>
                  )}
                />
              )}
              
              {/* Icon Fallback (when no image or showIcon is true) */}
              {showIcon && (!showImage || !categoryImage) && (
                <Text
                  propName="categoryIcon"
                  value={categoryIcon}
                  renderBlock={(props) => (
                    <span className={`${getIconSizeClass()} filter drop-shadow-lg relative z-10`}>
                      {props.children}
                    </span>
                  )}
                  placeholder="🍽️"
                />
              )}
              
              {/* Image Upload Overlay for Admin (when in edit mode and showImage is true) */}
              {showImage && isAdmin && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white text-sm font-medium">Click to upload image</span>
                </div>
              )}
            </div>
          )}
          
          {showBadge && categoryBadge && (
            <Text
              propName="categoryBadge"
              value={categoryBadge}
              renderBlock={(props) => (
                <span className="px-2 py-1 text-xs font-semibold bg-neonPink/20 text-neonPink rounded-full border border-neonPink/30 absolute top-2 right-2">
                  {props.children}
                </span>
              )}
              placeholder="NEW"
            />
          )}
        </div>

        {/* Content Area - Flexible positioning */}
        <div className={`flex-grow flex flex-col ${titlePosition === 'middle' ? 'justify-center' : titlePosition === 'bottom' ? 'justify-end' : 'justify-start'}`}>
          
          {/* Category Name */}
          {showName && (
            <Text
              propName="categoryName"
              value={categoryName}
              placeholder={dbCategory ? dbCategory.name : 'Category Name'}
              renderBlock={(props) => (
                <h3 
                  className={`font-semibold text-fluid-base xs:text-fluid-lg mb-2 transition-colors duration-300 ${getColorAccent()}`}
                  style={{ color: nameColor?.color }}
                  onFocus={(e) => {
                    // Prevent automatic scrolling when editing
                    e.preventDefault();
                    // Keep element in view without jumping
                    if (typeof window !== 'undefined') {
                      e.target.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
                    }
                  }}
                >
                  {props.children}
                </h3>
              )}
            />
          )}

          {/* Category Description */}
          {showDescription && (
            <Text
              propName="categoryDescription"
              value={categoryDescription}
              placeholder={dbCategory ? (dbCategory.description || 'Description from database') : 'Category Description'}
              renderBlock={(props) => (
                <p 
                  className="text-sm xs:text-base leading-relaxed"
                  style={{ color: descriptionColor?.color }}
                  onFocus={(e) => {
                    // Prevent automatic scrolling when editing
                    e.preventDefault();
                    // Keep element in view without jumping
                    if (typeof window !== 'undefined') {
                      e.target.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
                    }
                  }}
                >
                  {props.children}
                </p>
              )}
            />
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </>
  )

  // Conditionally wrap with Link only if not in admin/edit mode
  if (isAdmin) {
    return (
      <div className={getCardStyleClass()} style={getCardStyle()}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={effectiveLink} className={getCardStyleClass()} style={getCardStyle()}>
      {cardContent}
    </Link>
  )
}

CategoryCard.schema = {
  name: 'category-card',
  label: 'Category Card',
  getDefaultProps: () => ({
    // Content
    categoryName: 'Category Name',
    categoryDescription: 'Description of this category',
    categoryIcon: '🍽️',
    categoryBadge: '',
    categoryLink: '/menu',
    categoryId: '', // NEW: Database category link
    
    // Content Display
    showName: true,
    showDescription: true,
    showIcon: true,
    showBadge: false,
    showImage: true,
    
    // Layout & Positioning
    contentAlignment: 'center',
    titlePosition: 'top',
    imagePosition: 'content',
    
    // Card Style
    cardStyle: 'glass',
    cardColor: 'neon',
    cardBackground: { color: 'transparent' },
    nameColor: { color: '#00ffff' },
    descriptionColor: { color: '#d1d5db' },
    borderColor: { color: '#00ffff' },
    
    // Advanced Styling
    customPadding: 'md',
    borderRadius: 'lg',
    borderWidth: 'thin',
    shadowIntensity: 'medium',
    
    // Image Effects
    imageOpacity: 0.3,
    imageBlur: 'none',
    imageObjectPosition: 'center',
    
    // Legacy props
    hoverEffect: 'both',
    iconSize: 'md'
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    // Group 1: Content Display
    {
      groupName: 'Content Display',
      defaultOpen: true,
      props: [
        {
          name: 'categoryLink',
          label: 'Link URL',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'categoryId',
          label: 'Database Category ID',
          type: types.SideEditPropType.Text,
          validate: (_value) => {
            // Optional validation - can be empty for manual categories
            return true
          }
        },
        {
          name: 'showName',
          label: 'Show Name',
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
          name: 'showBadge',
          label: 'Show Badge',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showImage',
          label: 'Show Image',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
    
    // Group 2: Card Style
    {
      groupName: 'Card Style',
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
              { value: 'solid', label: 'Solid Background' },
              { value: 'gradient', label: 'Gradient Background' },
              { value: 'minimal', label: 'Minimal Style' },
            ],
          },
        },
        {
          name: 'cardColor',
          label: 'Card Accent Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'neon', label: 'Neon Cyan' },
              { value: 'pink', label: 'Neon Pink' },
              { value: 'cyan', label: 'Cyan Blue' },
              { value: 'yellow', label: 'Neon Yellow' },
            ],
          },
        },
        createAdvancedColorProp(
          'cardBackground',
          'Card Background',
          { presetColors: BACKGROUND_PALETTE }
        ),
        createAdvancedColorProp(
          'borderColor',
          'Border Color',
          { presetColors: TEXT_PALETTE }
        ),
      ],
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
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'left', label: 'Left Aligned' },
              { value: 'center', label: 'Center Aligned' },
              { value: 'right', label: 'Right Aligned' },
            ],
          },
        },
        {
          name: 'titlePosition',
          label: 'Title Position',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'top', label: 'Top' },
              { value: 'middle', label: 'Middle' },
              { value: 'bottom', label: 'Bottom' },
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
              { value: 'top', label: 'Top' },
              { value: 'side', label: 'Side' },
              { value: 'overlay', label: 'Overlay' },
              { value: 'content', label: 'Within Content' },
            ],
          },
          show: (props) => props.showImage,
        },
        {
          name: 'iconSize',
          label: 'Icon Size',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ],
          },
          show: (props) => props.showIcon,
        },
      ],
    },
    
    // Group 4: Colors
    {
      groupName: 'Colors',
      defaultOpen: false,
      props: [
        createAdvancedColorProp(
          'nameColor',
          'Name Color',
          { presetColors: TEXT_PALETTE }
        ),
        createAdvancedColorProp(
          'descriptionColor',
          'Description Color',
          { presetColors: TEXT_PALETTE }
        ),
      ],
    },
    
    // Group 5: Image Effects
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
              { value: 'none', label: 'No Blur' },
              { value: 'sm', label: 'Light Blur' },
              { value: 'md', label: 'Medium Blur' },
              { value: 'lg', label: 'Heavy Blur' },
            ],
          },
          show: (props) => props.showImage,
        },
        {
          name: 'imageObjectPosition',
          label: 'Image Position',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'center', label: 'Center' },
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
            ],
          },
          show: (props) => props.showImage,
        },
      ],
    },
    
    // Group 6: Advanced Settings
    {
      groupName: 'Advanced Settings',
      defaultOpen: false,
      props: [
        {
          name: 'customPadding',
          label: 'Padding',
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
        {
          name: 'borderRadius',
          label: 'Border Radius',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'No Radius' },
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
              { value: 'none', label: 'No Border' },
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
              { value: 'none', label: 'No Shadow' },
              { value: 'subtle', label: 'Subtle' },
              { value: 'medium', label: 'Medium' },
              { value: 'strong', label: 'Strong' },
            ],
          },
        },
        {
          name: 'hoverEffect',
          label: 'Hover Effect',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'scale', label: 'Scale Only' },
              { value: 'glow', label: 'Glow Only' },
              { value: 'both', label: 'Scale + Glow' },
            ],
          },
        },
        {
          name: 'categoryImage',
          label: 'Category Image',
          type: types.SideEditPropType.Image,
          imageOptions: {
            maxWidth: 400,
            quality: 90,
            aspectRatio: 4/3, // Match the category panel dimensions (landscape)
          },
          show: (props) => props.showImage,
        },
      ],
    },
  ],
}

//========================================
// Main Component: Categories Section
//========================================
interface CategoriesSectionProps {
  sectionTitle: types.TextValue
  sectionSubtitle?: types.TextValue
  categories: types.RepeaterItems
  backgroundColor: string
  titleColor: { color: string }
  subtitleColor: { color: string }
  gridLayout: '2x2' | '3x1' | '4x1' | 'auto'
  showViewAllButton: boolean
  viewAllButtonText: types.TextValue
  viewAllButtonLink: string
  sectionPadding: 'sm' | 'md' | 'lg'
  backgroundImage?: types.IImageSource
}

const CategoriesSection: types.Brick<CategoriesSectionProps> = ({
  sectionTitle,
  sectionSubtitle,
  categories,
  backgroundColor = '#0f0f0f',
  titleColor = { color: '#ffffff' },
  subtitleColor = { color: '#d1d5db' },
  gridLayout = 'auto',
  showViewAllButton = true,
  viewAllButtonText,
  viewAllButtonLink = '/menu',
  sectionPadding = 'md',
  backgroundImage
}) => {
  const getGridClass = () => {
    switch (gridLayout) {
      case '2x2': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 justify-center'
      case '3x1': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center'
      case '4x1': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-center'
      case 'auto': return 'grid-responsive-4-centered'
      default: return 'grid-responsive-4-centered'
    }
  }

  const getPaddingClass = () => {
    switch (sectionPadding) {
      case 'sm': return 'py-8 xs:py-12'
      case 'md': return 'py-8 xs:py-12'
      case 'lg': return 'py-12 xs:py-16'
      default: return 'py-8 xs:py-12'
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

  return (
    <section 
      className="w-full shadow-neon rounded-xl animate-fade-in mb-8"
      style={getBackgroundStyle()}
    >
      {/* Centered Header with Fluid Typography */}
      <div className={`text-center ${getPaddingClass()} px-6`}>
        <Text
          propName="sectionTitle"
          value={sectionTitle}
          renderBlock={(props) => (
            <h2 
              className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4"
              style={{ color: titleColor.color }}
            >
              {props.children}
            </h2>
          )}
          placeholder="🍽️ View Our Categories"
        />
        
        {sectionSubtitle && (
          <Text
            propName="sectionSubtitle"
            value={sectionSubtitle}
            renderBlock={(props) => (
              <p 
                className="text-lg max-w-2xl mx-auto"
                style={{ color: subtitleColor.color }}
              >
                {props.children}
              </p>
            )}
            placeholder="Explore our delicious offerings"
          />
        )}
      </div>

      {/* Responsive Category Grid - Mobile First Design with Enhanced Centering */}
      <div className="px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12">
        <div className={`${getGridClass()} max-w-7xl mx-auto`}>
          <Repeater
            propName="categories"
            items={categories}
            renderWrapper={(items) => (
              <>
                {items}
              </>
            )}
          />
        </div>
      </div>

      {/* Centered View Full Menu Button - Responsive */}
      {showViewAllButton && (
        <div className="text-center px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12 animate-bounce-in" style={{ animationDelay: '0.5s' }}>
          <Link
            href={viewAllButtonLink}
            className="neon-button text-fluid-base xs:text-fluid-lg px-6 xs:px-8 py-3 xs:py-4 inline-flex items-center gap-2 touch-target"
          >
            <span>🍽️</span>
            <Text
              propName="viewAllButtonText"
              value={viewAllButtonText}
              renderBlock={(props) => (
                <span>{props.children}</span>
              )}
              placeholder="View Full Menu"
            />
          </Link>
        </div>
      )}
    </section>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
CategoriesSection.schema = {
  name: 'categories-section',
  label: 'Categories Section',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    sectionTitle: '🍽️ View Our Categories',
    sectionSubtitle: '',
    backgroundColor: '#0f0f0f',
    titleColor: { color: '#ffffff' },
    subtitleColor: { color: '#d1d5db' },
    gridLayout: 'auto',
    showViewAllButton: true,
    viewAllButtonText: 'View Full Menu',
    viewAllButtonLink: '/menu',
    sectionPadding: 'md',
    categories: [
      {
        type: 'category-card',
        props: {
          categoryName: 'Drinks',
          categoryDescription: 'Premium coffee, lattes, cold drinks & smoothies',
          categoryIcon: '☕',
          categoryLink: '/menu',
          hoverEffect: 'both',
          iconSize: 'md'
        }
      },
      {
        type: 'category-card',
        props: {
          categoryName: 'Main Food',
          categoryDescription: 'Fresh pizzas, hearty meals & grilled toasties',
          categoryIcon: '🍕',
          categoryLink: '/menu',
          hoverEffect: 'both',
          iconSize: 'md'
        }
      },
      {
        type: 'category-card',
        props: {
          categoryName: 'Sides & Breakfast',
          categoryDescription: 'All-day breakfast, scones & perfect accompaniments',
          categoryIcon: '🥐',
          categoryLink: '/menu',
          hoverEffect: 'both',
          iconSize: 'md'
        }
      },
      {
        type: 'category-card',
        props: {
          categoryName: 'Extras',
          categoryDescription: 'Specialty items & unique offerings',
          categoryIcon: '🧀',
          categoryLink: '/menu',
          hoverEffect: 'both',
          iconSize: 'md'
        }
      }
    ]
  }),

  repeaterItems: [
    {
      name: 'categories',
      itemType: 'category-card',
      itemLabel: 'Category',
      min: 1,
      max: 12
    }
  ],

  sideEditProps: [
    {
      groupName: 'Background & Layout',
      defaultOpen: true,
      props: [
        createAdvancedColorProp(
          'backgroundColor',
          'Background Color',
          {
            presetColors: BACKGROUND_PALETTE
          }
        ),
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
          name: 'gridLayout',
          label: 'Grid Layout',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'auto', label: 'Auto (Responsive)' },
              { value: '2x2', label: '2x2 Grid' },
              { value: '3x1', label: '3 Columns' },
              { value: '4x1', label: '4 Columns' },
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
      groupName: 'Typography & Colors',
      defaultOpen: false,
      props: [
        createAdvancedColorProp(
          'titleColor',
          'Title Color',
          {
            presetColors: TEXT_PALETTE
          }
        ),
        createAdvancedColorProp(
          'subtitleColor',
          'Subtitle Color',
          {
            presetColors: TEXT_PALETTE
          }
        ),
      ],
    },
    {
      groupName: 'Button Settings',
      defaultOpen: false,
      props: [
        {
          name: 'showViewAllButton',
          label: 'Show View All Button',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'viewAllButtonLink',
          label: 'Button Link',
          type: types.SideEditPropType.Text,
          show: (props) => props.showViewAllButton,
        },
      ],
    },
  ],
}

export default CategoriesSection
export { CategoryCard }
