import React from 'react';
import { types } from 'react-bricks/rsc';

//========================================
// FooterSection Brick
//========================================

const FooterSection: types.Brick = () => {
  return (
    <div className="w-full">
      {/* Footer Skeleton - Basic structure only */}
      <div className="bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Footer Section</h2>
            <p className="text-gray-300 text-sm mt-2">
              Footer customization will be added here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

FooterSection.schema = {
  name: 'footer-section',
  label: 'Footer Section',
  category: 'layout',
  // Hide from add menu for now since it's just a skeleton
  hideFromAddMenu: true,
  
  // Basic sidebar controls placeholder
  sideEditProps: [],
  
  // No content editing for skeleton
  getDefaultProps: () => ({}),
};

export default FooterSection;