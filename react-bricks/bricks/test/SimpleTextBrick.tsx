'use client';

import { Text, types } from 'react-bricks'

//=============================
// Simple Text Brick - Perfect for Testing
//=============================
interface SimpleTextBrickProps {
  title: string
  content: string
}

const SimpleTextBrick: types.Brick<SimpleTextBrickProps> = ({
  title,
  content,
}) => {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 m-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">🧱 SIMPLE TEXT BRICK</h3>
        
        {/* Editable Title */}
        <Text
          propName="title"
          value={title}
          renderBlock={(props) => (
            <h2 className="text-2xl font-bold text-neonCyan mb-4 cursor-pointer hover:bg-gray-700/30 p-2 rounded">
              {props.children}
            </h2>
          )}
          placeholder="Click to edit title..."
        />
        
        {/* Editable Content */}
        <Text
          propName="content"
          value={content}
          renderBlock={(props) => (
            <p className="text-gray-300 leading-relaxed cursor-pointer hover:bg-gray-700/30 p-2 rounded">
              {props.children}
            </p>
          )}
          placeholder="Click to edit content..."
        />
      </div>
      
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-3">
        💡 Test Instructions: Click on the title or content above to edit them inline!
      </div>
    </div>
  );
};

//=============================
// Brick Schema Configuration
//=============================
SimpleTextBrick.schema = {
  name: 'simple-text-brick',
  label: '🧱 Simple Text Brick',
  category: 'test',
  tags: ['test', 'text', 'simple'],
  
  getDefaultProps: () => ({
    title: 'Test Title - Click to Edit!',
    content: 'This is test content. Click on me to see how inline editing works! You can type directly here and see the changes immediately.',
  }),

  sideEditProps: [
    {
      name: 'title',
      label: 'Title Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'content',
      label: 'Content Text',
      type: types.SideEditPropType.Textarea,
    },
  ],
};

export default SimpleTextBrick;
