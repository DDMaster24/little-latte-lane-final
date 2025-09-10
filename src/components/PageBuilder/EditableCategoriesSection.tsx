'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

export interface EditableCategoriesSectionProps {
  title?: string;
  backgroundColor?: string;
}

export const EditableCategoriesSection: React.FC<EditableCategoriesSectionProps> & { 
  craft?: { 
    props: EditableCategoriesSectionProps; 
    related: { settings: React.ComponentType };
  } 
} = ({
  title = '🍽️ View Our Categories',
  backgroundColor = '#0f0f0f'
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <section 
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      data-cy="component-wrapper"
      className={`w-full shadow-neon rounded-xl ${selected ? 'ring-2 ring-blue-500' : ''} transition-all duration-200`}
      style={{ backgroundColor }}
    >
      <div className="text-center py-8 xs:py-12 px-6">
        <ContentEditable
          html={title}
          onChange={(e) => setProp((props: EditableCategoriesSectionProps) => (props.title = e.target.value))}
          tagName="h2"
          className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent outline-none"
        />
        
        {selected && (
          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-blue-400 text-sm">
              💡 Categories Section - Click to edit title and styling. Full category editing coming soon!
            </p>
          </div>
        )}
      </div>
      
      {/* Preview of categories structure */}
      <div className="px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {['☕ Drinks', '🍕 Main Food', '🥐 Sides & Breakfast', '🧀 Extras'].map((category, index) => (
            <div key={index} className="bg-black/30 border border-neonCyan/30 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">{category.split(' ')[0]}</div>
              <h3 className="text-white font-bold mb-2">{category.split(' ').slice(1).join(' ')}</h3>
              <p className="text-gray-400 text-sm">Click to edit...</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Settings Panel
export const EditableCategoriesSectionSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Categories Section Settings</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props: EditableCategoriesSectionProps) => (props.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
    </div>
  );
};

EditableCategoriesSection.craft = {
  props: {
    title: '🍽️ View Our Categories',
    backgroundColor: '#0f0f0f'
  },
  related: {
    settings: EditableCategoriesSectionSettings,
  },
};
