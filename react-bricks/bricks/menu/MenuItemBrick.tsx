'use client';

import { Text, types, Image } from 'react-bricks'
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Star, Leaf, Flame } from 'lucide-react';

//=============================
// Local Types
//=============================
interface MenuItemBrickProps {
  itemName: string
  itemDescription: string
  itemPrice: string
  preparationTime: string
  isVegetarian: boolean
  isSpicy: boolean
  isFeatured: boolean
  allergyInfo: string
  availability: string
}

//=============================
// Component to be rendered
//=============================
const MenuItemBrick: types.Brick<MenuItemBrickProps> = ({
  itemName,
  itemDescription,
  itemPrice,
  preparationTime,
  isVegetarian = false,
  isSpicy = false,
  isFeatured = false,
  allergyInfo,
  availability = 'Available',
}) => {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-md border ${isFeatured ? 'border-neonCyan' : 'border-gray-700'} rounded-xl p-6 hover:border-neonPink/50 transition-all duration-300 ${isFeatured ? 'ring-1 ring-neonCyan/20' : ''}`}>
      {/* Item Image */}
      <div className="relative mb-4 h-32 rounded-lg overflow-hidden bg-gray-700">
        <Image
          propName="itemImage"
          alt={itemName || 'Menu item'}
          maxWidth={300}
          imageClassName="w-full h-full object-cover"
          renderWrapper={({ children }) => (
            <div className="relative w-full h-full group">
              {children}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Featured Badge */}
              {isFeatured && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-neonCyan text-black font-medium">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}
              
              {/* Availability Badge */}
              <div className="absolute top-2 right-2">
                <Badge className={`${availability === 'Available' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'} border`}>
                  <Text
                    propName="availability"
                    value={availability}
                    renderBlock={(props) => (
                      <span className="text-xs font-medium">{props.children}</span>
                    )}
                    placeholder="Available"
                  />
                </Badge>
              </div>
            </div>
          )}
        />
      </div>

      {/* Item Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Text
            propName="itemName"
            value={itemName}
            renderBlock={(props) => (
              <h4 className="text-lg font-bold text-white mb-1">
                {props.children}
              </h4>
            )}
            placeholder="Artisan Coffee Blend"
          />
          
          <div className="flex items-center gap-2 mb-2">
            {isVegetarian && (
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">
                <Leaf className="h-3 w-3 mr-1" />
                V
              </Badge>
            )}
            {isSpicy && (
              <Badge className="bg-red-500/20 text-red-400 border border-red-500/50">
                <Flame className="h-3 w-3 mr-1" />
                Spicy
              </Badge>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <Text
            propName="itemPrice"
            value={itemPrice}
            renderBlock={(props) => (
              <div className="flex items-center text-neonCyan font-bold text-xl">
                <DollarSign className="h-5 w-5" />
                {props.children}
              </div>
            )}
            placeholder="24.99"
          />
        </div>
      </div>

      {/* Item Description */}
      <Text
        propName="itemDescription"
        value={itemDescription}
        renderBlock={(props) => (
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {props.children}
          </p>
        )}
        placeholder="Rich, full-bodied coffee blend with notes of chocolate and caramel. Expertly roasted to perfection."
      />

      {/* Item Details */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="h-4 w-4" />
            <Text
              propName="preparationTime"
              value={preparationTime}
              renderBlock={(props) => (
                <span>{props.children}</span>
              )}
              placeholder="5-7 mins"
            />
          </div>
        </div>
        
        <div className="text-gray-500">
          <Text
            propName="allergyInfo"
            value={allergyInfo}
            renderBlock={(props) => (
              <span className="text-xs">{props.children}</span>
            )}
            placeholder="Contains: Milk"
          />
        </div>
      </div>
    </div>
  );
};

//=============================
// Brick SCHEMA
//=============================
MenuItemBrick.schema = {
  name: 'menu-item-brick',
  label: 'Menu Item Card',
  category: 'menu',
  tags: ['menu', 'item', 'food', 'product'],
  
  // Default props when brick is added
  getDefaultProps: () => ({
    itemName: 'Artisan Coffee Blend',
    itemDescription: 'Rich, full-bodied coffee blend with notes of chocolate and caramel. Expertly roasted to perfection.',
    itemPrice: '24.99',
    preparationTime: '5-7 mins',
    isVegetarian: false,
    isSpicy: false,
    isFeatured: false,
    allergyInfo: 'Contains: Milk',
    availability: 'Available',
  }),

  // Sidebar controls for editing
  sideEditProps: [
    {
      name: 'itemName',
      label: 'Item Name',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'itemDescription',
      label: 'Item Description',
      type: types.SideEditPropType.Textarea,
    },
    {
      name: 'itemPrice',
      label: 'Price (without currency symbol)',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'preparationTime',
      label: 'Preparation Time',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'availability',
      label: 'Availability Status',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'Available', label: 'Available' },
          { value: 'Sold Out', label: 'Sold Out' },
          { value: 'Limited', label: 'Limited Quantity' },
        ],
      },
    },
    {
      name: 'allergyInfo',
      label: 'Allergy Information',
      type: types.SideEditPropType.Text,
    },
    {
      groupName: 'Item Properties',
      props: [
        {
          name: 'isFeatured',
          label: 'Featured Item',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'isVegetarian',
          label: 'Vegetarian',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'isSpicy',
          label: 'Spicy',
          type: types.SideEditPropType.Boolean,
        },
      ],
    },
  ],
};

export default MenuItemBrick;
