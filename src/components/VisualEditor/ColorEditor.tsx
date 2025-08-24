'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Palette, X, Check } from 'lucide-react';

interface ColorEditorProps {
  settingKey: string;
  currentValue: string;
  label: string;
  onSave: (key: string, value: string) => Promise<void>;
  onCancel: () => void;
}

export function ColorEditor({ settingKey, currentValue, label, onSave, onCancel }: ColorEditorProps) {
  const [color, setColor] = useState(currentValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settingKey, color);
    } finally {
      setIsSaving(false);
    }
  };

  const presetColors = [
    '#00FFFF', // Neon Cyan
    '#FF00FF', // Neon Pink  
    '#0066FF', // Neon Blue
    '#00FF00', // Neon Green
    '#FFFF00', // Neon Yellow
    '#FF6600', // Neon Orange
    '#9966FF', // Neon Purple
    '#FFFFFF', // White
    '#000000', // Black
    '#FF0000', // Red
  ];

  return (
    <Card className="absolute top-2 right-2 p-4 bg-gray-900 border-neonCyan/30 shadow-xl z-50 min-w-[300px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-neonCyan" />
            <span className="text-white font-medium">{label}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {/* Color Input */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Color Value</label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1 bg-gray-800 border-gray-600"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#00FFFF"
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Preset Colors</label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    color === presetColor 
                      ? 'border-neonCyan scale-110' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Preview</label>
            <div 
              className="w-full h-8 rounded border border-gray-600"
              style={{ backgroundColor: color }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-neonCyan text-black hover:bg-neonCyan/80"
            >
              <Check className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Apply'}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
