'use client';

import { Text, types } from 'react-bricks'
import { Badge } from '@/components/ui/badge';
import { Utensils, Clock, DollarSign } from 'lucide-react';

//=============================
// Local Types
//=============================
interface MenuHeroBrickProps {
  pageTitle: string
  pageSubtitle: string
  featuredBadge: string
  operatingHours: string
  specialNote: string
  backgroundGradient: string
}

//=============================
// Component to be rendered
//=============================
const MenuHeroBrick: types.Brick<MenuHeroBrickProps> = ({
  pageTitle,
  pageSubtitle,
  featuredBadge,
  operatingHours,
  specialNote,
  backgroundGradient = 'from-darkBg via-gray-900 to-darkBg',
}) => {
  return (
    <section className={`bg-gradient-to-br ${backgroundGradient} section-padding`}>
      <div className="container mx-auto text-center">
        {/* Page Header */}
        <div className="mb-8">
          <Text
            propName="pageTitle"
            value={pageTitle}
            renderBlock={(props) => (
              <h1 className="text-4xl md:text-5xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-6">
                {props.children}
              </h1>
            )}
            placeholder="🍽️ Our Delicious Menu"
          />
          
          <Text
            propName="pageSubtitle"
            value={pageSubtitle}
            renderBlock={(props) => (
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                {props.children}
              </p>
            )}
            placeholder="Discover our carefully crafted selection of premium coffee, artisanal food, and delightful treats"
          />
          
          {/* Featured Badge */}
          <Text
            propName="featuredBadge"
            value={featuredBadge}
            renderBlock={(props) => (
              <Badge className="bg-neonCyan text-black px-6 py-2 text-lg font-medium mb-8">
                <Utensils className="h-5 w-5 mr-2" />
                {props.children}
              </Badge>
            )}
            placeholder="Fresh Daily • Made to Order"
          />
        </div>

        {/* Menu Information */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Operating Hours */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-neonCyan" />
              <h3 className="text-xl font-bold text-white">Kitchen Hours</h3>
            </div>
            <Text
              propName="operatingHours"
              value={operatingHours}
              renderBlock={(props) => (
                <p className="text-neonCyan text-lg font-medium">
                  {props.children}
                </p>
              )}
              placeholder="8:00 AM - 10:00 PM Daily"
            />
          </div>

          {/* Special Note */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-neonPink" />
              <h3 className="text-xl font-bold text-white">Special Notice</h3>
            </div>
            <Text
              propName="specialNote"
              value={specialNote}
              renderBlock={(props) => (
                <p className="text-neonPink text-lg font-medium">
                  {props.children}
                </p>
              )}
              placeholder="All prices include VAT • Card payments accepted"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

//=============================
// Brick SCHEMA
//=============================
MenuHeroBrick.schema = {
  name: 'menu-hero-brick',
  label: 'Menu Hero Section',
  category: 'menu',
  tags: ['menu', 'hero', 'header', 'page'],
  
  // Default props when brick is added
  getDefaultProps: () => ({
    pageTitle: '🍽️ Our Delicious Menu',
    pageSubtitle: 'Discover our carefully crafted selection of premium coffee, artisanal food, and delightful treats',
    featuredBadge: 'Fresh Daily • Made to Order',
    operatingHours: '8:00 AM - 10:00 PM Daily',
    specialNote: 'All prices include VAT • Card payments accepted',
    backgroundGradient: 'from-darkBg via-gray-900 to-darkBg',
  }),

  // Sidebar controls for editing
  sideEditProps: [
    {
      name: 'pageTitle',
      label: 'Page Title',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'pageSubtitle',
      label: 'Page Subtitle',
      type: types.SideEditPropType.Textarea,
    },
    {
      name: 'featuredBadge',
      label: 'Featured Badge Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'operatingHours',
      label: 'Operating Hours',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'specialNote',
      label: 'Special Notice',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'backgroundGradient',
      label: 'Background Gradient',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'from-darkBg via-gray-900 to-darkBg', label: 'Dark Theme' },
          { value: 'from-blue-900 via-purple-900 to-darkBg', label: 'Blue Purple' },
          { value: 'from-green-900 via-teal-900 to-darkBg', label: 'Green Teal' },
          { value: 'from-red-900 via-pink-900 to-darkBg', label: 'Red Pink' },
        ],
      },
    },
  ],
};

export default MenuHeroBrick;
