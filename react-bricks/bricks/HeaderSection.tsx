import React from 'react';
import { types } from 'react-bricks/rsc';

//========================================
// HeaderSection Brick
//========================================

const HeaderSection: types.Brick = () => {
  return (
    <div className="w-full">
      {/* Header Skeleton - Basic structure only */}
      <div className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Header Section</h2>
            <p className="text-gray-300 text-sm mt-2">
              Header customization will be added here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

HeaderSection.schema = {
  name: 'header-section',
  label: 'Header Section',
  category: 'layout',
  // Hide from add menu for now since it's just a skeleton
  hideFromAddMenu: true,
  
  // Basic sidebar controls placeholder
  sideEditProps: [],
  
  // No content editing for skeleton
  getDefaultProps: () => ({}),
};

export default HeaderSection;