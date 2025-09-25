import React from 'react'
import { Text, Repeater, types } from 'react-bricks/frontend'
import Link from 'next/link'

//========================================
// Nested Component: Menu Category Card
//========================================
interface MenuCategoryCardProps {
  categoryName: types.TextValue
  categoryDescription: types.TextValue
  categoryIcon: types.TextValue
  categoryLink: string
  itemCount?: types.TextValue
  cardStyle: 'glass' | 'solid' | 'gradient' | 'neon'
  hoverEffect: 'scale' | 'glow' | 'lift' | 'both'
  showItemCount: boolean
}

const MenuCategoryCard: types.Brick<MenuCategoryCardProps> = ({
  categoryName,
  categoryDescription,
  categoryIcon,
  categoryLink = '/ordering',
  itemCount,
  cardStyle = 'glass',
  hoverEffect = 'both',
  showItemCount = false
}) => {
  const getCardStyleClass = () => {
    switch (cardStyle) {
      case 'glass': return 'bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50'
      case 'solid': return 'bg-gray-800/90 border border-gray-600 hover:border-neonCyan/50'
      case 'gradient': return 'bg-gradient-to-br from-black/30 to-gray-900/30 border border-neonCyan/20 hover:border-neonPink/40'
      case 'neon': return 'bg-black/10 border-2 border-neonCyan hover:border-neonPink shadow-neon'
      default: return 'bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50'
    }
  }

  const getHoverClass = () => {
    switch (hoverEffect) {
      case 'scale': return 'hover:scale-105'
      case 'glow': return 'hover:shadow-neon'
      case 'lift': return 'hover:-translate-y-2'
      case 'both': return 'hover:scale-105 hover:shadow-neon'
      default: return 'hover:scale-105 hover:shadow-neon'
    }
  }

  return (
    <Link href={categoryLink} className="block category-card flex-none w-72 sm:w-80">
      <div
        className={`group relative ${getCardStyleClass()} p-4 sm:p-6 rounded-xl shadow-lg transition-all duration-300 ${getHoverClass()} animate-fade-in w-full h-full`}
        style={{ 
          backdropFilter: cardStyle === 'glass' ? 'blur(10px)' : undefined,
          boxShadow: cardStyle === 'glass' ? '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)' : undefined,
          minHeight: '200px'
        }}
      >
        {/* Category Content */}
        <div className="flex flex-col items-center text-center h-full">
          {/* Icon Container */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-3 sm:mb-4 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm border border-neonCyan/20 group-hover:border-neonPink/40 transition-all duration-300">
            <Text
              propName="categoryIcon"
              value={categoryIcon}
              renderBlock={(props) => (
                <span className="text-2xl sm:text-3xl lg:text-4xl">
                  {props.children}
                </span>
              )}
              placeholder="🍽️"
            />
          </div>
          
          {/* Category Name */}
          <Text
            propName="categoryName"
            value={categoryName}
            renderBlock={(props) => (
              <h3 className="text-lg sm:text-xl font-bold text-neonCyan group-hover:text-neonPink transition-colors duration-300 mb-2">
                {props.children}
              </h3>
            )}
            placeholder="Category Name"
          />
          
          {/* Item Count Badge */}
          {showItemCount && itemCount && (
            <Text
              propName="itemCount"
              value={itemCount}
              renderBlock={(props) => (
                <span className="px-2 py-1 text-xs font-semibold bg-neonCyan/20 text-neonCyan rounded-full border border-neonCyan/30 mb-2">
                  {props.children} items
                </span>
              )}
              placeholder="12"
            />
          )}
          
          {/* Category Description */}
          <Text
            propName="categoryDescription"
            value={categoryDescription}
            renderBlock={(props) => (
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300 line-clamp-3 flex-grow flex items-center">
                {props.children}
              </p>
            )}
            placeholder="Category description"
          />
        </div>
        
        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </Link>
  )
}

MenuCategoryCard.schema = {
  name: 'menu-category-card',
  label: 'Menu Category Card',
  getDefaultProps: () => ({
    categoryName: 'Category Name',
    categoryDescription: 'Description of menu items in this category',
    categoryIcon: '🍽️',
    categoryLink: '/menu',
    itemCount: '12',
    cardStyle: 'glass',
    hoverEffect: 'both',
    showItemCount: false
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
          name: 'cardStyle',
          label: 'Card Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'glass', label: 'Glass Effect' },
              { value: 'solid', label: 'Solid' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'neon', label: 'Neon Border' },
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
              { value: 'lift', label: 'Lift Only' },
              { value: 'both', label: 'Scale + Glow' },
            ],
          },
        },
        {
          name: 'showItemCount',
          label: 'Show Item Count',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
  ],
}

//========================================
// Nested Component: Menu Section
//========================================
interface MenuSectionProps {
  sectionTitle: types.TextValue
  sectionIcon: types.TextValue
  categories: types.RepeaterItems
  sectionBackground: string
  showSectionHeader: boolean
}

const MenuSection: types.Brick<MenuSectionProps> = ({
  sectionTitle,
  sectionIcon,
  categories,
  sectionBackground = 'rgba(17, 24, 39, 0.5)',
  showSectionHeader = true
}) => {
  return (
    <div className="w-full">
      <div 
        className="border-y border-gray-700/50 py-6 sm:py-8"
        style={{ backgroundColor: sectionBackground }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          {showSectionHeader && (
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                <Text
                  propName="sectionIcon"
                  value={sectionIcon}
                  renderBlock={(props) => (
                    <span className="text-2xl sm:text-3xl">{props.children}</span>
                  )}
                  placeholder="🍽️"
                />
                <Text
                  propName="sectionTitle"
                  value={sectionTitle}
                  renderBlock={(props) => (
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
                      {props.children}
                    </h2>
                  )}
                  placeholder="Menu Section"
                />
                <Text
                  propName="sectionIcon"
                  value={sectionIcon}
                  renderBlock={(props) => (
                    <span className="text-2xl sm:text-3xl">{props.children}</span>
                  )}
                  placeholder="🍽️"
                />
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
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
      </div>
    </div>
  )
}

MenuSection.schema = {
  name: 'menu-section',
  label: 'Menu Section',
  getDefaultProps: () => ({
    sectionTitle: 'Drinks & Beverages',
    sectionIcon: '☕',
    sectionBackground: 'rgba(17, 24, 39, 0.5)',
    showSectionHeader: true,
    categories: []
  }),
  hideFromAddMenu: true,
  repeaterItems: [
    {
      name: 'categories',
      itemType: 'menu-category-card',
      itemLabel: 'Category',
      min: 0,
      max: 20
    }
  ],
  sideEditProps: [
    {
      groupName: 'Section Settings',
      defaultOpen: true,
      props: [
        {
          name: 'sectionBackground',
          label: 'Background Color',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'showSectionHeader',
          label: 'Show Section Header',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
  ],
}

//========================================
// Main Component: Full Menu Display
//========================================
interface MenuDisplayProps {
  menuTitle: types.TextValue
  menuSubtitle: types.TextValue
  menuSections: types.RepeaterItems
  backgroundColor: string
  titleColor: { color: string }
  subtitleColor: { color: string }
  showViewAllButton: boolean
  viewAllButtonText: types.TextValue
  viewAllButtonLink: string
  backgroundImage?: types.IImageSource
}

const MenuDisplay: types.Brick<MenuDisplayProps> = ({
  menuTitle,
  menuSubtitle,
  menuSections,
  backgroundColor = '#0f0f0f',
  titleColor = { color: '#ffffff' },
  subtitleColor = { color: '#d1d5db' },
  showViewAllButton = true,
  viewAllButtonText,
  viewAllButtonLink = '/menu',
  backgroundImage
}) => {
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
    <main 
      className="py-4 sm:py-8 overflow-x-hidden min-h-screen"
      style={getBackgroundStyle()}
    >
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 px-4 sm:px-6">
        <Text
          propName="menuTitle"
          value={menuTitle}
          renderBlock={(props) => (
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-neonCyan via-neonBlue to-neonPink bg-clip-text text-transparent mb-4 flex items-center justify-center gap-2 sm:gap-4"
              style={{ color: titleColor.color }}
            >
              <span className="text-2xl sm:text-3xl lg:text-4xl">🍽️</span>
              <span>{props.children}</span>
              <span className="text-2xl sm:text-3xl lg:text-4xl">🍽️</span>
            </h1>
          )}
          placeholder="Our Full Menu"
        />
        
        <Text
          propName="menuSubtitle"
          value={menuSubtitle}
          renderBlock={(props) => (
            <p 
              className="text-sm sm:text-base lg:text-lg"
              style={{ color: subtitleColor.color }}
            >
              {props.children}
            </p>
          )}
          placeholder="Organized by category for easy browsing"
        />
      </div>

      {/* Menu Sections */}
      <div className="space-y-6 sm:space-y-12">
        <Repeater
          propName="menuSections"
          items={menuSections}
          renderWrapper={(items) => (
            <>
              {items}
            </>
          )}
        />
      </div>

      {/* View All Items Button */}
      {showViewAllButton && (
        <div className="flex justify-center mt-8 sm:mt-12 px-4">
          <Link
            href={viewAllButtonLink}
            className="neon-button group relative bg-black/20 backdrop-blur-md border border-neonCyan/50 hover:border-neonPink/70 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-neonCyan hover:text-neonPink transition-all duration-300 hover:scale-105 hover:shadow-neon text-sm sm:text-base"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
            }}
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">🍽️</span>
              <Text
                propName="viewAllButtonText"
                value={viewAllButtonText}
                renderBlock={(props) => (
                  <span>{props.children}</span>
                )}
                placeholder="Browse All Menu Items"
              />
              <span className="text-2xl">🍽️</span>
            </span>
          </Link>
        </div>
      )}
    </main>
  )
}

//========================================
// Brick Schema with Professional Sidebar Controls
//========================================
MenuDisplay.schema = {
  name: 'menu-display',
  label: 'Menu Display',
  category: 'Little Latte Lane',
  
  getDefaultProps: () => ({
    menuTitle: 'Our Full Menu',
    menuSubtitle: 'Organized by category for easy browsing',
    backgroundColor: '#0f0f0f',
    titleColor: { color: '#ffffff' },
    subtitleColor: { color: '#d1d5db' },
    showViewAllButton: true,
    viewAllButtonText: 'Browse All Menu Items',
    viewAllButtonLink: '/menu',
    menuSections: [
      {
        type: 'menu-section',
        props: {
          sectionTitle: 'Drinks & Beverages',
          sectionIcon: '☕',
          sectionBackground: 'rgba(17, 24, 39, 0.5)',
          showSectionHeader: true,
          categories: [
            {
              type: 'menu-category-card',
              props: {
                categoryName: 'Hot Drinks',
                categoryDescription: 'Premium coffee, hot chocolate, and specialty teas',
                categoryIcon: '☕',
                categoryLink: '/menu/hot-drinks',
                itemCount: '15',
                cardStyle: 'glass',
                hoverEffect: 'both',
                showItemCount: true
              }
            },
            {
              type: 'menu-category-card',
              props: {
                categoryName: 'Lattes',
                categoryDescription: 'Creamy lattes with various flavors and seasonal specials',
                categoryIcon: '🍮',
                categoryLink: '/menu/lattes',
                itemCount: '12',
                cardStyle: 'glass',
                hoverEffect: 'both',
                showItemCount: true
              }
            },
            {
              type: 'menu-category-card',
              props: {
                categoryName: 'Smoothies',
                categoryDescription: 'Fresh fruit smoothies and protein blends',
                categoryIcon: '🍓',
                categoryLink: '/menu/smoothies',
                itemCount: '8',
                cardStyle: 'glass',
                hoverEffect: 'both',
                showItemCount: true
              }
            }
          ]
        }
      },
      {
        type: 'menu-section',
        props: {
          sectionTitle: 'Main Food',
          sectionIcon: '🍕',
          sectionBackground: 'rgba(17, 24, 39, 0.5)',
          showSectionHeader: true,
          categories: [
            {
              type: 'menu-category-card',
              props: {
                categoryName: 'Pizzas',
                categoryDescription: 'Wood-fired pizzas with fresh ingredients',
                categoryIcon: '🍕',
                categoryLink: '/menu/pizzas',
                itemCount: '10',
                cardStyle: 'glass',
                hoverEffect: 'both',
                showItemCount: true
              }
            },
            {
              type: 'menu-category-card',
              props: {
                categoryName: 'Toasties',
                categoryDescription: 'Grilled sandwiches and paninis',
                categoryIcon: '🥪',
                categoryLink: '/menu/toasties',
                itemCount: '6',
                cardStyle: 'glass',
                hoverEffect: 'both',
                showItemCount: true
              }
            }
          ]
        }
      }
    ]
  }),

  repeaterItems: [
    {
      name: 'menuSections',
      itemType: 'menu-section',
      itemLabel: 'Menu Section',
      min: 1,
      max: 10
    }
  ],

  sideEditProps: [
    {
      groupName: 'Background & Layout',
      defaultOpen: true,
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

export default MenuDisplay
export { MenuCategoryCard, MenuSection }
