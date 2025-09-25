import React, { useState, useEffect } from 'react'
import { Text, types, useAdminContext } from 'react-bricks/frontend'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase-client'
import { createAdvancedColorProp } from '../components/colorPickerUtils'

//========================================
// Menu Category Panel Component
// Individual category card with database linking and exact current styling
//========================================

interface MenuCategoryPanelProps {
  // Content Properties
  categoryName: types.TextValue
  categoryDescription: types.TextValue
  categoryIcon: types.TextValue
  categoryId: string
  categoryLink: string
  
  // Content Display Controls
  showName: boolean
  showDescription: boolean
  showIcon: boolean
  
  // Layout & Styling
  contentAlignment: 'left' | 'center' | 'right'
  cardBackground: { color: string }
  nameColor: { color: string }
  descriptionColor: { color: string }
  borderColor: { color: string }
  
  // Advanced Styling
  customPadding: 'sm' | 'md' | 'lg' | 'xl'
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  borderWidth: 'none' | 'thin' | 'medium' | 'thick'
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong'
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

const MenuCategoryPanel: types.Brick<MenuCategoryPanelProps> = ({
  // Content
  categoryName,
  categoryDescription,
  categoryIcon,
  categoryId = '',
  categoryLink = '/ordering',
  
  // Visibility
  showName = true,
  showDescription = true,
  showIcon = true,
  
  // Layout
  contentAlignment = 'center',
  
  // Styling - Exact current values
  cardBackground = { color: 'rgba(0, 0, 0, 0.4)' },
  nameColor = { color: '#00ffff' },
  descriptionColor = { color: '#d1d5db' },
  borderColor = { color: 'rgba(0, 255, 255, 0.3)' },
  
  // Advanced
  customPadding = 'md',
  borderRadius = 'xl',
  borderWidth = 'thin',
  shadowIntensity = 'medium'
}) => {
  
  const [_categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  
  // Fetch categories for admin dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data } = await supabase
          .from('menu_categories')
          .select('id, name, description')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
        
        if (data) {
          setCategories(data)
          
          // Find selected category
          if (categoryId) {
            const found = data.find(cat => cat.id === categoryId)
            setSelectedCategory(found || null)
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    fetchCategories()
  }, [categoryId])

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

  const getBorderWidthClass = () => {
    switch (borderWidth) {
      case 'none': return 'border-0'
      case 'thin': return 'border'
      case 'medium': return 'border-2'
      case 'thick': return 'border-4'
      default: return 'border'
    }
  }

  const getShadowClass = () => {
    switch (shadowIntensity) {
      case 'none': return ''
      case 'subtle': return 'shadow-sm'
      case 'medium': return 'shadow-lg'
      case 'strong': return 'shadow-2xl'
      default: return 'shadow-lg'
    }
  }

  const getAlignmentClass = () => {
    switch (contentAlignment) {
      case 'left': return 'text-left items-start'
      case 'right': return 'text-right items-end'
      case 'center': return 'text-center items-center'
      default: return 'text-center items-center'
    }
  }

  // Get final link - Navigate to ordering page with category selection
  const getFinalLink = () => {
    // PRIORITY 1: Use category ID parameter for ordering page navigation
    if (categoryId && categoryId.trim()) {
      return `/ordering?category=${categoryId}`;
    }
    
    // PRIORITY 2: Fallback to manual categoryLink only if it's specifically set to ordering-related path
    if (categoryLink && (categoryLink.includes('/ordering') || categoryLink.includes('category'))) {
      return categoryLink;
    }
    
    // PRIORITY 3: Default fallback to ordering page
    return '/ordering';
  }

  // Get display values - prefer database content if linked
  const getDisplayName = () => {
    if (selectedCategory && !categoryName) {
      return selectedCategory.name
    }
    return categoryName || selectedCategory?.name || 'Category Name'
  }

  const getDisplayDescription = () => {
    if (selectedCategory && !categoryDescription) {
      return selectedCategory.description || ''
    }
    return categoryDescription || selectedCategory?.description || ''
  }

  // Use admin context to detect edit mode - prevents navigation in React Bricks editor
  const { isAdmin } = useAdminContext()

  // Content that will be wrapped conditionally
  const panelContent = (
    <>
      {/* Category Content */}
      <div className={`flex flex-col ${getAlignmentClass()}`}>
        
        {/* Category Icon Section */}
        {showIcon && (
          <div 
            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-3 sm:mb-4 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm border border-neonCyan/20 group-hover:border-neonPink/40 transition-all duration-300"
          >
            <Text
              propName="categoryIcon"
              value={categoryIcon}
              placeholder="🍽️"
              renderBlock={(props) => (
                <span className="text-2xl sm:text-3xl lg:text-4xl">
                  {props.children}
                </span>
              )}
            />
          </div>
        )}
        
        {/* Category Name */}
        {showName && (
          <Text
            propName="categoryName"
            value={getDisplayName()}
            placeholder={selectedCategory?.name || "Category Name"}
            renderBlock={(props) => (
              <h3 
                className="text-lg sm:text-xl font-bold group-hover:text-neonPink transition-colors duration-300 mb-2"
                style={{ color: nameColor.color }}
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
            value={getDisplayDescription()}
            placeholder={selectedCategory?.description || "Category description"}
            renderBlock={(props) => (
              <p 
                className="text-xs sm:text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300 line-clamp-3"
                style={{ color: descriptionColor.color }}
              >
                {props.children}
              </p>
            )}
          />
        )}
        
        {/* Hover Effect Glow - Exact from current design */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </>
  )

  // Conditionally wrap with Link only if not in admin/edit mode
  if (isAdmin) {
    return (
      <div
        className={`menu-category-panel group relative backdrop-blur-md border hover:border-neonPink/50 transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in h-full block ${getPaddingClass()} ${getBorderRadiusClass()} ${getBorderWidthClass()} ${getShadowClass()}`}
        style={{ 
          background: cardBackground.color,
          backdropFilter: 'blur(10px)',
          borderColor: borderColor.color,
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
        }}
      >
        {panelContent}
      </div>
    )
  }

  return (
    <Link
      href={getFinalLink()}
      className={`menu-category-panel group relative backdrop-blur-md border hover:border-neonPink/50 transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in h-full block ${getPaddingClass()} ${getBorderRadiusClass()} ${getBorderWidthClass()} ${getShadowClass()}`}
      style={{ 
        background: cardBackground.color,
        backdropFilter: 'blur(10px)',
        borderColor: borderColor.color,
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
      }}
    >
      {panelContent}
    </Link>
  )
}

//========================================
// React Bricks Schema Configuration
//========================================

MenuCategoryPanel.schema = {
  name: 'menu-category-panel',
  label: 'Menu Category Panel',
  category: 'Menu Components',
  tags: ['menu', 'category', 'panel', 'card'],
  
  // Hide from add menu (only used as repeater item)
  hideFromAddMenu: true,
  
  // Default props - Exact current styling
  getDefaultProps: () => ({
    categoryName: '',
    categoryDescription: '',
    categoryIcon: '🍽️',
    categoryId: '',
    categoryLink: '/ordering',
    showName: true,
    showDescription: true,
    showIcon: true,
    contentAlignment: 'center',
    cardBackground: { color: 'rgba(0, 0, 0, 0.4)' },
    nameColor: { color: '#00ffff' },
    descriptionColor: { color: '#d1d5db' },
    borderColor: { color: 'rgba(0, 255, 255, 0.3)' },
    customPadding: 'md',
    borderRadius: 'xl',
    borderWidth: 'thin',
    shadowIntensity: 'medium'
  }),

  // Property Controls for Admin Editing
  sideEditProps: [
    {
      groupName: 'Database Link',
      defaultOpen: true,
      props: [
        {
          name: 'categoryId',
          label: 'Link to Database Category',
          type: types.SideEditPropType.Text,
          validate: (value) => value?.length <= 50,
        },
        {
          name: 'categoryLink',
          label: 'Base Link URL (only used if no Category ID)',
          type: types.SideEditPropType.Text,
        }
      ]
    },
    {
      groupName: 'Content',
      defaultOpen: true,
      props: [
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
          name: 'customPadding',
          label: 'Card Padding',
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
      groupName: 'Card Styling',
      defaultOpen: false,
      props: [
        createAdvancedColorProp('cardBackground', 'Card Background'),
        createAdvancedColorProp('nameColor', 'Name Color'),
        createAdvancedColorProp('descriptionColor', 'Description Color'),
        createAdvancedColorProp('borderColor', 'Border Color'),
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
              { value: 'xl', label: 'Extra Large' }
            ]
          }
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
              { value: 'thick', label: 'Thick' }
            ]
          }
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
              { value: 'strong', label: 'Strong' }
            ]
          }
        }
      ]
    }
  ]
}

export default MenuCategoryPanel