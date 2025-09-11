'use client';

import React, { useState, useEffect } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { 
  CraftText, 
  CraftImage, 
  CraftContainer, 
  CraftButton 
} from './SimpleCraftComponents';
import { 
  Type, Image, Layout, MousePointer, 
  Save, Eye, Undo, Redo, Trash2, Plus,
  Layers, Settings as SettingsIcon, Download, Upload
} from 'lucide-react';
import { useCraftPageData } from '@/hooks/useCraftPageData';

// Component Toolbox
const ComponentToolbox = () => {
  const { connectors } = useEditor();

  const components = [
    {
      name: 'Text',
      icon: Type,
      component: CraftText,
      props: { text: 'Click to edit text' }
    },
    {
      name: 'Image',
      icon: Image,
      component: CraftImage,
      props: { src: '/api/placeholder/300/200' }
    },
    {
      name: 'Container',
      icon: Layout,
      component: CraftContainer,
      props: { minHeight: 150 }
    },
    {
      name: 'Button',
      icon: MousePointer,
      component: CraftButton,
      props: { text: 'Click me' }
    }
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Components
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {components.map((comp) => {
          const Icon = comp.icon;
          return (
            <button
              key={comp.name}
              ref={(ref) => {
                if (ref) {
                  connectors.create(
                    ref,
                    <Element is={comp.component} {...comp.props} />
                  );
                }
              }}
              className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white text-sm"
            >
              <Icon className="h-5 w-5" />
              {comp.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Layers Panel
const LayersPanel = () => {
  const { query, actions } = useEditor((state) => ({
    nodes: state.nodes
  }));

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Layers
      </h3>
      <div className="space-y-2">
        {/* Layer items would be dynamically generated here */}
        <div className="text-gray-400 text-sm">
          Layers panel - coming soon
        </div>
      </div>
    </div>
  );
};

// Settings Panel
const SettingsPanel = () => {
  const { selected, actions } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').last();
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related?.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
    };
  });

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <SettingsIcon className="h-4 w-4" />
        Settings
      </h3>
      
      {selected ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{selected.name}</span>
            {selected.isDeletable && (
              <button
                onClick={() => actions.delete(selected.id)}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {selected.settings && React.createElement(selected.settings)}
        </div>
      ) : (
        <div className="text-gray-400 text-sm">
          Select an element to edit its properties
        </div>
      )}
    </div>
  );
};

// Main Toolbar
const EditorToolbar = ({ onSave, isSaving }: { onSave: () => void; isSaving: boolean }) => {
  const { actions, canUndo, canRedo, enabled } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => actions.setOptions(options => (options.enabled = !enabled))}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              enabled 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {enabled ? 'Exit Edit Mode' : 'Edit Mode'}
          </button>
          
          {enabled && (
            <>
              <button
                onClick={() => actions.history.undo()}
                disabled={!canUndo}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => actions.history.redo()}
                disabled={!canRedo}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            title="Save Changes"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Craft.js Editor Interface
interface CraftPageEditorProps {
  children?: React.ReactNode;
  page?: string;
}

export default function CraftPageEditor({ page = 'homepage' }: CraftPageEditorProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { savePage, isSaving, error } = useCraftPageData(page);

  // Save function for toolbar
  const handleSave = async () => {
    try {
      // This would need to get the current editor state
      // For now, we'll create a placeholder
      await savePage({});
      console.log('Page saved successfully');
    } catch (err) {
      console.error('Failed to save page:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Editor
        resolver={{
          CraftText,
          CraftImage,
          CraftContainer,
          CraftButton,
        }}
        onRender={(render) => (
          <div className="craft-editor-wrapper">
            {render.render}
          </div>
        )}
      >
        <EditorToolbar onSave={handleSave} isSaving={isSaving} />
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 m-4 rounded-lg">
            Error: {error}
          </div>
        )}
        
        <div className="flex h-screen">
          {/* Left Sidebar */}
          <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-80'
          }`}>
            <div className="p-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="mb-4 p-2 text-gray-400 hover:text-white"
              >
                <Layers className="h-5 w-5" />
              </button>
              
              {!sidebarCollapsed && (
                <div className="space-y-6">
                  <ComponentToolbox />
                  <LayersPanel />
                </div>
              )}
            </div>
          </div>

          {/* Main Canvas */}
          <div className="flex-1 relative">
            <Frame>
              <Element
                is={CraftContainer}
                padding={20}
                backgroundColor="transparent"
                canvas
              >
                <Element
                  is={CraftText}
                  text="Welcome to Little Latte Lane"
                  fontSize={32}
                  color="#ffffff"
                  textAlign="center"
                />
                <Element
                  is={CraftText}
                  text="Experience the perfect blend of great coffee, delicious food, and virtual golf entertainment"
                  fontSize={18}
                  color="#d1d5db"
                  textAlign="center"
                />
              </Element>
            </Frame>
          </div>

          {/* Right Sidebar - Settings */}
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <SettingsPanel />
          </div>
        </div>

        {/* Custom Styles for Edit Mode */}
        <style jsx global>{`
          .craft-editor-wrapper [data-cy="selected"] {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
          }
          
          .craft-editor-wrapper [data-cy="hover"] {
            outline: 2px dashed #10b981 !important;
            outline-offset: 2px !important;
          }
          
          .craft-selected {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
          }
          
          .craft-text,
          .craft-image,
          .craft-container,
          .craft-button {
            position: relative;
          }
          
          .craft-text:hover,
          .craft-image:hover,
          .craft-container:hover,
          .craft-button:hover {
            outline: 1px dashed #10b981;
            outline-offset: 1px;
          }
        `}</style>
      </Editor>
    </div>
  );
}
