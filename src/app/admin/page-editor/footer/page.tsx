'use client';

import { Suspense } from 'react';
import FooterEditor from '@/components/Admin/FooterEditor';
import { EditorModeProvider } from '@/contexts/EditorModeContext';
import AuthRequiredPrompt from '@/components/AuthRequiredPrompt';
import { useAuth } from '@/components/AuthProvider';
import { LoadingSpinner } from '@/components/LoadingComponents';

export default function FooterEditorPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthRequiredPrompt />;
  }

  return (
    <EditorModeProvider isEditorMode={true}>
      <Suspense fallback={<LoadingSpinner />}>
        <FooterEditor>
          {/* This will render the main app with footer in edit mode */}
          <div className="min-h-screen bg-darkBg">
            {/* Header Preview Area */}
            <div className="bg-gray-900/50 p-8 border-b border-gray-700">
              <h1 className="text-3xl font-bold text-white mb-4">Footer Editor Preview</h1>
              <p className="text-gray-400 mb-6">
                This is a preview area to see how the footer looks during editing. The footer below is fully editable - click on any contact info, social link, or text to edit it.
              </p>
              
              {/* Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-neonCyan font-semibold mb-3">Contact Information</h3>
                  <p className="text-gray-300 text-sm">Click on phone numbers, email addresses, or physical addresses to edit their text and colors.</p>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-neonPink font-semibold mb-3">Social Media Links</h3>
                  <p className="text-gray-300 text-sm">Edit social media links, change their colors, or replace icons with custom images.</p>
                </div>
                
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-yellow-400 font-semibold mb-3">Footer Text & Links</h3>
                  <p className="text-gray-300 text-sm">Modify copyright text, privacy policy links, and other footer content.</p>
                </div>
              </div>
            </div>
            
            {/* Main Content Area - Push footer to bottom */}
            <div className="flex-1 min-h-[60vh] bg-darkBg">
              {/* Spacer content */}
              <div className="p-8 text-center text-gray-500">
                <p>Page content area - Footer will appear below</p>
              </div>
            </div>
          </div>
        </FooterEditor>
      </Suspense>
    </EditorModeProvider>
  );
}
