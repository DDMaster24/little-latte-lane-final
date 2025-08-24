'use client';

import React, { useState } from 'react';
import { useTheme } from './SimpleThemeProvider';
import { ColorEditor } from './ColorEditor';

interface EditableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function EditableHeader({ children, className = '' }: EditableHeaderProps) {
  const { isEditorMode, getSetting, updateSetting } = useTheme();
  const [activeEditor, setActiveEditor] = useState<string | null>(null);

  const handleColorSave = async (key: string, value: string) => {
    await updateSetting(key, value);
    setActiveEditor(null);
  };

  const handleColorCancel = () => {
    setActiveEditor(null);
  };

  // Get current color values
  const primaryColor = getSetting('primary_color', '#00FFFF');
  const secondaryColor = getSetting('secondary_color', '#FF00FF');

  // Apply styles based on theme settings
  const headerStyle = {
    '--header-primary': primaryColor,
    '--header-secondary': secondaryColor,
  } as React.CSSProperties;

  return (
    <div 
      className={`relative ${className}`} 
      style={headerStyle}
    >
      {/* Editor mode buttons */}
      {isEditorMode && (
        <div className="absolute top-0 right-0 flex gap-2 p-2 z-40">
          <button
            onClick={() => setActiveEditor('primary_color')}
            className="w-6 h-6 rounded border-2 border-white/50 hover:border-white transition-colors"
            style={{ backgroundColor: primaryColor }}
            title="Edit Primary Color"
          />
          <button
            onClick={() => setActiveEditor('secondary_color')}
            className="w-6 h-6 rounded border-2 border-white/50 hover:border-white transition-colors"
            style={{ backgroundColor: secondaryColor }}
            title="Edit Secondary Color"
          />
        </div>
      )}

      {/* Color Editors */}
      {activeEditor === 'primary_color' && (
        <ColorEditor
          settingKey="primary_color"
          currentValue={primaryColor}
          label="Primary Color"
          onSave={handleColorSave}
          onCancel={handleColorCancel}
        />
      )}
      
      {activeEditor === 'secondary_color' && (
        <ColorEditor
          settingKey="secondary_color"
          currentValue={secondaryColor}
          label="Secondary Color"
          onSave={handleColorSave}
          onCancel={handleColorCancel}
        />
      )}

      {/* Header content with CSS variables */}
      <div className="header-content">
        {children}
      </div>
    </div>
  );
}
