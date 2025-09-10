'use client';

import React from 'react';
import { useNode } from '@craftjs/core';

interface EditableTextElementProps {
  children: React.ReactNode;
  className?: string;
  elementId: string;
  elementType: 'heading' | 'paragraph' | 'badge' | 'span';
}

export const EditableTextElement: React.FC<EditableTextElementProps> = ({
  children,
  className = '',
  elementId,
  elementType
}) => {
  const {
    connectors: { connect },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected
  }));

  const handleContentChange = (newContent: string) => {
    setProp((props: { content: string }) => {
      props.content = newContent;
    });
  };

  // Choose the appropriate HTML element
  const Element = elementType === 'heading' ? 'h1' : 
                  elementType === 'paragraph' ? 'p' : 
                  elementType === 'badge' ? 'div' : 'span';

  return (
    <Element
      ref={(ref) => {
        if (ref) connect(ref as HTMLElement);
      }}
      className={`${className} ${
        selected ? 'ring-2 ring-neonCyan ring-offset-2 ring-offset-gray-900' : ''
      } transition-all duration-200 hover:ring-1 hover:ring-neonCyan/50 hover:ring-offset-1 hover:ring-offset-gray-900 cursor-pointer relative group`}
      data-editable={elementId}
      contentEditable={selected}
      suppressContentEditableWarning={true}
      onBlur={(e) => {
        const newContent = e.currentTarget.textContent || '';
        handleContentChange(newContent);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    >
      {children}
      {selected && (
        <div className="absolute -top-6 left-0 bg-neonCyan text-black text-xs px-2 py-1 rounded-md z-10 whitespace-nowrap">
          Editing: {elementId.replace('-', ' ')}
        </div>
      )}
    </Element>
  );
};

export default EditableTextElement;
