'use client';

import React from 'react';
import { ThemeProvider } from '@/components/VisualEditor/SimpleThemeProvider';
import { EditableHeader } from '@/components/VisualEditor/EditableHeader';
import { Button } from '@/components/ui/button';
import { Palette, ArrowLeft } from 'lucide-react';

export default function VisualEditorTest() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-900">
        {/* Test Header */}
        <EditableHeader className="bg-gradient-to-r from-[var(--header-primary)] to-[var(--header-secondary)] p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="text-black border-black/20 hover:bg-black/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-2 text-black/80">
                <Palette className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Visual Editor Test - Header Colors
                </span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-black mb-4">
              Editable Header Demo
            </h1>
            <p className="text-xl text-black/80 max-w-2xl">
              Add <code>?editor=true</code> to the URL to enable editor mode, 
              then click the color swatches in the top-right corner to edit the header colors.
            </p>
          </div>
        </EditableHeader>

        {/* Test Content */}
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">How to Test</h2>
            
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-neonCyan text-black rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <strong className="text-white">Enable Editor Mode:</strong> Add <code className="bg-gray-700 px-2 py-1 rounded text-neonCyan">?editor=true</code> to this page&apos;s URL
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-neonPink text-black rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <strong className="text-white">See Editor UI:</strong> Color swatch buttons will appear in the top-right of the header
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-neonBlue text-black rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <strong className="text-white">Edit Colors:</strong> Click the color swatches to open the color picker
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-black rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <strong className="text-white">See Live Changes:</strong> Changes apply immediately and save to the database
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-neonCyan/10 to-neonPink/10 border border-neonCyan/30 rounded-lg">
              <h3 className="text-lg font-bold text-neonCyan mb-2">Technical Details</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Colors are stored in the <code>theme_settings</code> database table</li>
                <li>• Changes are applied via CSS custom properties in real-time</li>
                <li>• The editor UI only shows when <code>?editor=true</code> is in the URL</li>
                <li>• This is a minimal proof-of-concept for the full visual editor system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
