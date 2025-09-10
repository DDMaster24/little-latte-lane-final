'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

export interface HeaderProps {
  logo?: string;
  logoText?: string;
  navItems?: string[];
  backgroundColor?: string;
  textColor?: string;
  logoSize?: string;
  showNav?: boolean;
}

export const EditableHeader: React.FC<HeaderProps> & { 
  craft?: { 
    props: HeaderProps; 
    related: { settings: React.ComponentType };
  } 
} = ({
  logo = '🍕',
  logoText = 'Little Latte Lane',
  navItems = ['Menu', 'Bookings', 'Events', 'Contact'],
  backgroundColor = '#0a0a0a',
  textColor = '#ffffff',
  logoSize = '32px',
  showNav = true
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <header
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`relative w-full ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        backgroundColor,
        color: textColor
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <ContentEditable
              html={logo}
              onChange={(e) => setProp((props: HeaderProps) => (props.logo = e.target.value))}
              className="outline-none"
              style={{
                fontSize: logoSize,
                lineHeight: '1'
              }}
            />
            <ContentEditable
              html={logoText}
              onChange={(e) => setProp((props: HeaderProps) => (props.logoText = e.target.value))}
              className="font-bold text-xl outline-none"
              style={{ color: textColor }}
            />
          </div>

          {/* Navigation */}
          {showNav && (
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item, index) => (
                <ContentEditable
                  key={index}
                  html={item}
                  onChange={(e) => {
                    const newItems = [...navItems];
                    newItems[index] = e.target.value;
                    setProp((props: HeaderProps) => (props.navItems = newItems));
                  }}
                  className="text-sm font-medium hover:text-cyan-400 transition-colors outline-none cursor-pointer"
                  style={{ color: textColor }}
                />
              ))}
            </nav>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              style={{ color: textColor }}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Settings Panel for Header
export const EditableHeaderSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Header Settings</h3>
      
      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props: HeaderProps) => (props.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
      
      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <input
          type="color"
          value={props.textColor}
          onChange={(e) => setProp((props: HeaderProps) => (props.textColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
      
      {/* Logo Size */}
      <div>
        <label className="block text-sm font-medium mb-2">Logo Size</label>
        <input
          type="range"
          min="16"
          max="64"
          value={parseInt(props.logoSize)}
          onChange={(e) => setProp((props: HeaderProps) => (props.logoSize = `${e.target.value}px`))}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.logoSize}</span>
      </div>
      
      {/* Show Navigation */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.showNav}
            onChange={(e) => setProp((props: HeaderProps) => (props.showNav = e.target.checked))}
            className="rounded"
          />
          <span className="text-sm">Show Navigation Menu</span>
        </label>
      </div>
      
      {/* Add Navigation Item */}
      <div>
        <label className="block text-sm font-medium mb-2">Add Navigation Item</label>
        <input
          type="text"
          placeholder="New menu item"
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                setProp((props: HeaderProps) => (props.navItems = [...(props.navItems || []), input.value.trim()]));
                input.value = '';
              }
            }
          }}
        />
        <div className="text-xs text-gray-400 mt-1">Press Enter to add</div>
      </div>

      {/* Current Navigation Items */}
      {props.navItems && props.navItems.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Current Menu Items</label>
          <div className="space-y-1">
            {props.navItems.map((item: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm text-gray-300 flex-1">{item}</span>
                <button
                  onClick={() => {
                    const newItems = props.navItems?.filter((_: string, i: number) => i !== index);
                    setProp((props: HeaderProps) => (props.navItems = newItems));
                  }}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

EditableHeader.craft = {
  props: {
    logo: '🍕',
    logoText: 'Little Latte Lane',
    navItems: ['Menu', 'Bookings', 'Events', 'Contact'],
    backgroundColor: '#0a0a0a',
    textColor: '#ffffff',
    logoSize: '32px',
    showNav: true
  },
  related: {
    settings: EditableHeaderSettings,
  },
};
