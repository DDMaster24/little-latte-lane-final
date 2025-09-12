import React from 'react'
import { Text, RichText, Image, types } from 'react-bricks'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

//=============================
interface CarouselPanelProps {
  title: string
  description: string
  backgroundGradient: string
  borderColor: string
  textAlignment: string
  titleColor: string
  descriptionColor: string
  badgeText: string
  badgeColor: string
  showBadge: boolean
  titleSize: string
  descriptionSize: string
}

//=============================
// Component to be rendered
//=============================
const CarouselPanel: types.Brick<CarouselPanelProps> = ({
  backgroundGradient = 'from-gray-800 to-gray-900',
  borderColor = 'border-neonCyan',
  textAlignment = 'text-center',
  titleColor = 'text-white',
  descriptionColor = 'text-gray-300',
  badgeColor = 'bg-neonCyan',
  showBadge = true,
  titleSize = 'text-2xl',
  descriptionSize = 'text-sm',
  // Fixed values for consistent carousel appearance
  // panelHeight and contentPadding are now fixed
}) => {
  return (
    <Card
      className={`
        w-full h-96 bg-gradient-to-br ${backgroundGradient} backdrop-blur-sm 
        border-2 ${borderColor} shadow-2xl
        overflow-hidden hover:shadow-3xl hover:border-opacity-100
        transition-all duration-300
      `}
    >
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div className="flex-shrink-0">
          <Text
            propName="title"
            placeholder="Panel Title"
            renderBlock={(props) => (
              <h3
                className={`font-bold ${titleColor} ${titleSize} mb-2 ${textAlignment}`}
                {...props.attributes}
              >
                {props.children}
              </h3>
            )}
          />
          <Text
            propName="description"
            placeholder="Panel description"
            renderBlock={(props) => (
              <p
                className={`${descriptionColor} ${descriptionSize} mb-4 ${textAlignment}`}
                {...props.attributes}
              >
                {props.children}
              </p>
            )}
          />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Image Upload Area */}
          <Image
            propName="panelImage"
            alt="Panel Image"
            imageClassName="rounded-lg object-cover w-full h-32 max-w-64"
            containerClassName="relative flex-shrink-0 mb-4"
          />
          
          {/* Rich Text Content Area */}
          <RichText
            propName="content"
            placeholder="Add your content here (icons, lists, custom content)..."
            renderBlock={(props) => (
              <div
                className={`flex-1 flex flex-col items-center justify-center ${textAlignment}`}
                {...props.attributes}
              >
                {props.children}
              </div>
            )}
            allowedFeatures={[
              types.RichTextFeatures.Bold,
              types.RichTextFeatures.Italic,
              types.RichTextFeatures.UnorderedList,
              types.RichTextFeatures.OrderedList,
              types.RichTextFeatures.Quote,
              types.RichTextFeatures.Link,
            ]}
          />
        </div>

        {showBadge && (
          <div className="flex-shrink-0 mt-4">
            <Text
              propName="badgeText"
              placeholder="Badge Text"
              renderBlock={(props) => (
                <Badge
                  className={`${badgeColor} text-white w-full justify-center`}
                  {...props.attributes}
                >
                  {props.children}
                </Badge>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

//=============================
// Brick Schema
//=============================
CarouselPanel.schema = {
  name: 'carousel-panel',
  label: 'Carousel Panel',
  category: 'content',
  tags: ['carousel', 'panel', 'content'],

  // Default props when brick is added
  getDefaultProps: () => ({
    title: 'Panel Title',
    description: 'Add your panel description here',
    backgroundGradient: 'from-gray-800 to-gray-900',
    borderColor: 'border-neonCyan',
    textAlignment: 'text-center',
    titleColor: 'text-white',
    descriptionColor: 'text-gray-300',
    badgeText: 'Featured',
    badgeColor: 'bg-neonCyan',
    showBadge: true,
    titleSize: 'text-2xl',
    descriptionSize: 'text-sm',
  }),

  // Sidebar controls for editing
  sideEditProps: [
    {
      groupName: 'Panel Appearance',
      props: [
        {
          name: 'backgroundGradient',
          label: 'Background Gradient',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'from-gray-800 to-gray-900', label: 'Dark Gray (Default)' },
              { value: 'from-neonCyan to-blue-600', label: 'Cyan to Blue' },
              { value: 'from-neonPink to-purple-600', label: 'Pink to Purple' },
              { value: 'from-green-500 to-emerald-600', label: 'Green Gradient' },
              { value: 'from-yellow-500 to-orange-600', label: 'Yellow to Orange' },
              { value: 'from-purple-500 to-pink-600', label: 'Purple to Pink' },
              { value: 'from-blue-500 to-cyan-600', label: 'Blue to Cyan' },
              { value: 'from-red-500 to-pink-600', label: 'Red to Pink' },
              { value: 'from-black to-gray-800', label: 'Black Gradient' },
              { value: 'from-indigo-600 to-purple-600', label: 'Indigo to Purple' },
            ],
          },
        },
        {
          name: 'borderColor',
          label: 'Border Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'border-neonCyan', label: 'Neon Cyan (Default)' },
              { value: 'border-neonPink', label: 'Neon Pink' },
              { value: 'border-white', label: 'White' },
              { value: 'border-gray-400', label: 'Gray' },
              { value: 'border-blue-400', label: 'Blue' },
              { value: 'border-green-400', label: 'Green' },
              { value: 'border-yellow-400', label: 'Yellow' },
              { value: 'border-red-400', label: 'Red' },
              { value: 'border-purple-400', label: 'Purple' },
              { value: 'border-transparent', label: 'No Border' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Text Styling',
      props: [
        {
          name: 'textAlignment',
          label: 'Text Alignment',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'text-left', label: 'Left' },
              { value: 'text-center', label: 'Center (Default)' },
              { value: 'text-right', label: 'Right' },
            ],
          },
        },
        {
          name: 'titleSize',
          label: 'Title Size',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'text-lg', label: 'Small' },
              { value: 'text-xl', label: 'Medium' },
              { value: 'text-2xl', label: 'Large (Default)' },
              { value: 'text-3xl', label: 'Extra Large' },
              { value: 'text-4xl', label: 'Huge' },
            ],
          },
        },
        {
          name: 'titleColor',
          label: 'Title Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'text-white', label: 'White (Default)' },
              { value: 'text-neonCyan', label: 'Neon Cyan' },
              { value: 'text-neonPink', label: 'Neon Pink' },
              { value: 'text-gray-300', label: 'Light Gray' },
              { value: 'text-blue-400', label: 'Blue' },
              { value: 'text-green-400', label: 'Green' },
              { value: 'text-yellow-400', label: 'Yellow' },
              { value: 'text-red-400', label: 'Red' },
              { value: 'text-purple-400', label: 'Purple' },
            ],
          },
        },
        {
          name: 'descriptionSize',
          label: 'Description Size',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'text-xs', label: 'Extra Small' },
              { value: 'text-sm', label: 'Small (Default)' },
              { value: 'text-base', label: 'Medium' },
              { value: 'text-lg', label: 'Large' },
            ],
          },
        },
        {
          name: 'descriptionColor',
          label: 'Description Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'text-gray-300', label: 'Light Gray (Default)' },
              { value: 'text-white', label: 'White' },
              { value: 'text-gray-400', label: 'Medium Gray' },
              { value: 'text-neonCyan', label: 'Neon Cyan' },
              { value: 'text-neonPink', label: 'Neon Pink' },
              { value: 'text-blue-300', label: 'Blue' },
              { value: 'text-green-300', label: 'Green' },
              { value: 'text-yellow-300', label: 'Yellow' },
            ],
          },
        },
      ],
    },
    {
      groupName: 'Badge Settings',
      props: [
        {
          name: 'showBadge',
          label: 'Show Badge',
          type: types.SideEditPropType.Boolean,
        },
        {
          name: 'badgeColor',
          label: 'Badge Color',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'bg-neonCyan', label: 'Neon Cyan (Default)' },
              { value: 'bg-neonPink', label: 'Neon Pink' },
              { value: 'bg-blue-500', label: 'Blue' },
              { value: 'bg-green-500', label: 'Green' },
              { value: 'bg-yellow-500', label: 'Yellow' },
              { value: 'bg-red-500', label: 'Red' },
              { value: 'bg-purple-500', label: 'Purple' },
              { value: 'bg-gray-600', label: 'Gray' },
              { value: 'bg-gradient-to-r from-neonCyan to-neonPink', label: 'Gradient Cyan-Pink' },
            ],
          },
        },
      ],
    },
  ],
}

export default CarouselPanel