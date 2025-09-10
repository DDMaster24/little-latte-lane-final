'use client';

import React from 'react';
import Image from 'next/image';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

export interface CategoryCardProps {
  icon?: string;
  imageUrl?: string;
  name?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  iconSize?: string;
  borderColor?: string;
  link?: string;
}

export const EditableCategoryCard: React.FC<CategoryCardProps> & { 
  craft?: { 
    props: CategoryCardProps; 
    related: { settings: React.ComponentType };
  } 
} = ({
  icon = '☕',
  imageUrl = '',
  name = 'Category Name',
  description = 'Category description goes here',
  backgroundColor = '#1f1f1f',
  textColor = '#ffffff',
  iconSize = '48px',
  borderColor = '#00FFFF'
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
      className={`relative group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor,
        border: `2px solid ${borderColor}`,
        color: textColor
      }}
    >
      <div className="p-6 text-center space-y-4">
        {/* Icon/Image Display */}
        {imageUrl ? (
          <div className="mx-auto" style={{ width: iconSize, height: iconSize }}>
            <Image
              src={imageUrl}
              alt={name}
              width={parseInt(iconSize)}
              height={parseInt(iconSize)}
              className="w-full h-full object-cover rounded-lg"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.3))' }}
            />
          </div>
        ) : (
          <ContentEditable
            html={icon}
            onChange={(e) => setProp((props: CategoryCardProps) => (props.icon = e.target.value))}
            className="block mx-auto outline-none"
            style={{
              fontSize: iconSize,
              lineHeight: '1'
            }}
          />
        )}
        
        {/* Editable Category Name */}
        <ContentEditable
          html={name}
          onChange={(e) => setProp((props: CategoryCardProps) => (props.name = e.target.value))}
          tagName="h3"
          className="font-bold text-xl outline-none"
          style={{ color: textColor }}
        />
        
        {/* Editable Description */}
        <ContentEditable
          html={description}
          onChange={(e) => setProp((props: CategoryCardProps) => (props.description = e.target.value))}
          tagName="p"
          className="text-sm opacity-90 outline-none"
          style={{ color: textColor }}
        />
      </div>
      
      {/* Hover effect overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: borderColor }}
      ></div>
    </div>
  );
};

// Settings Panel for Category Card
export const EditableCategoryCardSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Category Card Settings</h3>
      
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Category Image</label>
        <input
          type="text"
          value={props.imageUrl || ''}
          onChange={(e) => setProp((props: CategoryCardProps) => (props.imageUrl = e.target.value))}
          placeholder="Enter image URL or upload image"
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        />
        <div className="mt-2 text-xs text-gray-400">
          💡 Tip: Upload to your image hosting service, then paste the URL here
        </div>
      </div>
      
      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props: CategoryCardProps) => (props.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
      
      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <input
          type="color"
          value={props.textColor}
          onChange={(e) => setProp((props: CategoryCardProps) => (props.textColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
      
      {/* Border Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Border Color</label>
        <input
          type="color"
          value={props.borderColor}
          onChange={(e) => setProp((props: CategoryCardProps) => (props.borderColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
      
      {/* Icon Size */}
      <div>
        <label className="block text-sm font-medium mb-2">Icon Size</label>
        <input
          type="range"
          min="24"
          max="96"
          value={parseInt(props.iconSize)}
          onChange={(e) => setProp((props: CategoryCardProps) => (props.iconSize = `${e.target.value}px`))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.iconSize}</span>
      </div>
      
      {/* Link */}
      <div>
        <label className="block text-sm font-medium mb-2">Link URL</label>
        <input
          type="text"
          value={props.link}
          onChange={(e) => setProp((props: CategoryCardProps) => (props.link = e.target.value))}
          placeholder="/menu/drinks"
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
        />
      </div>
    </div>
  );
};

EditableCategoryCard.craft = {
  props: {
    icon: '☕',
    imageUrl: '',
    name: 'Category Name',
    description: 'Category description goes here',
    backgroundColor: '#1f1f1f',
    textColor: '#ffffff',
    iconSize: '48px',
    borderColor: '#00FFFF',
    link: '/menu'
  },
  related: {
    settings: EditableCategoryCardSettings,
  },
};
