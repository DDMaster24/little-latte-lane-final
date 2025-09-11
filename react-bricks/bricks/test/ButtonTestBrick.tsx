'use client';

import { Text, types } from 'react-bricks'

//=============================
// Button Test Brick - Interactive Elements
//=============================
interface ButtonTestBrickProps {
  buttonText: string
  buttonStyle: string
  description: string
}

const ButtonTestBrick: types.Brick<ButtonTestBrickProps> = ({
  buttonText,
  buttonStyle = 'primary',
  description,
}) => {
  
  const getButtonClasses = (style: string) => {
    const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-300 cursor-pointer transform hover:scale-105';
    
    switch (style) {
      case 'primary':
        return `${baseClasses} bg-neonCyan text-black hover:bg-neonCyan/80`;
      case 'secondary':
        return `${baseClasses} bg-neonPink text-black hover:bg-neonPink/80`;
      case 'outline':
        return `${baseClasses} border-2 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black`;
      case 'gradient':
        return `${baseClasses} bg-gradient-to-r from-neonPink to-neonCyan text-black hover:opacity-80`;
      default:
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-500`;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 m-4">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">🔘 BUTTON TEST BRICK</h3>
        
        {/* Editable Description */}
        <Text
          propName="description"
          value={description}
          renderBlock={(props) => (
            <p className="text-gray-300 mb-6 cursor-pointer hover:bg-gray-800/50 p-2 rounded">
              {props.children}
            </p>
          )}
          placeholder="Describe this button..."
        />
        
        {/* Interactive Button */}
        <div className="text-center">
          <Text
            propName="buttonText"
            value={buttonText}
            renderBlock={(props) => (
              <button className={getButtonClasses(buttonStyle)}>
                {props.children}
              </button>
            )}
            placeholder="Button Text..."
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-3">
        🔘 Test Button Styles: Change the button style in the sidebar to see different themes!
      </div>
    </div>
  );
};

//=============================
// Brick Schema with Style Options
//=============================
ButtonTestBrick.schema = {
  name: 'button-test-brick',
  label: '🔘 Button Test Brick',
  category: 'test',
  tags: ['test', 'button', 'interactive'],
  
  getDefaultProps: () => ({
    buttonText: 'Click Me!',
    buttonStyle: 'primary',
    description: 'This is a test button. Try changing the style and text!',
  }),

  sideEditProps: [
    {
      name: 'description',
      label: 'Description',
      type: types.SideEditPropType.Textarea,
    },
    {
      name: 'buttonText',
      label: 'Button Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'buttonStyle',
      label: 'Button Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'primary', label: 'Primary (Cyan)' },
          { value: 'secondary', label: 'Secondary (Pink)' },
          { value: 'outline', label: 'Outline' },
          { value: 'gradient', label: 'Gradient' },
        ]
      }
    },
  ],
};

export default ButtonTestBrick;
