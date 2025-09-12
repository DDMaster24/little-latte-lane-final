'use client';

import { Text, types, Image } from 'react-bricks'
import { Badge } from '@/components/ui/badge';
import { Star, Clock, DollarSign, Leaf } from 'lucide-react';

//=============================
// Local Types
//=============================
interface MenuCategoryBrickProps {
  categoryName: string
  categoryDescription: string
  itemCount: string
  specialBadge: string
  showVegetarian: boolean
  showSpicy: boolean
  backgroundColor: string
}

//=============================
// Component to be rendered
//=============================
const MenuCategoryBrick: types.Brick<MenuCategoryBrickProps> = ({
  categoryName,
  categoryDescription,
  itemCount,
  specialBadge,
  showVegetarian = false,
  showSpicy = false,
  backgroundColor = 'bg-gray-800/50',
}) => {
  return (
    <div className={`${backgroundColor} backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-neonCyan/50 transition-all duration-300`}>
      {/* Category Image */}
      <div className="relative mb-6 h-48 rounded-lg overflow-hidden bg-gray-700">
        <Image
          propName="categoryImage"
          alt={categoryName || 'Menu category'}
          maxWidth={400}
          imageClassName="w-full h-full object-cover"
          renderWrapper={({ children }) => (
            <div className="relative w-full h-full group">
              {children}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
        />
        
        {/* Special Badge */}
        {specialBadge && (
          <div className="absolute top-3 right-3">
            <Text
              propName="specialBadge"
              value={specialBadge}
              renderBlock={(props) => (
                <Badge className="bg-neonPink text-black font-medium">
                  <Star className="h-3 w-3 mr-1" />
                  {props.children}
                </Badge>
              )}
              placeholder="Chef's Choice"
            />
          </div>
        )}
      </div>

      {/* Category Header */}
      <div className="mb-4">
        <Text
          propName="categoryName"
          value={categoryName}
          renderBlock={(props) => (
            <h3 className="text-2xl font-bold text-white mb-2">
              {props.children}
            </h3>
          )}
          placeholder="Coffee & Beverages"
        />
        
        <Text
          propName="categoryDescription"
          value={categoryDescription}
          renderBlock={(props) => (
            <p className="text-gray-300 leading-relaxed mb-4">
              {props.children}
            </p>
          )}
          placeholder="Premium coffee beans sourced from around the world, expertly roasted and crafted into perfect beverages"
        />
      </div>

      {/* Category Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-neonCyan">
          <Clock className="h-4 w-4" />
          <Text
            propName="itemCount"
            value={itemCount}
            renderBlock={(props) => (
              <span className="text-sm font-medium">{props.children}</span>
            )}
            placeholder="12 items available"
          />
        </div>
        
        <div className="flex gap-2">
          {showVegetarian && (
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">
              <Leaf className="h-3 w-3 mr-1" />
              Vegetarian Options
            </Badge>
          )}
          {showSpicy && (
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/50">
              🌶️ Spicy Options
            </Badge>
          )}
        </div>
      </div>

      {/* Browse Button Area */}
      <div className="pt-4 border-t border-gray-600">
        <div className="flex items-center justify-center text-neonCyan hover:text-white transition-colors cursor-pointer">
          <DollarSign className="h-4 w-4 mr-2" />
          <span className="font-medium">Browse Category</span>
        </div>
      </div>
    </div>
  );
};

//=============================
// Brick SCHEMA
//=============================
MenuCategoryBrick.schema = {
  name: 'menu-category-brick',
  label: 'Menu Category Card',
  category: 'menu',
  tags: ['menu', 'category', 'food', 'card'],
  
  // Default props when brick is added
  getDefaultProps: () => ({
    categoryName: 'Coffee & Beverages',
    categoryDescription: 'Premium coffee beans sourced from around the world, expertly roasted and crafted into perfect beverages',
    itemCount: '12 items available',
    specialBadge: 'Chef\'s Choice',
    showVegetarian: false,
    showSpicy: false,
    backgroundColor: 'bg-gray-800/50',
  }),

  // Sidebar controls for editing
  sideEditProps: [
    {
      name: 'categoryName',
      label: 'Category Name',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'categoryDescription',
      label: 'Category Description',
      type: types.SideEditPropType.Textarea,
    },
    {
      name: 'itemCount',
      label: 'Item Count Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'specialBadge',
      label: 'Special Badge Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'showVegetarian',
      label: 'Show Vegetarian Badge',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'showSpicy',
      label: 'Show Spicy Badge',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'backgroundColor',
      label: 'Background Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'bg-gray-800/50', label: 'Default Gray' },
          { value: 'bg-blue-800/50', label: 'Blue Tint' },
          { value: 'bg-green-800/50', label: 'Green Tint' },
          { value: 'bg-purple-800/50', label: 'Purple Tint' },
          { value: 'bg-red-800/50', label: 'Red Tint' },
        ],
      },
    },
  ],
};

export default MenuCategoryBrick;
