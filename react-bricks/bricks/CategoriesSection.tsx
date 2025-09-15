import React from 'react'
import { Text, Image, Repeater, types } from 'react-bricks/rsc'

//========================================
// Nested Component: Category Card
//========================================
interface CategoryCardProps {
  image: types.IImageSource
  title: types.TextValue
  description: types.TextValue
  cardBackground: 'dark' | 'light' | 'gradient'
  titleColor: { color: string }
  descriptionColor: { color: string }
  showOverlay: boolean
  hoverEffect: 'scale' | 'glow' | 'lift'
}

const CategoryCard: types.Brick<CategoryCardProps> = ({ 
  image,
  title,
  description,
  cardBackground = 'dark',
  titleColor = { color: '#ffffff' },
  descriptionColor = { color: '#d1d5db' },
  showOverlay = true,
  hoverEffect = 'scale'
}) => {
  // Background classes
  const getCardBgClass = () => {
    switch (cardBackground) {
      case 'dark': return 'bg-gray-800'
      case 'light': return 'bg-gray-700'
      case 'gradient': return 'bg-gradient-to-br from-gray-800 to-gray-900'
      default: return 'bg-gray-800'
    }
  }

  // Hover effect classes
  const getHoverClass = () => {
    switch (hoverEffect) {
      case 'scale': return 'hover:scale-105'
      case 'glow': return 'hover:shadow-lg hover:shadow-neonCyan/20'
      case 'lift': return 'hover:-translate-y-2'
      default: return 'hover:scale-105'
    }
  }

  return (
    <div className={`${getCardBgClass()} rounded-xl overflow-hidden ${getHoverClass()} transition-all duration-300 group`}>
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <Image
          propName="image"
          source={image}
          alt="Category image"
          imageClassName="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {showOverlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <Text
          propName="title"
          value={title}
          renderBlock={(props) => (
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: titleColor.color }}
            >
              {props.children}
            </h3>
          )}
          placeholder="Category Title"
        />
        
        <Text
          propName="description"
          value={description}
          renderBlock={(props) => (
            <p 
              className="text-sm leading-relaxed"
              style={{ color: descriptionColor.color }}
            >
              {props.children}
            </p>
          )}
          placeholder="Category description..."
        />
      </div>
    </div>
  )
}

CategoryCard.schema = {
  name: 'category-card',
  label: 'Category Card',
  getDefaultProps: () => ({
    title: 'Fresh Sandwiches',
    description: 'Artisan breads with premium fillings and fresh ingredients',
    cardBackground: 'dark',
    titleColor: { color: '#ffffff' },
    descriptionColor: { color: '#d1d5db' },
    showOverlay: true,
    hoverEffect: 'scale'
  }),
  hideFromAddMenu: true, // Nested component
  sideEditProps: [
    {
      groupName: 'Card Design',
      defaultOpen: true,
      props: [
        {
          name: 'cardBackground',
          label: 'Card Background',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
              { value: 'gradient', label: 'Gradient' },
            ],
          },
        },
        {
          name: 'showOverlay',
          label: 'Show Image Overlay',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'hoverEffect',
          label: 'Hover Effect',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'scale', label: 'Scale' },
              { value: 'glow', label: 'Glow' },
              { value: 'lift', label: 'Lift' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Text Colors',
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
  ],
}

//========================================
// Main Component: Categories Section
//========================================
interface CategoriesSectionProps {
  title: types.TextValue
  subtitle: types.TextValue
  categories: types.RepeaterItems
  backgroundColor: 'dark' | 'darker' | 'gradient'
  titleColor: { color: string }
  subtitleColor: { color: string }
  columns: '2' | '3' | '4'
  spacing: 'sm' | 'md' | 'lg'
  showTitle: boolean
  sectionPadding: 'sm' | 'md' | 'lg'
}

const CategoriesSection: types.Brick<CategoriesSectionProps> = ({ 
  title,
  subtitle,
  categories,
  backgroundColor = 'dark',
  titleColor = { color: '#ffffff' },
  subtitleColor = { color: '#d1d5db' },
  columns = '3',
  spacing = 'md',
  showTitle = true,
  sectionPadding = 'md'
}) => {
  // Background classes
  const getBgClass = () => {
    switch (backgroundColor) {
      case 'dark': return 'bg-darkBg'
      case 'darker': return 'bg-gray-900'
      case 'gradient': return 'bg-gradient-to-br from-gray-900 via-darkBg to-gray-900'
      default: return 'bg-darkBg'
    }
  }

  // Column classes
  const getColumnClass = () => {
    switch (columns) {
      case '2': return 'grid-cols-1 md:grid-cols-2'
      case '3': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case '4': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  // Spacing classes
  const getSpacingClass = () => {
    switch (spacing) {
      case 'sm': return 'gap-4'
      case 'md': return 'gap-6'
      case 'lg': return 'gap-8'
      default: return 'gap-6'
    }
  }

  // Padding classes
  const getPaddingClass = () => {
    switch (sectionPadding) {
      case 'sm': return 'py-12'
      case 'md': return 'py-16'
      case 'lg': return 'py-24'
      default: return 'py-16'
    }
  }

  return (
    <section className={`${getBgClass()} ${getPaddingClass()}`}>
      <div className="container-wide">
        {/* Section Header */}
        {showTitle && (
          <div className="text-center mb-12">
            <Text
              propName="title"
              value={title}
              renderBlock={(props) => (
                <h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                  style={{ color: titleColor.color }}
                >
                  {props.children}
                </h2>
              )}
              placeholder="Our Categories"
            />
            
            <Text
              propName="subtitle"
              value={subtitle}
              renderBlock={(props) => (
                <p 
                  className="text-lg max-w-2xl mx-auto"
                  style={{ color: subtitleColor.color }}
                >
                  {props.children}
                </p>
              )}
              placeholder="Discover our range of fresh, quality offerings"
            />
          </div>
        )}

        {/* Categories Grid */}
        <div className={`grid ${getColumnClass()} ${getSpacingClass()}`}>
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
    </section>
  )
}

//========================================
// Brick Schema with Professional Controls
//========================================
CategoriesSection.schema = {
  name: 'categories-section',
  label: 'Categories Section',
  category: 'Little Latte Lane',
  
  // Defaults
  getDefaultProps: () => ({
    title: 'Our Categories',
    subtitle: 'Discover our range of fresh, quality offerings crafted with care',
    backgroundColor: 'dark',
    titleColor: { color: '#ffffff' },
    subtitleColor: { color: '#d1d5db' },
    columns: '3',
    spacing: 'md',
    showTitle: true,
    sectionPadding: 'md',
    categories: [
      {
        type: 'category-card',
        props: {
          title: 'Fresh Sandwiches',
          description: 'Artisan breads with premium fillings and fresh ingredients',
          cardBackground: 'dark',
          titleColor: { color: '#ffffff' },
          descriptionColor: { color: '#d1d5db' },
          showOverlay: true,
          hoverEffect: 'scale'
        }
      },
      {
        type: 'category-card',
        props: {
          title: 'Premium Coffee',
          description: 'Expertly roasted beans and specialty beverages',
          cardBackground: 'dark',
          titleColor: { color: '#ffffff' },
          descriptionColor: { color: '#d1d5db' },
          showOverlay: true,
          hoverEffect: 'scale'
        }
      },
      {
        type: 'category-card',
        props: {
          title: 'Sweet Treats',
          description: 'Freshly baked pastries and delightful desserts',
          cardBackground: 'dark',
          titleColor: { color: '#ffffff' },
          descriptionColor: { color: '#d1d5db' },
          showOverlay: true,
          hoverEffect: 'scale'
        }
      }
    ]
  }),

  // Repeater settings
  repeaterItems: [
    {
      name: 'categories',
      itemType: 'category-card',
      itemLabel: 'Category',
      min: 1,
      max: 8
    }
  ],

  // Professional sidebar controls
  sideEditProps: [
    {
      groupName: 'Layout & Design',
      defaultOpen: true,
      props: [
        {
          name: 'backgroundColor',
          label: 'Background Style',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: 'dark', label: 'Dark' },
              { value: 'darker', label: 'Darker' },
              { value: 'gradient', label: 'Gradient' },
            ],
          },
        },
        {
          name: 'columns',
          label: 'Columns',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Radio,
            options: [
              { value: '2', label: '2 Columns' },
              { value: '3', label: '3 Columns' },
              { value: '4', label: '4 Columns' },
            ],
          },
        },
        {
          name: 'spacing',
          label: 'Card Spacing',
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
      groupName: 'Content Settings',
      defaultOpen: false,
      props: [
        {
          name: 'showTitle',
          label: 'Show Section Title',
          type: types.SideEditPropType.Boolean,
        },
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
          show: (props) => props.showTitle,
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
              { value: { color: '#9ca3af' }, label: 'Medium Gray' },
            ],
          },
          show: (props) => props.showTitle,
        },
      ],
    },
  ],
}

export default CategoriesSection
export { CategoryCard }