'use client';

import { Text, types } from 'react-bricks'

//=============================
// Color Test Brick - Test Visual Properties
//=============================
interface ColorTestBrickProps {
  heading: string
  description: string
  backgroundColor: string
  textColor: string
}

const ColorTestBrick: types.Brick<ColorTestBrickProps> = ({
  heading,
  description,
  backgroundColor = 'bg-neonPink/20',
  textColor = 'text-white',
}) => {
  return (
    <div className={`${backgroundColor} border border-neonPink/50 rounded-lg p-6 m-4`}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">🎨 COLOR TEST BRICK</h3>
        
        {/* Editable Heading */}
        <Text
          propName="heading"
          value={heading}
          renderBlock={(props) => (
            <h2 className={`text-3xl font-bold ${textColor} mb-4 cursor-pointer hover:opacity-80 p-2 rounded`}>
              {props.children}
            </h2>
          )}
          placeholder="Click to edit heading..."
        />
        
        {/* Editable Description */}
        <Text
          propName="description"
          value={description}
          renderBlock={(props) => (
            <p className={`${textColor} text-lg leading-relaxed cursor-pointer hover:opacity-80 p-2 rounded`}>
              {props.children}
            </p>
          )}
          placeholder="Click to edit description..."
        />
      </div>
      
      <div className="text-xs text-gray-400 border-t border-neonPink/30 pt-3">
        🎨 Test Visual Changes: Try editing the background and text colors in the sidebar!
      </div>
    </div>
  );
};

//=============================
// Brick Schema with Color Controls
//=============================
ColorTestBrick.schema = {
  name: 'color-test-brick',
  label: '🎨 Color Test Brick',
  category: 'test',
  tags: ['test', 'color', 'visual'],
  
  getDefaultProps: () => ({
    heading: 'Color Test Heading',
    description: 'This brick tests color changes. Edit the colors in the sidebar to see real-time updates!',
    backgroundColor: 'bg-neonPink/20',
    textColor: 'text-white',
  }),

  sideEditProps: [
    {
      name: 'heading',
      label: 'Heading Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'description',
      label: 'Description',
      type: types.SideEditPropType.Textarea,
    },
    {
      name: 'backgroundColor',
      label: 'Background Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'bg-neonPink/20', label: 'Pink Glow' },
          { value: 'bg-neonCyan/20', label: 'Cyan Glow' },
          { value: 'bg-purple-500/20', label: 'Purple Glow' },
          { value: 'bg-green-500/20', label: 'Green Glow' },
          { value: 'bg-gray-800', label: 'Dark Gray' },
          { value: 'bg-gradient-to-r from-neonPink/20 to-neonCyan/20', label: 'Gradient' },
        ]
      }
    },
    {
      name: 'textColor',
      label: 'Text Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-white', label: 'White' },
          { value: 'text-neonCyan', label: 'Neon Cyan' },
          { value: 'text-neonPink', label: 'Neon Pink' },
          { value: 'text-yellow-400', label: 'Yellow' },
          { value: 'text-gray-300', label: 'Light Gray' },
        ]
      }
    },
  ],
};

export default ColorTestBrick;
