'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

export interface EditableContainerProps {
  backgroundColor?: string;
  backgroundImage?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  minHeight?: string;
  width?: string;
  children?: React.ReactNode;
}

export const EditableContainer: React.FC<EditableContainerProps> & { 
  craft?: { 
    props: EditableContainerProps; 
    related: { settings: React.ComponentType };
    rules: { canDrag: boolean };
  } 
} = ({
  backgroundColor = 'transparent',
  backgroundImage = '',
  padding = '16px',
  margin = '0px',
  borderRadius = '0px',
  minHeight = '100px',
  width = '100%',
  children
}) => {
  const {
    connectors: { connect, drag },
    selected
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding,
        margin,
        borderRadius,
        minHeight,
        width,
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
};

// Settings Panel for Container
export const EditableContainerSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Container Settings</h3>
      
      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <input
          type="color"
          value={props.backgroundColor === 'transparent' ? '#000000' : props.backgroundColor}
          onChange={(e) => setProp((props: EditableContainerProps) => (props.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
        <button
          onClick={() => setProp((props: EditableContainerProps) => (props.backgroundColor = 'transparent'))}
          className="text-xs text-gray-400 mt-1 hover:text-white"
        >
          Make Transparent
        </button>
      </div>
      
      {/* Background Image URL */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Image URL</label>
        <input
          type="text"
          value={props.backgroundImage}
          onChange={(e) => setProp((props: EditableContainerProps) => (props.backgroundImage = e.target.value))}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        />
      </div>
      
      {/* Padding */}
      <div>
        <label className="block text-sm font-medium mb-2">Padding</label>
        <input
          type="range"
          min="0"
          max="100"
          value={parseInt(props.padding)}
          onChange={(e) => setProp((props: EditableContainerProps) => (props.padding = `${e.target.value}px`))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.padding}</span>
      </div>
      
      {/* Border Radius */}
      <div>
        <label className="block text-sm font-medium mb-2">Border Radius</label>
        <input
          type="range"
          min="0"
          max="50"
          value={parseInt(props.borderRadius)}
          onChange={(e) => setProp((props: EditableContainerProps) => (props.borderRadius = `${e.target.value}px`))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.borderRadius}</span>
      </div>
      
      {/* Min Height */}
      <div>
        <label className="block text-sm font-medium mb-2">Min Height</label>
        <input
          type="range"
          min="50"
          max="500"
          value={parseInt(props.minHeight)}
          onChange={(e) => setProp((props: EditableContainerProps) => (props.minHeight = `${e.target.value}px`))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.minHeight}</span>
      </div>
    </div>
  );
};

EditableContainer.craft = {
  props: {
    backgroundColor: 'transparent',
    backgroundImage: '',
    padding: '16px',
    margin: '0px',
    borderRadius: '0px',
    minHeight: '100px',
    width: '100%'
  },
  related: {
    settings: EditableContainerSettings,
  },
  rules: {
    canDrag: true,
  }
};
