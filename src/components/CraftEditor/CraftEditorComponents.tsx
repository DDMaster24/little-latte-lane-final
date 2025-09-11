'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Type } from 'lucide-react';
import ContentEditable from 'react-contenteditable';

// Simplified Text Component that compiles without TypeScript errors
export const CraftText = ({ 
  text = 'Edit this text', 
  fontSize = 16, 
  color = '#ffffff', 
  fontWeight = 'normal',
  textAlign = 'left',
  fontFamily = 'inherit',
  ...props 
}: any) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
    isSelected,
  } = useNode((state: any) => ({
    isSelected: state.events.selected,
  }));

  return (
    <div
      ref={(ref: any) => {
        if (ref) connect(drag(ref));
      }}
      className={`craft-text ${isSelected ? 'craft-selected' : ''}`}
      {...props}
    >
      <ContentEditable
        html={text}
        onChange={(e: any) => setProp((props: any) => (props.text = e.target.value))}
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

// Simplified Text Settings Panel
const CraftTextSettings = () => {
  const {
    actions: { setProp },
    props: { fontSize, color, fontWeight, textAlign }
  } = useNode((node: any) => ({
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
          onChange={(e: any) => setProp((props: any) => (props.fontSize = parseInt(e.target.value)))}
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
          onChange={(e: any) => setProp((props: any) => (props.color = e.target.value))}
          className="w-full h-8 rounded border border-gray-600"
        />
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

// Simplified Container Component
export const CraftContainer = ({ 
  children,
  backgroundColor = 'transparent',
  padding = 20,
  borderRadius = 0,
  minHeight = 100,
  ...props 
}: any) => {
  const {
    connectors: { connect, drag },
    isSelected,
  } = useNode((state: any) => ({
    isSelected: state.events.selected,
  }));

  return (
    <div
      ref={(ref: any) => {
        if (ref) connect(drag(ref));
      }}
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

CraftContainer.craft = {
  props: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 0,
    minHeight: 100,
  },
};

// Simplified Button Component
export const CraftButton = ({ 
  text = 'Button',
  backgroundColor = '#3b82f6',
  color = '#ffffff',
  padding = '12px 24px',
  borderRadius = 6,
  fontSize = 16,
  fontWeight = 'medium',
  ...props 
}: any) => {
  const {
    connectors: { connect, drag },
    actions: { setProp },
    isSelected,
  } = useNode((state: any) => ({
    isSelected: state.events.selected,
  }));

  return (
    <button
      ref={(ref: any) => {
        if (ref) connect(drag(ref));
      }}
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
        onChange={(e: any) => setProp((props: any) => (props.text = e.target.value))}
        style={{ outline: 'none' }}
      />
    </button>
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
};
