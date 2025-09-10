'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

export interface EditableTextProps {
  text?: string;
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold' | 'semibold';
  tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

export const EditableText: React.FC<EditableTextProps> & { craft?: { props: EditableTextProps; related: { settings: React.ComponentType } } } = ({
  text = 'Click to edit text',
  fontSize = '16px',
  color = '#ffffff',
  backgroundColor = 'transparent',
  padding = '8px',
  textAlign = 'left',
  fontWeight = 'normal',
  tagName = 'p'
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
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
      className={`${selected ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
      style={{
        backgroundColor,
        padding,
        minHeight: '1em',
        display: 'block'
      }}
    >
      <ContentEditable
        html={text}
        onChange={(e) => setProp((props: EditableTextProps) => (props.text = e.target.value))}
        tagName={tagName}
        className="outline-none w-full"
        style={{
          fontSize,
          color,
          textAlign,
          fontWeight,
          background: 'transparent'
        }}
      />
    </div>
  );
};

// Settings Panel for Text
export const EditableTextSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Text Settings</h3>
      
      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium mb-2">Font Size</label>
        <input
          type="range"
          min="12"
          max="72"
          value={parseInt(props.fontSize)}
          onChange={(e) => setProp((props: EditableTextProps) => (props.fontSize = `${e.target.value}px`))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.fontSize}</span>
      </div>
      
      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <input
          type="color"
          value={props.color}
          onChange={(e) => setProp((props: EditableTextProps) => (props.color = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
      
      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <input
          type="color"
          value={props.backgroundColor === 'transparent' ? '#000000' : props.backgroundColor}
          onChange={(e) => setProp((props: EditableTextProps) => (props.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
        <button
          onClick={() => setProp((props: EditableTextProps) => (props.backgroundColor = 'transparent'))}
          className="text-xs text-gray-400 mt-1 hover:text-white"
        >
          Make Transparent
        </button>
      </div>
      
      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium mb-2">Text Alignment</label>
        <select
          value={props.textAlign}
          onChange={(e) => setProp((props: EditableTextProps) => (props.textAlign = e.target.value as 'left' | 'center' | 'right'))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      
      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium mb-2">Font Weight</label>
        <select
          value={props.fontWeight}
          onChange={(e) => setProp((props: EditableTextProps) => (props.fontWeight = e.target.value as 'normal' | 'bold' | 'semibold'))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        >
          <option value="normal">Normal</option>
          <option value="semibold">Semi Bold</option>
          <option value="bold">Bold</option>
        </select>
      </div>
      
      {/* Tag Name */}
      <div>
        <label className="block text-sm font-medium mb-2">HTML Tag</label>
        <select
          value={props.tagName}
          onChange={(e) => setProp((props: EditableTextProps) => (props.tagName = e.target.value as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        >
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
          <option value="p">Paragraph</option>
          <option value="span">Span</option>
        </select>
      </div>
    </div>
  );
};

EditableText.craft = {
  props: {
    text: 'Click to edit text',
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: 'transparent',
    padding: '8px',
    textAlign: 'left',
    fontWeight: 'normal',
    tagName: 'p'
  },
  related: {
    settings: EditableTextSettings,
  },
};
