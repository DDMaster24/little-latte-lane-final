import React from 'react'
import { Text, Repeater, types } from 'react-bricks/frontend'
import Link from 'next/link'
import { createAdvancedColorProp, TEXT_PALETTE, BACKGROUND_PALETTE } from '../components/colorPickerUtils'

//========================================
// Nested Component: Category Card
//========================================
interface CategoryCardProps {
  categoryName: types.TextValue
  categoryDescription: types.TextValue
  categoryIcon: types.TextValue
  categoryLink: string
  hoverEffect: 'scale' | 'glow' | 'both'
  iconSize: 'sm' | 'md' | 'lg'
}

const CategoryCard: types.Brick<CategoryCardProps> = ({ 
  categoryName,
  categoryDescription,
  categoryIcon,
  categoryLink = '/menu',
  hoverEffect = 'both',
  iconSize = 'md'
}) => {
  const getHoverClass = () => {
    switch (hoverEffect) {
      case 'scale': return 'hover:scale-105'
      case 'glow': return 'hover:shadow-neon'
      case 'both': return 'hover:scale-105 hover:shadow-neon'
      default: return 'hover:scale-105 hover:shadow-neon'
    }
  }

  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'sm': return 'text-2xl xs:text-3xl'
      case 'md': return 'text-2xl xs:text-3xl sm:text-4xl'
      case 'lg': return 'text-3xl xs:text-4xl sm:text-5xl'
      default: return 'text-2xl xs:text-3xl sm:text-4xl'
    }
  }

  return (
    <Link href={categoryLink} className="block">
      <div
        className={`group relative backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50 rounded-xl shadow-lg transition-all duration-300 ${getHoverClass()} animate-fade-in touch-target`}
        style={{ 
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)',
          minHeight: '200px'
        }}
      >
        {/* Content Container with Responsive Padding */}
        <div className="p-4 xs:p-6 h-full flex flex-col">
          {/* Glassmorphic Icon Container - Responsive Sizing */}
          <div 
            className="w-full h-20 xs:h-24 sm:h-32 bg-gradient-to-br from-neonCyan/10 to-neonPink/10 backdrop-blur-sm rounded-lg mb-3 xs:mb-4 flex items-center justify-center group-hover:from-neonCyan/20 group-hover:to-neonPink/20 transition-all duration-300 border border-neonCyan/20 cursor-pointer hover:border-neonPink/50"
          >
            <Text
              propName="categoryIcon"
              value={categoryIcon}
              renderBlock={(props) => (
                <span 
                  className={`${getIconSizeClass()} filter drop-shadow-lg cursor-pointer`}
                >
                  {props.children}
                </span>
              )}
              placeholder="🍽️"
            />
          </div>
          
          {/* Category Title - Fluid Typography */}
          <Text
            propName="categoryName"
            value={categoryName}
            renderBlock={(props) => (
              <h3 
                className="text-neonCyan font-semibold text-center group-hover:text-neonPink transition-colors duration-300 text-fluid-base xs:text-fluid-lg mb-2 xs:mb-3 cursor-pointer hover:text-neonPink/80"
              >
                {props.children}
              </h3>
            )}
            placeholder="Category Name"
          />
          
          {/* Description - Responsive Text */}
          <Text
            propName="categoryDescription"
            value={categoryDescription}
            renderBlock={(props) => (
              <p 
                className="text-gray-300 text-fluid-xs xs:text-fluid-sm text-center leading-relaxed flex-grow flex items-center justify-center cursor-pointer hover:text-gray-100"
              >
                {props.children}
              </p>
            )}
            placeholder="Category description"
          />
        </div>
        
        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </Link>
  )
}

CategoryCard.schema = {
  name: 'category-card',
  label: 'Category Card',
  getDefaultProps: () => ({
    categoryName: 'Category Name',
    categoryDescription: 'Description of this category',
    categoryIcon: '🍽️',
    categoryLink: '/menu',
    hoverEffect: 'both',
    iconSize: 'md'
  }),
  hideFromAddMenu: true,
  sideEditProps: [
    {
      groupName: 'Card Settings',
      defaultOpen: true,
      props: [
        {
          name: 'categoryLink',
          label: 'Link URL',
          type: types.SideEditPropType.Text,
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
      case '2x2': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
      case '3x1': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      case '4x1': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      case 'auto': return 'grid-responsive-4'
      default: return 'grid-responsive-4'
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
      className="w-full shadow-neon rounded-xl animate-fade-in"
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

      {/* Responsive Category Grid - Mobile First Design */}
      <div className="px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12">
        <div className={`${getGridClass()} max-w-7xl mx-auto gap-4 md:gap-6`}>
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
