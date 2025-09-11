'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { 
  Type, Image as ImageIcon, Bold, AlignLeft, 
  AlignCenter, AlignRight, Upload, Settings
} from 'lucide-react';
import ContentEditable from 'react-contenteditable';
import Image from 'next/image';

// Enhanced Text Component with Craft.js integration
export const CraftText = ({ 
  text = 'Edit this text', 
  fontSize = 16, 
  color = '#ffffff', 
  fontWeight = 'normal',
  textAlign = 'left',
  fontFamily = 'inherit',
  ...props 
}) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => {
        if (ref) connect(drag(ref));
      }}
      className={`craft-text ${isSelected ? 'craft-selected' : ''}`}
      {...props}
    >
      <ContentEditable
        html={text}
        onChange={(e) => setProp((props) => (props.text = e.target.value))}
        style={{
          fontSize: `${fontSize}px`,
          color,
          fontWeight,
          textAlign,
          fontFamily,
          outline: 'none',
          cursor: 'text',
        }}
        className="w-full"
      />
    </div>
  );
};

// Text Settings Panel
const CraftTextSettings = () => {
  const {
    actions: { setProp },
    props: { text, fontSize, color, fontWeight, textAlign, fontFamily }
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white font-medium flex items-center gap-2">
        <Type className="h-4 w-4" />
        Text Settings
      </h3>
      
      {/* Font Size */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Font Size</label>
        <input
          type="range"
          min="12"
          max="72"
          value={fontSize}
          onChange={(e) => setProp((props) => (props.fontSize = parseInt(e.target.value)))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{fontSize}px</span>
      </div>

      {/* Color */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setProp((props) => (props.color = e.target.value))}
          className="w-full h-8 rounded border border-gray-600"
        />
      </div>

      {/* Font Weight */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Font Weight</label>
        <div className="flex gap-2">
          <button
            onClick={() => setProp((props) => (props.fontWeight = 'normal'))}
            className={`px-3 py-1 rounded text-sm ${fontWeight === 'normal' ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
          >
            Normal
          </button>
          <button
            onClick={() => setProp((props) => (props.fontWeight = 'bold'))}
            className={`px-3 py-1 rounded text-sm ${fontWeight === 'bold' ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
          >
            <Bold className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Alignment</label>
        <div className="flex gap-2">
          <button
            onClick={() => setProp((props) => (props.textAlign = 'left'))}
            className={`p-2 rounded ${textAlign === 'left' ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setProp((props) => (props.textAlign = 'center'))}
            className={`p-2 rounded ${textAlign === 'center' ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            onClick={() => setProp((props) => (props.textAlign = 'right'))}
            className={`p-2 rounded ${textAlign === 'right' ? 'bg-blue-500' : 'bg-gray-600'} text-white`}
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

CraftText.craft = {
  props: {
    text: 'Edit this text',
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'normal',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  related: {
    settings: CraftTextSettings,
  },
};

// Enhanced Image Component
export const CraftImage = ({ 
  src = '/placeholder-image.jpg',
  alt = 'Image',
  width = 300,
  height = 200,
  objectFit = 'cover',
  borderRadius = 0,
  ...props 
}) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProp((props) => (props.src = event.target.result));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`craft-image relative ${isSelected ? 'craft-selected' : ''}`}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit,
          borderRadius: `${borderRadius}px`,
        }}
        className="block"
      />
      {isSelected && (
        <div className="absolute top-2 right-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="bg-blue-500 text-white p-1 rounded cursor-pointer hover:bg-blue-600"
          >
            <Upload className="h-4 w-4" />
          </label>
        </div>
      )}
    </div>
  );
};

// Image Settings Panel
const CraftImageSettings = () => {
  const {
    actions: { setProp },
    props: { src, alt, width, height, objectFit, borderRadius }
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white font-medium flex items-center gap-2">
        <Image className="h-4 w-4" />
        Image Settings
      </h3>
      
      {/* Width */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Width</label>
        <input
          type="range"
          min="100"
          max="800"
          value={width}
          onChange={(e) => setProp((props) => (props.width = parseInt(e.target.value)))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{width}px</span>
      </div>

      {/* Height */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Height</label>
        <input
          type="range"
          min="100"
          max="600"
          value={height}
          onChange={(e) => setProp((props) => (props.height = parseInt(e.target.value)))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{height}px</span>
      </div>

      {/* Object Fit */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Object Fit</label>
        <select
          value={objectFit}
          onChange={(e) => setProp((props) => (props.objectFit = e.target.value))}
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
          <option value="none">None</option>
        </select>
      </div>

      {/* Border Radius */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Border Radius</label>
        <input
          type="range"
          min="0"
          max="50"
          value={borderRadius}
          onChange={(e) => setProp((props) => (props.borderRadius = parseInt(e.target.value)))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{borderRadius}px</span>
      </div>

      {/* Alt Text */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Alt Text</label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setProp((props) => (props.alt = e.target.value))}
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          placeholder="Describe the image"
        />
      </div>
    </div>
  );
};

CraftImage.craft = {
  props: {
    src: '/placeholder-image.jpg',
    alt: 'Image',
    width: 300,
    height: 200,
    objectFit: 'cover',
    borderRadius: 0,
  },
  related: {
    settings: CraftImageSettings,
  },
};

// Container/Section Component
export const CraftContainer = ({ 
  children,
  backgroundColor = 'transparent',
  padding = 20,
  borderRadius = 0,
  minHeight = 100,
  ...props 
}) => {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`craft-container ${isSelected ? 'craft-selected' : ''}`}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
        minHeight: `${minHeight}px`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Container Settings Panel
const CraftContainerSettings = () => {
  const {
    actions: { setProp },
    props: { backgroundColor, padding, borderRadius, minHeight }
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white font-medium flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Container Settings
      </h3>
      
      {/* Background Color */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Background Color</label>
        <input
          type="color"
          value={backgroundColor === 'transparent' ? '#000000' : backgroundColor}
          onChange={(e) => setProp((props) => (props.backgroundColor = e.target.value))}
          className="w-full h-8 rounded border border-gray-600"
        />
        <button
          onClick={() => setProp((props) => (props.backgroundColor = 'transparent'))}
          className="mt-1 text-xs text-blue-400 hover:text-blue-300"
        >
          Make Transparent
        </button>
      </div>

      {/* Padding */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Padding</label>
        <input
          type="range"
          min="0"
          max="100"
          value={padding}
          onChange={(e) => setProp((props) => (props.padding = parseInt(e.target.value)))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{padding}px</span>
      </div>

      {/* Border Radius */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Border Radius</label>
        <input
          type="range"
          min="0"
          max="50"
          value={borderRadius}
          onChange={(e) => setProp((props) => (props.borderRadius = parseInt(e.target.value)))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{borderRadius}px</span>
      </div>

      {/* Min Height */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Min Height</label>
        <input
          type="range"
          min="50"
          max="500"
          value={minHeight}
          onChange={(e) => setProp((props) => (props.minHeight = parseInt(e.target.value)))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{minHeight}px</span>
      </div>
    </div>
  );
};

CraftContainer.craft = {
  props: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 0,
    minHeight: 100,
  },
  related: {
    settings: CraftContainerSettings,
  },
};

// Button Component
export const CraftButton = ({ 
  text = 'Button',
  backgroundColor = '#3b82f6',
  color = '#ffffff',
  padding = '12px 24px',
  borderRadius = 6,
  fontSize = 16,
  fontWeight = 'medium',
  ...props 
}) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
    isSelected,
  } = useNode((state) => ({
    isSelected: state.events.selected,
  }));

  return (
    <button
      ref={(ref) => connect(drag(ref))}
      className={`craft-button ${isSelected ? 'craft-selected' : ''}`}
      style={{
        backgroundColor,
        color,
        padding,
        borderRadius: `${borderRadius}px`,
        fontSize: `${fontSize}px`,
        fontWeight,
        border: 'none',
        cursor: 'pointer',
      }}
      {...props}
    >
      <ContentEditable
        html={text}
        onChange={(e) => setProp((props) => (props.text = e.target.value))}
        style={{ outline: 'none' }}
      />
    </button>
  );
};

// Button Settings Panel
const CraftButtonSettings = () => {
  const {
    actions: { setProp },
    props: { text, backgroundColor, color, padding, borderRadius, fontSize, fontWeight }
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white font-medium flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Button Settings
      </h3>
      
      {/* Background Color */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Background Color</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setProp((props) => (props.backgroundColor = e.target.value))}
          className="w-full h-8 rounded border border-gray-600"
        />
      </div>

      {/* Text Color */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Text Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setProp((props) => (props.color = e.target.value))}
          className="w-full h-8 rounded border border-gray-600"
        />
      </div>

      {/* Font Size */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Font Size</label>
        <input
          type="range"
          min="12"
          max="24"
          value={fontSize}
          onChange={(e) => setProp((props) => (props.fontSize = parseInt(e.target.value)))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{fontSize}px</span>
      </div>

      {/* Border Radius */}
      <div>
        <label className="text-sm text-gray-300 block mb-1">Border Radius</label>
        <input
          type="range"
          min="0"
          max="25"
          value={borderRadius}
          onChange={(e) => setProp((props) => (props.borderRadius = parseInt(e.target.value)))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{borderRadius}px</span>
      </div>
    </div>
  );
};

CraftButton.craft = {
  props: {
    text: 'Button',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 'medium',
  },
  related: {
    settings: CraftButtonSettings,
  },
};
