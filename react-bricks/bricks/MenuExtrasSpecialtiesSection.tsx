import React from 'react'
import { Text, Repeater, types } from 'react-bricks/frontend'
import { createAdvancedColorProp } from '../components/colorPickerUtils'

//========================================
// Menu Extras & Specialties Section Component
// Exact replica of "Extras & Specialties" section from current menu page
//========================================

interface MenuExtrasSpecialtiesSectionProps {
  // Section Header Properties
  sectionTitle: types.TextValue
  leftEmoji: types.TextValue
  rightEmoji: types.TextValue
  
  // Content Control
  showTitle: boolean
  showEmojis: boolean
  
  // Layout & Styling
  sectionBackground: { color: string }
  titleColor: { color: string }
  contentAlignment: 'left' | 'center' | 'right'
  sectionPadding: 'sm' | 'md' | 'lg' | 'xl'
  
  // Advanced Styling
  borderStyle: 'none' | 'top' | 'bottom' | 'both'
  borderColor: { color: string }
  _backgroundOverlay: number
}

const MenuExtrasSpecialtiesSection: types.Brick<MenuExtrasSpecialtiesSectionProps> = ({
  // Content
  sectionTitle,
  leftEmoji,
  rightEmoji,
  
  // Visibility
  showTitle = true,
  showEmojis = true,
  
  // Styling
  sectionBackground = { color: 'rgba(17, 24, 39, 0.5)' }, // gray-900/50
  titleColor = { color: '#ffffff' },
  contentAlignment = 'center',
  sectionPadding = 'lg',
  
  // Advanced
  borderStyle = 'both',
  borderColor = { color: 'rgba(55, 65, 81, 0.5)' }, // gray-700/50
  _backgroundOverlay = 0.5
}) => {
  
  const getPaddingClass = () => {
    switch (sectionPadding) {
      case 'sm': return 'py-4 sm:py-6'
      case 'md': return 'py-6 sm:py-8'
      case 'lg': return 'py-6 sm:py-8'
      case 'xl': return 'py-8 sm:py-12'
      default: return 'py-6 sm:py-8'
    }
  }

  const getAlignmentClass = () => {
    switch (contentAlignment) {
      case 'left': return 'text-left'
      case 'right': return 'text-right'
      case 'center': return 'text-center'
      default: return 'text-center'
    }
  }

  const getBorderClass = () => {
    const baseClass = 'border-gray-700/50'
    switch (borderStyle) {
      case 'top': return `border-t ${baseClass}`
      case 'bottom': return `border-b ${baseClass}`
      case 'both': return `border-y ${baseClass}`
      case 'none': return ''
      default: return `border-y ${baseClass}`
    }
  }

  return (
    <div className="w-full">
      <div 
        className={`bg-gray-900/50 ${getBorderClass()} ${getPaddingClass()}`}
        style={{
          backgroundColor: sectionBackground.color,
          borderColor: borderColor.color
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          {showTitle && (
            <div className={`mb-6 sm:mb-8 ${getAlignmentClass()}`}>
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                {showEmojis && (
                  <Text
                    propName="leftEmoji"
                    value={leftEmoji}
                    placeholder="✨"
                    renderBlock={(props) => (
                      <span className="text-2xl sm:text-3xl">
                        {props.children}
                      </span>
                    )}
                  />
                )}
                
                <Text
                  propName="sectionTitle"
                  value={sectionTitle}
                  placeholder="Extras & Specialties"
                  renderBlock={(props) => (
                    <h2 
                      className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent"
                      style={{ color: titleColor.color }}
                    >
                      {props.children}
                    </h2>
                  )}
                />
                
                {showEmojis && (
                  <Text
                    propName="rightEmoji"
                    value={rightEmoji}
                    placeholder="✨"
                    renderBlock={(props) => (
                      <span className="text-2xl sm:text-3xl">
                        {props.children}
                      </span>
                    )}
                  />
                )}
              </div>
            </div>
          )}

          {/* Category Panels Grid - Using Enhanced CategoryCard like Homepage */}
          <div className="grid-responsive-4-centered max-w-7xl mx-auto">
            <Repeater
              propName="categoryPanels"
              items={[
                {
                  categoryName: 'Monna & Rassie\'s Corner',
                  categoryDescription: 'Kids menu and family favorites',
                  categoryIcon: '👶',
                  categoryId: '550e8400-e29b-41d4-a716-446655440009', // Auto-linked to database
                  showName: true,
                  showDescription: true,
                  showIcon: true,
                  showImage: true,
                  cardStyle: 'glass',
                  cardColor: 'neon'
                },
                {
                  categoryName: 'Extras',
                  categoryDescription: 'Additional extras and bread options',
                  categoryIcon: '🍞',
                  categoryId: '550e8400-e29b-41d4-a716-446655440005', // Auto-linked to database
                  showName: true,
                  showDescription: true,
                  showIcon: true,
                  showImage: true,
                  cardStyle: 'glass',
                  cardColor: 'neon'
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

//========================================
// React Bricks Schema Configuration
//========================================

MenuExtrasSpecialtiesSection.schema = {
  name: 'menu-extras-specialties-section',
  label: 'Menu Extras & Specialties Section',
  category: 'Menu Components',
  tags: ['menu', 'extras', 'specialties', 'section'],
  
  // Default props - Exact current content
  getDefaultProps: () => ({
    sectionTitle: 'Extras & Specialties',
    leftEmoji: '✨',
    rightEmoji: '✨',
    showTitle: true,
    showEmojis: true,
    sectionBackground: { color: 'rgba(17, 24, 39, 0.5)' },
    titleColor: { color: '#ffffff' },
    contentAlignment: 'center',
    sectionPadding: 'lg',
    borderStyle: 'both',
    borderColor: { color: 'rgba(55, 65, 81, 0.5)' },
    _backgroundOverlay: 0.5,
    categoryPanels: [
      {
        categoryName: 'Monna & Rassie\'s Corner',
        categoryDescription: 'Kids menu and family favorites',
        categoryIcon: '👶',
        categoryId: '550e8400-e29b-41d4-a716-446655440009', // Auto-linked to database
        showName: true,
        showDescription: true,
        showIcon: true
      },
      {
        categoryName: 'Extras',
        categoryDescription: 'Additional items and sides',
        categoryIcon: '🍰',
        categoryId: '550e8400-e29b-41d4-a716-446655440010', // Auto-linked to database
        showName: true,
        showDescription: true,
        showIcon: true
      }
    ]
  }),

  // Property Controls for Admin Editing
  sideEditProps: [
    {
      groupName: 'Content',
      defaultOpen: true,
      props: [
        {
          name: 'showTitle',
          label: 'Show Title',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'showEmojis', 
          label: 'Show Emojis',
          type: types.SideEditPropType.Boolean,
        }
      ]
    },
    {
      groupName: 'Layout',
      defaultOpen: false,
      props: [
        {
          name: 'contentAlignment',
          label: 'Content Alignment',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' }
            ]
          }
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
              { value: 'xl', label: 'Extra Large' }
            ]
          }
        }
      ]
    },
    {
      groupName: 'Styling',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('sectionBackground', 'Section Background'),
        createAdvancedColorProp('titleColor', 'Title Color'),
        {
          name: 'borderStyle',
          label: 'Border Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'none', label: 'None' },
              { value: 'top', label: 'Top Only' },
              { value: 'bottom', label: 'Bottom Only' },
              { value: 'both', label: 'Top & Bottom' }
            ]
          }
        },
        createAdvancedColorProp('borderColor', 'Border Color'),
        {
          name: '_backgroundOverlay',
          label: 'Background Overlay',
          type: types.SideEditPropType.Range,
          rangeOptions: {
            min: 0,
            max: 1,
            step: 0.1,
          }
        }
      ]
    }
  ],

  // Repeater items
  repeaterItems: [
    {
      name: 'categoryPanels',
      itemType: 'category-card',
      itemLabel: 'Category Panel'
    }
  ]
}

export default MenuExtrasSpecialtiesSection