'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { EditableText } from './EditableText';
import { EditableContainer } from './EditableContainer';
import { EditableCategoryCard } from './EditableCategoryCard';
import { Element } from '@craftjs/core';

export interface FullHomepageProps {
  backgroundColor?: string;
}

export const FullHomepage: React.FC<FullHomepageProps> & { 
  craft?: { 
    props: FullHomepageProps; 
    related: { settings: React.ComponentType };
  } 
} = ({
  backgroundColor = '#1a1a1a'
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
      className={`min-h-screen ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor }}
    >
      {/* Hero Section */}
      <Element
        is={EditableContainer}
        backgroundColor="linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)"
        padding="60px 20px"
        canvas
      >
        <Element
          is={EditableText}
          text="Welcome to Little Latte Lane"
          fontSize="48px"
          textAlign="center"
          fontWeight="bold"
          color="#00FFFF"
          tagName="h1"
        />
        <Element
          is={EditableText}
          text="Café & Deli - Where Great Food Meets Amazing Experiences"
          fontSize="24px"
          textAlign="center"
          color="#ffffff"
          tagName="p"
        />
      </Element>

      {/* Categories Section */}
      <Element
        is={EditableContainer}
        backgroundColor="#0f0f0f"
        padding="60px 20px"
        canvas
      >
        <Element
          is={EditableText}
          text="🍽️ Our Categories"
          fontSize="36px"
          textAlign="center"
          fontWeight="bold"
          color="#00FFFF"
          tagName="h2"
        />
        
        {/* Category Grid */}
        <Element
          is={EditableContainer}
          padding="40px 0"
          canvas
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <Element
              is={EditableCategoryCard}
              icon="☕"
              name="Drinks"
              description="Premium coffee, lattes, cold drinks & smoothies"
              borderColor="#00FFFF"
              backgroundColor="#1f1f1f"
            />
            <Element
              is={EditableCategoryCard}
              icon="🍕"
              name="Main Food"
              description="Fresh pizzas, hearty meals & grilled toasties"
              borderColor="#FF00FF"
              backgroundColor="#1f1f1f"
            />
            <Element
              is={EditableCategoryCard}
              icon="🥐"
              name="Sides & Breakfast"
              description="All-day breakfast, scones & perfect sides"
              borderColor="#FFFF00"
              backgroundColor="#1f1f1f"
            />
            <Element
              is={EditableCategoryCard}
              icon="🧀"
              name="Extras"
              description="Specialty items & unique offerings"
              borderColor="#00FF00"
              backgroundColor="#1f1f1f"
            />
          </div>
        </Element>
      </Element>

      {/* CTA Section */}
      <Element
        is={EditableContainer}
        backgroundColor="#2d2d2d"
        padding="60px 20px"
        canvas
      >
        <Element
          is={EditableText}
          text="Ready to Experience Little Latte Lane?"
          fontSize="32px"
          textAlign="center"
          fontWeight="bold"
          color="#FF00FF"
          tagName="h2"
        />
        <Element
          is={EditableText}
          text="Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere."
          fontSize="18px"
          textAlign="center"
          color="#ffffff"
          tagName="p"
        />
      </Element>
    </div>
  );
};

// Settings Panel
export const FullHomepageSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Page Settings</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Page Background</label>
        <input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props: FullHomepageProps) => (props.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
    </div>
  );
};

FullHomepage.craft = {
  props: {
    backgroundColor: '#1a1a1a'
  },
  related: {
    settings: FullHomepageSettings,
  },
};
