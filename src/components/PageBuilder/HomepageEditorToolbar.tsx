'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Type, 
  Palette, 
  Image, 
  Eye,
  Save,
  Download,
  Power,
  PowerOff
} from 'lucide-react';

interface HomepageEditorToolbarProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  selectedTool: 'text' | 'color' | 'image' | 'toggle';
  setSelectedTool: (tool: 'text' | 'color' | 'image' | 'toggle') => void;
}

export const HomepageEditorToolbar: React.FC<HomepageEditorToolbarProps> = ({
  enabled,
  setEnabled,
  selectedTool,
  setSelectedTool
}) => {
  const router = useRouter();

  const tools = [
    { id: 'text' as const, icon: Type, label: 'Edit Text', color: 'text-blue-400' },
    { id: 'color' as const, icon: Palette, label: 'Colors', color: 'text-pink-400' },
    { id: 'image' as const, icon: Image, label: 'Images', color: 'text-green-400' },
    { id: 'toggle' as const, icon: Eye, label: 'Show/Hide', color: 'text-yellow-400' },
  ];

  return (
    <div 
      className="bg-gray-800/95 backdrop-blur-xl border-b border-gray-700 px-4 py-3 flex items-center justify-between shadow-xl"
      onClick={(e) => e.stopPropagation()} // 🎯 PREVENT component deselection
    >
      {/* Left Section - Back Button & Title */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push('/admin')}
          variant="outline"
          size="sm"
          className="border-gray-600 hover:border-neonCyan hover:text-neonCyan"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
        
        <div className="border-l border-gray-600 pl-4">
          <h1 className="text-xl font-bold text-white">
            🏠 Homepage Editor
          </h1>
          <p className="text-sm text-gray-400">
            Click any component below to edit • No navigation distractions
          </p>
        </div>
      </div>

      {/* Center Section - Editing Tools */}
      <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          
          return (
            <Button
              key={tool.id}
              onClick={(e) => {
                e.stopPropagation(); // 🎯 PREVENT component deselection
                setSelectedTool(tool.id);
              }}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              className={`${
                isSelected 
                  ? 'bg-neonCyan/20 border-neonCyan text-neonCyan' 
                  : `hover:${tool.color} hover:bg-gray-700/50`
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tool.label}
            </Button>
          );
        })}
      </div>

      {/* Right Section - Editor Controls */}
      <div className="flex items-center gap-3">
        {/* Editor Toggle */}
        <Button
          onClick={(e) => {
            e.stopPropagation(); // 🎯 PREVENT component deselection
            setEnabled(!enabled);
          }}
          variant="outline"
          size="sm"
          className={`${
            enabled 
              ? 'border-green-500 text-green-400 hover:bg-green-500/10' 
              : 'border-red-500 text-red-400 hover:bg-red-500/10'
          }`}
        >
          {enabled ? (
            <>
              <Power className="h-4 w-4 mr-2" />
              Editing ON
            </>
          ) : (
            <>
              <PowerOff className="h-4 w-4 mr-2" />
              Preview Mode
            </>
          )}
        </Button>

        {/* Save Button */}
        <Button
          variant="outline"
          size="sm"
          className="border-neonPink text-neonPink hover:bg-neonPink/10"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>

        {/* Export Button */}
        <Button
          variant="outline"
          size="sm"
          className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};
