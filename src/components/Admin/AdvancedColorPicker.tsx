'use client';

import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Pipette, Hash } from 'lucide-react';

interface AdvancedColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

export default function AdvancedColorPicker({ color, onChange, onClose }: AdvancedColorPickerProps) {
  const [currentColor, setCurrentColor] = useState(color);
  const [hexInput, setHexInput] = useState(color);

  // Predefined color palette with professional colors
  const colorPalette = [
    // Neon theme colors
    '#06FFA5', '#FF6B35', '#3BCEAC', '#F7931E',
    // UI colors
    '#3B82F6', '#8B5CF6', '#EC4899', '#10B981',
    // Grayscale
    '#1F2937', '#374151', '#4B5563', '#6B7280',
    '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F9FAFB',
    // Additional vibrant colors
    '#EF4444', '#F59E0B', '#84CC16', '#06B6D4',
    '#8B5CF6', '#EC4899', '#F97316', '#22C55E'
  ];

  const handleColorChange = (colorResult: any) => {
    const newColor = colorResult.hex;
    setCurrentColor(newColor);
    setHexInput(newColor);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);
    
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setCurrentColor(value);
    }
  };

  const handleApply = () => {
    onChange(currentColor);
    onClose();
  };

  const handlePaletteColorClick = (paletteColor: string) => {
    setCurrentColor(paletteColor);
    setHexInput(paletteColor);
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Advanced Color Picker</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </Button>
      </div>

      <Tabs defaultValue="picker" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-700">
          <TabsTrigger value="picker" className="text-gray-300 data-[state=active]:text-white">
            <Palette className="w-4 h-4 mr-2" />
            Picker
          </TabsTrigger>
          <TabsTrigger value="palette" className="text-gray-300 data-[state=active]:text-white">
            <Pipette className="w-4 h-4 mr-2" />
            Palette
          </TabsTrigger>
          <TabsTrigger value="hex" className="text-gray-300 data-[state=active]:text-white">
            <Hash className="w-4 h-4 mr-2" />
            Hex
          </TabsTrigger>
        </TabsList>

        <TabsContent value="picker" className="space-y-4">
          <div className="flex justify-center">
            <SketchPicker
              color={currentColor}
              onChange={handleColorChange}
              disableAlpha={false}
              styles={{
                default: {
                  picker: {
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                  },
                },
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="palette" className="space-y-4">
          <div className="grid grid-cols-8 gap-2">
            {colorPalette.map((paletteColor, index) => (
              <button
                key={index}
                onClick={() => handlePaletteColorClick(paletteColor)}
                className={`w-8 h-8 rounded-md border-2 transition-all duration-200 hover:scale-110 ${
                  currentColor === paletteColor 
                    ? 'border-white shadow-lg' 
                    : 'border-gray-500 hover:border-gray-300'
                }`}
                style={{ backgroundColor: paletteColor }}
                title={paletteColor}
              />
            ))}
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Click any color to select</div>
          </div>
        </TabsContent>

        <TabsContent value="hex" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hex-input" className="text-gray-300">
              Hex Color Code
            </Label>
            <Input
              id="hex-input"
              value={hexInput}
              onChange={handleHexInputChange}
              placeholder="#FF6B35"
              className="bg-gray-700 border-gray-500 text-white font-mono"
            />
            <div className="text-xs text-gray-400">
              Enter a valid hex color (e.g., #FF6B35)
            </div>
          </div>
          
          {/* Color preview */}
          <div className="flex items-center space-x-3">
            <div
              className="w-16 h-16 rounded-lg border-2 border-gray-500"
              style={{ backgroundColor: currentColor }}
            />
            <div className="text-sm text-gray-300">
              <div>Preview</div>
              <div className="font-mono text-xs text-gray-400">{currentColor}</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-600">
        <div
          className="w-8 h-8 rounded border-2 border-gray-500"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-gray-500 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="bg-neonCyan text-black hover:bg-neonCyan/80"
          >
            Apply Color
          </Button>
        </div>
      </div>
    </div>
  );
}
