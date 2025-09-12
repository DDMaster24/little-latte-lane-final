'use client';

import { Text, types } from 'react-bricks'

//=============================
// Local Types
//=============================
interface CategoriesSectionProps {
  title: string
  subtitle: string
  titleColor: string
  subtitleColor: string
  placeholderTextColor: string
}

//=============================
// Component to be rendered
//=============================
const CategoriesSection: types.Brick<CategoriesSectionProps> = ({
  title,
  subtitle,
  titleColor = 'text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4',
  subtitleColor = 'text-lg text-gray-300 mb-8 max-w-2xl mx-auto',
  placeholderTextColor = 'text-gray-400',
}) => {
  return (
    <section className="bg-darkBg section-padding">
      <div className="container mx-auto text-center">
        <Text
          propName="title"
          value={title}
          renderBlock={(props) => (
            <h2 className={titleColor}>
              {props.children}
            </h2>
          )}
          placeholder="🍽️ View Our Categories"
        />
        
        <Text
          propName="subtitle"
          value={subtitle}
          renderBlock={(props) => (
            <p className={subtitleColor}>
              {props.children}
            </p>
          )}
          placeholder="Explore our delicious menu categories"
        />
        
        {/* Placeholder for category panels - to be enhanced later */}
        <div className={`${placeholderTextColor} text-center py-8 border-2 border-dashed border-gray-600 rounded-lg`}>
          Category panels will be added here in the next step
        </div>
      </div>
    </section>
  );
};

//=============================
// Brick SCHEMA
//=============================
CategoriesSection.schema = {
  name: 'categories-section',
  label: 'Categories Section',
  category: 'layout',
  tags: ['categories', 'menu', 'section'],
  
  // Default props when brick is added
  getDefaultProps: () => ({
    title: '🍽️ View Our Categories',
    subtitle: 'Explore our delicious menu categories',
    titleColor: 'text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4',
    subtitleColor: 'text-lg text-gray-300 mb-8 max-w-2xl mx-auto',
    placeholderTextColor: 'text-gray-400',
  }),

  // Sidebar controls for editing
  sideEditProps: [
    {
      name: 'title',
      label: 'Section Title',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'subtitle',
      label: 'Section Subtitle',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'titleColor',
      label: 'Title Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4', label: 'Neon Gradient (Default)' },
          { value: 'text-3xl font-bold text-neonCyan mb-4', label: 'Neon Cyan' },
          { value: 'text-3xl font-bold text-neonPink mb-4', label: 'Neon Pink' },
          { value: 'text-3xl font-bold text-white mb-4', label: 'White' },
          { value: 'text-3xl font-bold text-gray-300 mb-4', label: 'Light Gray' },
          { value: 'text-3xl font-bold text-yellow-400 mb-4', label: 'Yellow' },
          { value: 'text-3xl font-bold text-blue-400 mb-4', label: 'Blue' },
          { value: 'text-3xl font-bold text-green-400 mb-4', label: 'Green' },
        ],
      },
    },
    {
      name: 'subtitleColor',
      label: 'Subtitle Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-lg text-gray-300 mb-8 max-w-2xl mx-auto', label: 'Gray 300 (Default)' },
          { value: 'text-lg text-white mb-8 max-w-2xl mx-auto', label: 'White' },
          { value: 'text-lg text-neonCyan mb-8 max-w-2xl mx-auto', label: 'Neon Cyan' },
          { value: 'text-lg text-neonPink mb-8 max-w-2xl mx-auto', label: 'Neon Pink' },
          { value: 'text-lg text-gray-400 mb-8 max-w-2xl mx-auto', label: 'Gray 400' },
          { value: 'text-lg text-yellow-300 mb-8 max-w-2xl mx-auto', label: 'Yellow' },
          { value: 'text-lg text-blue-300 mb-8 max-w-2xl mx-auto', label: 'Blue' },
          { value: 'text-lg text-green-300 mb-8 max-w-2xl mx-auto', label: 'Green' },
        ],
      },
    },
    {
      name: 'placeholderTextColor',
      label: 'Placeholder Text Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-gray-400', label: 'Gray 400 (Default)' },
          { value: 'text-gray-300', label: 'Gray 300' },
          { value: 'text-gray-500', label: 'Gray 500' },
          { value: 'text-white', label: 'White' },
          { value: 'text-neonCyan', label: 'Neon Cyan' },
          { value: 'text-neonPink', label: 'Neon Pink' },
          { value: 'text-yellow-400', label: 'Yellow' },
        ],
      },
    },
  ],
};

export default CategoriesSection;
