'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff,
  Save,
  GripVertical,
  Palette
} from 'lucide-react';
import DynamicCarousel from '@/components/DynamicCarousel';
import type { CarouselPanel, PanelConfig } from '@/lib/carouselTemplates';
import { PANEL_TEMPLATES, getTemplateById, createPanelFromTemplate } from '@/lib/carouselTemplates';

export default function CarouselEditor() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [panels, setPanels] = useState<CarouselPanel[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<CarouselPanel | null>(null);
  const [editingConfig, setEditingConfig] = useState<PanelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    fetchPanels();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPanels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/carousel-panels');
      const data = await response.json();
      
      if (data.success) {
        setPanels(data.panels);
      } else {
        toast({
          title: "Error",
          description: "Failed to load carousel panels",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching panels:', error);
      toast({
        title: "Error",
        description: "Failed to load carousel panels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPanel = async (templateId: string) => {
    try {
      const panelId = `panel-${Date.now()}`;
      const newPanelData = createPanelFromTemplate(templateId, panelId, panels.length + 1);
      
      const response = await fetch('/api/carousel-panels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPanelData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPanels([...panels, data.panel]);
        setShowTemplateSelector(false);
        toast({
          title: "Panel Added",
          description: "New carousel panel has been added successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add panel",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding panel:', error);
      toast({
        title: "Error",
        description: "Failed to add panel",
        variant: "destructive",
      });
    }
  };

  const handleDeletePanel = async (panelId: string) => {
    if (!confirm('Are you sure you want to delete this panel?')) return;
    
    try {
      const response = await fetch(`/api/carousel-panels?id=${panelId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPanels(panels.filter(panel => panel.id !== panelId));
        if (selectedPanel?.id === panelId) {
          setSelectedPanel(null);
          setEditingConfig(null);
        }
        toast({
          title: "Panel Deleted",
          description: "Carousel panel has been deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete panel",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting panel:', error);
      toast({
        title: "Error",
        description: "Failed to delete panel",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (panel: CarouselPanel) => {
    try {
      const response = await fetch('/api/carousel-panels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: panel.id,
          is_active: !panel.is_active,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPanels(panels.map(p => 
          p.id === panel.id ? { ...p, is_active: !p.is_active } : p
        ));
        toast({
          title: panel.is_active ? "Panel Deactivated" : "Panel Activated",
          description: `Panel is now ${!panel.is_active ? 'visible' : 'hidden'} in the carousel`,
        });
      }
    } catch (error) {
      console.error('Error toggling panel:', error);
    }
  };

  const handleEditPanel = (panel: CarouselPanel) => {
    setSelectedPanel(panel);
    setEditingConfig({ ...panel.config });
  };

  const handleSaveConfig = async () => {
    if (!selectedPanel || !editingConfig) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/carousel-panels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPanel.id,
          config: editingConfig,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPanels(panels.map(p => 
          p.id === selectedPanel.id ? { ...p, config: editingConfig } : p
        ));
        setSelectedPanel(null);
        setEditingConfig(null);
        toast({
          title: "Changes Saved",
          description: "Panel configuration has been updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save changes",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan mx-auto mb-4"></div>
          <p className="text-neonText">Loading carousel editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-96 bg-gray-900 border-r border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/page-editor')}
                className="border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-darkBg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Carousel Editor</h1>
            <p className="text-sm text-gray-400">Manage carousel panels and content</p>
          </div>

          {/* Panel List */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Panels ({panels.length})</h2>
              <Button
                size="sm"
                onClick={() => setShowTemplateSelector(true)}
                className="bg-neonCyan text-darkBg hover:bg-neonCyan/80"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {panels.map((panel, index) => (
              <Card 
                key={panel.id} 
                className={`border cursor-pointer transition-all ${
                  selectedPanel?.id === panel.id 
                    ? 'border-neonPink bg-gray-800' 
                    : panel.is_active 
                      ? 'border-neonCyan bg-gray-800/50' 
                      : 'border-gray-600 bg-gray-800/30'
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                      <Badge 
                        variant={panel.is_active ? "default" : "secondary"}
                        className={panel.is_active ? "bg-green-600" : "bg-gray-600"}
                      >
                        {panel.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(panel);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {panel.is_active ? 
                          <Eye className="h-3 w-3" /> : 
                          <EyeOff className="h-3 w-3" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPanel(panel);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePanel(panel.id);
                        }}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    {panel.config.title?.text || 'Untitled Panel'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {panel.config.description?.text || 'No description'}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {getTemplateById(panel.template_id)?.name || panel.template_id}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {panels.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No panels created yet</p>
                <Button
                  onClick={() => setShowTemplateSelector(true)}
                  className="bg-neonCyan text-darkBg hover:bg-neonCyan/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Panel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Preview Header */}
          <div className="bg-gray-900 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Live Preview</h1>
                <p className="text-sm text-gray-400">
                  {panels.filter(p => p.is_active).length} active panels
                </p>
              </div>
            </div>
          </div>

          {/* Carousel Preview */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-darkBg via-gray-900 to-darkBg p-8">
            <DynamicCarousel panels={panels} />
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto m-4 bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Choose Panel Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PANEL_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:border-neonCyan transition-colors border-gray-600"
                    onClick={() => handleAddPanel(template.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-white mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.components.map((component) => (
                          <Badge key={component} variant="outline" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplateSelector(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Panel Editor Modal */}
      {selectedPanel && editingConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto m-4 bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Edit Panel: {editingConfig.title?.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Title</label>
                <Input
                  value={editingConfig.title?.text || ''}
                  onChange={(e) => setEditingConfig({
                    ...editingConfig,
                    title: { ...editingConfig.title!, text: e.target.value }
                  })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Description</label>
                <Textarea
                  value={editingConfig.description?.text || ''}
                  onChange={(e) => setEditingConfig({
                    ...editingConfig,
                    description: { ...editingConfig.description!, text: e.target.value }
                  })}
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={2}
                />
              </div>

              {/* Badge */}
              {editingConfig.badge && (
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Badge Text</label>
                  <Input
                    value={editingConfig.badge.text || ''}
                    onChange={(e) => setEditingConfig({
                      ...editingConfig,
                      badge: { ...editingConfig.badge!, text: e.target.value }
                    })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPanel(null);
                    setEditingConfig(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="bg-neonCyan text-darkBg hover:bg-neonCyan/80"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-darkBg mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
