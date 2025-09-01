'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pipette, Palette, Hash } from 'lucide-react';

interface GradientPickerProps {
  value: string;
  onChange: (gradient: string) => void;
  onClose: () => void;
}

export default function GradientPicker({ value, onChange, onClose }: GradientPickerProps) {
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [direction, setDirection] = useState('to right');
  const [color1, setColor1] = useState('#FF6B35');
  const [color2, setColor2] = useState('#06FFA5');
  const [customGradient, setCustomGradient] = useState(value || '');

  // Predefined gradient presets
  const gradientPresets = [
    { name: 'Neon Sunset', value: 'linear-gradient(to right, #FF6B35, #F7931E)' },
    { name: 'Ocean Breeze', value: 'linear-gradient(to right, #06FFA5, #3BCEAC)' },
    { name: 'Purple Rain', value: 'linear-gradient(to right, #8B5CF6, #EC4899)' },
    { name: 'Dawn Sky', value: 'linear-gradient(to right, #3B82F6, #06B6D4)' },
    { name: 'Fire Glow', value: 'linear-gradient(45deg, #EF4444, #F59E0B)' },
    { name: 'Forest Fresh', value: 'linear-gradient(135deg, #10B981, #84CC16)' },
    { name: 'Midnight Dark', value: 'linear-gradient(to bottom, #1F2937, #374151)' },
    { name: 'Cyber Neon', value: 'linear-gradient(45deg, #06FFA5, #FF6B35, #8B5CF6)' },
    { name: 'Radial Burst', value: 'radial-gradient(circle, #FF6B35, #1F2937)' },
    { name: 'Rainbow Glow', value: 'linear-gradient(90deg, #EF4444, #F59E0B, #84CC16, #06B6D4, #8B5CF6, #EC4899)' },
  ];

  const directions = [
    { label: 'To Right', value: 'to right' },
    { label: 'To Left', value: 'to left' },
    { label: 'To Bottom', value: 'to bottom' },
    { label: 'To Top', value: 'to top' },
    { label: 'To Bottom Right', value: 'to bottom right' },
    { label: 'To Bottom Left', value: 'to bottom left' },
    { label: 'To Top Right', value: 'to top right' },
    { label: 'To Top Left', value: 'to top left' },
    { label: '45 Degrees', value: '45deg' },
    { label: '90 Degrees', value: '90deg' },
    { label: '135 Degrees', value: '135deg' },
    { label: '180 Degrees', value: '180deg' },
  ];

  const generateGradient = () => {
    if (gradientType === 'linear') {
      return `linear-gradient(${direction}, ${color1}, ${color2})`;
    } else {
      return `radial-gradient(circle, ${color1}, ${color2})`;
    }
  };

  const currentGradient = customGradient || generateGradient();

  const handlePresetClick = (preset: string) => {
    setCustomGradient(preset);
  };

  const handleApply = () => {
    onChange(currentGradient);
    onClose();
  };

  const handleClear = () => {
    onChange('transparent');
    onClose();
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl w-96">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Gradient Builder</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </Button>
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-700">
          <TabsTrigger value="presets" className="text-gray-300 data-[state=active]:text-white">
            <Palette className="w-4 h-4 mr-2" />
            Presets
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-gray-300 data-[state=active]:text-white">
            <Pipette className="w-4 h-4 mr-2" />
            Custom
          </TabsTrigger>
          <TabsTrigger value="code" className="text-gray-300 data-[state=active]:text-white">
            <Hash className="w-4 h-4 mr-2" />
            Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {gradientPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(preset.value)}
                className={`h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  currentGradient === preset.value 
                    ? 'border-white shadow-lg' 
                    : 'border-gray-500 hover:border-gray-300'
                }`}
                style={{ background: preset.value }}
                title={preset.name}
              >
                <div className="text-xs text-white text-shadow font-medium px-2">
                  {preset.name}
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label className="text-gray-300">Gradient Type</Label>
              <Select value={gradientType} onValueChange={(value: 'linear' | 'radial') => setGradientType(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-500 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-500">
                  <SelectItem value="linear">Linear Gradient</SelectItem>
                  <SelectItem value="radial">Radial Gradient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {gradientType === 'linear' && (
              <div>
                <Label className="text-gray-300">Direction</Label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger className="bg-gray-700 border-gray-500 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-500">
                    {directions.map((dir) => (
                      <SelectItem key={dir.value} value={dir.value}>
                        {dir.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-300">Start Color</Label>
                <div className="flex space-x-2">
                  <Input
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="bg-gray-700 border-gray-500 text-white font-mono"
                    placeholder="#FF6B35"
                  />
                  <div
                    className="w-10 h-10 rounded border border-gray-500 flex-shrink-0"
                    style={{ backgroundColor: color1 }}
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300">End Color</Label>
                <div className="flex space-x-2">
                  <Input
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="bg-gray-700 border-gray-500 text-white font-mono"
                    placeholder="#06FFA5"
                  />
                  <div
                    className="w-10 h-10 rounded border border-gray-500 flex-shrink-0"
                    style={{ backgroundColor: color2 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">CSS Gradient Code</Label>
            <textarea
              value={customGradient}
              onChange={(e) => setCustomGradient(e.target.value)}
              placeholder="linear-gradient(to right, #FF6B35, #06FFA5)"
              className="w-full h-24 bg-gray-700 border-gray-500 text-white font-mono text-sm rounded px-3 py-2 resize-none"
            />
            <div className="text-xs text-gray-400">
              Enter any valid CSS gradient
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      <div className="mt-4">
        <Label className="text-gray-300">Preview</Label>
        <div
          className="w-full h-16 rounded-lg border-2 border-gray-500 mt-2"
          style={{ background: currentGradient }}
        />
        <div className="text-xs text-gray-400 mt-1 font-mono break-all">
          {currentGradient}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-600">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="border-gray-500 text-gray-300 hover:bg-gray-700"
        >
          Clear
        </Button>
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
            Apply Gradient
          </Button>
        </div>
      </div>
    </div>
  );
}
