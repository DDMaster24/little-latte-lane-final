import React from 'react';
import { types } from 'react-bricks/rsc';

//========================================
// MenuSection Brick
//========================================

const MenuSection: types.Brick = () => {
  return (
    <div className="w-full">
      {/* Menu Skeleton - Basic structure only */}
      <div className="bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Menu Section</h2>
            <p className="text-gray-600 text-sm mt-2">
              Menu page customization will be added here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

MenuSection.schema = {
  name: 'menu-section',
  label: 'Menu Section',
  category: 'content',
  // Hide from add menu for now since it's just a skeleton
  hideFromAddMenu: true,
  
  // Basic sidebar controls placeholder
  sideEditProps: [],
  
  // No content editing for skeleton
  getDefaultProps: () => ({}),
};

export default MenuSection;