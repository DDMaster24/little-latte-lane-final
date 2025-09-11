'use client';

import { Text, types } from 'react-bricks/rsc'

//=============================
// Local Types
//=============================
interface CategoriesSectionProps {
  title: string
  subtitle: string
}

//=============================
// Component to be rendered
//=============================
const CategoriesSection: types.Brick<CategoriesSectionProps> = ({
  title,
  subtitle,
}) => {
  return (
    <section className="bg-darkBg section-padding">
      <div className="container mx-auto text-center">
        <Text
          propName="title"
          value={title}
          renderBlock={(props) => (
            <h2 className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4">
              {props.children}
            </h2>
          )}
          placeholder="🍽️ View Our Categories"
        />
        
        <Text
          propName="subtitle"
          value={subtitle}
          renderBlock={(props) => (
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              {props.children}
            </p>
          )}
          placeholder="Explore our delicious menu categories"
        />
        
        {/* Placeholder for category panels - to be enhanced later */}
        <div className="text-gray-400 text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
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
  ],
};

export default CategoriesSection;
