'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

export interface EditableBookingsSectionProps {
  title?: string;
  backgroundColor?: string;
}

export const EditableBookingsSection: React.FC<EditableBookingsSectionProps> & { 
  craft?: { 
    props: EditableBookingsSectionProps; 
    related: { settings: React.ComponentType };
  } 
} = ({
  title = '🎯 Book Your Experience',
  backgroundColor = '#0a0a0a'
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
          onChange={(e) => setProp((props: EditableBookingsSectionProps) => (props.title = e.target.value))}
          tagName="h2"
          className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent outline-none"
        />
        
        {selected && (
          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-blue-400 text-sm">
              💡 Bookings Section - Click to edit title and styling. Full booking system managed separately
            </p>
          </div>
        )}
        
        <div className="mt-8 p-6 bg-black/20 rounded-lg">
          <p className="text-gray-300">Virtual Golf Booking and dining reservations load here...</p>
        </div>
      </div>
    </section>
  );
};

export const EditableBookingsSectionSettings = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Bookings Section Settings</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props: EditableBookingsSectionProps) => (props.backgroundColor = e.target.value))}
          className="w-full h-10 border border-gray-600 rounded"
        />
      </div>
    </div>
  );
};

EditableBookingsSection.craft = {
  props: {
    title: '🎯 Book Your Experience',
    backgroundColor: '#0a0a0a'
  },
  related: {
    settings: EditableBookingsSectionSettings,
  },
};
