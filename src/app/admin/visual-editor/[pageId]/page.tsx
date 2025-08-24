'use client';

import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Undo, 
  Redo, 
  X, 
  Eye, 
  EyeOff, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState, use } from 'react';

interface VisualEditorProps {
  params: Promise<{ pageId: string }>;
}

export default function VisualEditorPage({ params }: VisualEditorProps) {
  const { pageId } = use(params);
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get('target') || '/';
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Access control
  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">You need admin privileges to access the visual editor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPageTitle = (pageId: string) => {
    const titles: Record<string, string> = {
      homepage: 'Homepage',
      menu: 'Menu Page',
      ordering: 'Ordering Flow',
      account: 'My Account',
      global: 'Global Elements',
      theme: 'Theme Settings'
    };
    return titles[pageId] || 'Visual Editor';
  };

  const handleSave = () => {
    // Save changes (this will be implemented when we add the editing functionality)
    setHasUnsavedChanges(false);
    // Show success message
  };

  const handleUndo = () => {
    // Undo last change
  };

  const handleRedo = () => {
    // Redo last change
  };

  const handleRefresh = () => {
    // Refresh the iframe
    setIframeKey(prev => prev + 1);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to go back?')) {
        window.location.href = '/admin/visual-editor';
      }
    } else {
      window.location.href = '/admin/visual-editor';
    }
  };

  // Construct the URL for the iframe with editor mode
  // Use current window location to ensure we're using the right domain/port
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const editorUrl = `${baseUrl}${targetUrl}${targetUrl.includes('?') ? '&' : '?'}editor=true&admin=true`;

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">
              {getPageTitle(pageId)} Editor
            </h1>
            <Badge variant="outline" className="border-neonCyan text-neonCyan">
              {targetUrl}
            </Badge>
            {hasUnsavedChanges && (
              <Badge className="bg-yellow-500 text-black">
                Unsaved Changes
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Controls */}
            <Button
              onClick={handleUndo}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleRedo}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled
            >
              <Redo className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-600 mx-2" />

            {/* Preview Toggle */}
            <Button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {isPreviewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>

            {/* Refresh */}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* External Link */}
            <Button
              onClick={() => window.open(targetUrl, '_blank')}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-600 mx-2" />

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="bg-neonCyan text-black hover:bg-neonCyan/80"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>

            {/* Close/Back */}
            <Button
              onClick={handleClose}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              title="Back to Visual Editor"
            >
              <X className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex">
        {/* Settings Panel (collapsed by default) */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 hidden">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Editor Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-300 block mb-1">Grid Snap</label>
                <input type="checkbox" className="rounded" />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1">Show Guidelines</label>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 relative">
          {/* Loading State */}
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonCyan mx-auto mb-4"></div>
              <p className="text-gray-300">Loading editor...</p>
            </div>
          </div>

          {/* Page Iframe */}
          <iframe
            key={iframeKey}
            src={isPreviewMode ? targetUrl : editorUrl}
            className="w-full h-full border-0"
            title={`${getPageTitle(pageId)} Editor`}
            onLoad={(e) => {
              // Hide loading state
              const loadingDiv = e.currentTarget.previousElementSibling as HTMLElement;
              if (loadingDiv) {
                loadingDiv.style.display = 'none';
              }
            }}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-400">
            <span>Ready to edit</span>
            <span>•</span>
            <span>Click elements to modify</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Admin: {profile.full_name || 'Admin User'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
