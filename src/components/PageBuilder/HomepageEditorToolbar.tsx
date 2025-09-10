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
  PowerOff,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useEditorSelection } from '@/lib/pageEditor/EditorSelectionStore';
import { getAvailableToolsForComponent, COMPONENT_TYPE_CONFIGS } from '@/lib/pageEditor/ComponentRegistry';

interface HomepageEditorToolbarProps {
  selectedTool: 'text' | 'color' | 'background' | 'image';
  setSelectedTool: (tool: 'text' | 'color' | 'background' | 'image') => void;
}

export const HomepageEditorToolbar: React.FC<HomepageEditorToolbarProps> = ({
  selectedTool,
  setSelectedTool
}) => {
  const router = useRouter();
  
  const { 
    selectedComponentId, 
    selectedComponent, 
    isEditMode, 
    setEditMode,
    saveStatus,
    saveMessage,
    lastSaved
  } = useEditorSelection();

  // Get available tools for selected component
  const availableTools = selectedComponentId 
    ? getAvailableToolsForComponent(selectedComponentId)
    : [];

  const allTools = [
    { id: 'text' as const, icon: Type, label: 'Edit Text', color: 'text-blue-400' },
    { id: 'color' as const, icon: Palette, label: 'Colors', color: 'text-pink-400' },
    { id: 'background' as const, icon: Eye, label: 'Background', color: 'text-purple-400' },
    { id: 'image' as const, icon: Image, label: 'Images', color: 'text-green-400' },
  ];

  // Filter tools based on selected component
  const availableToolConfigs = allTools.filter(tool => 
    !selectedComponentId || availableTools.includes(tool.id)
  );

  const handleSave = () => {
    // This will be connected to actual save functionality
    console.log('💾 Manual save triggered');
  };

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
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Click any component to start editing</span>
            {selectedComponent && (
              <>
                <span>•</span>
                <span className="text-neonCyan">
                  {COMPONENT_TYPE_CONFIGS[selectedComponent.type].icon} {selectedComponent.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center Section - Context-Aware Tools */}
      <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-2">
        {!selectedComponent ? (
          <div className="text-gray-400 text-sm px-4 py-2">
            Select a component to see available tools
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-400 px-2">
              Available for {selectedComponent.type}:
            </div>
            {availableToolConfigs.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool === tool.id;
              const isDisabled = !availableTools.includes(tool.id);
              
              return (
                <Button
                  key={tool.id}
                  onClick={(e) => {
                    e.stopPropagation(); // 🎯 PREVENT component deselection
                    if (!isDisabled) {
                      setSelectedTool(tool.id);
                    }
                  }}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  disabled={isDisabled}
                  className={`${
                    isSelected 
                      ? 'bg-neonCyan/20 border-neonCyan text-neonCyan' 
                      : isDisabled
                        ? 'opacity-30 cursor-not-allowed'
                        : `hover:${tool.color} hover:bg-gray-700/50`
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tool.label}
                </Button>
              );
            })}
          </>
        )}
      </div>

      {/* Right Section - Editor Controls & Save Status */}
      <div className="flex items-center gap-3">
        {/* Save Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-yellow-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Saved</span>
              {lastSaved && (
                <span className="text-gray-400">
                  {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>Save Failed</span>
            </div>
          )}
        </div>

        {/* Editor Toggle */}
        <Button
          onClick={(e) => {
            e.stopPropagation(); // 🎯 PREVENT component deselection
            setEditMode(!isEditMode);
          }}
          variant="outline"
          size="sm"
          className={`${
            isEditMode 
              ? 'border-green-500 text-green-400 hover:bg-green-500/10' 
              : 'border-red-500 text-red-400 hover:bg-red-500/10'
          }`}
        >
          {isEditMode ? (
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

        {/* Manual Save Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          variant="outline"
          size="sm"
          disabled={saveStatus === 'saving'}
          className="border-neonPink text-neonPink hover:bg-neonPink/10 disabled:opacity-50"
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
      
      {/* Save Message Toast */}
      {saveMessage && (
        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-2 rounded-md text-sm font-medium z-50 ${
          saveStatus === 'success' 
            ? 'bg-green-500 text-white' 
            : saveStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-yellow-500 text-black'
        }`}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};
