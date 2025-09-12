'use client';

import { useEffect, useState } from 'react';
import { PageViewer, fetchPage } from 'react-bricks/frontend';
import { types } from 'react-bricks';
import config from '../../react-bricks/config';

interface EditableHomepageProps {
  enableEditing?: boolean;
}

export default function EditableHomepage({ enableEditing: _enableEditing = false }: EditableHomepageProps) {
  const [page, setPage] = useState<types.Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try multiple possible page names in order of preference
        const pageNames = ['homepage', 'home', 'index', 'main'];
        let pageData = null;
        let lastError = null;
        
        for (const pageName of pageNames) {
          try {
            console.log(`Attempting to fetch page: ${pageName}`);
            pageData = await fetchPage({ slug: pageName, config });
            if (pageData) {
              console.log(`Successfully loaded page: ${pageName}`, pageData);
              break;
            }
          } catch (err) {
            console.log(`Page '${pageName}' not found, trying next...`);
            lastError = err;
          }
        }

        if (pageData) {
          setPage(pageData);
        } else {
          console.error('No valid pages found. Last error:', lastError);
          setError(`No homepage found. Tried: ${pageNames.join(', ')}`);
        }
      } catch (err) {
        console.error('Error loading React Bricks page:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen animate-fade-in relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan mx-auto mb-4"></div>
            <p className="text-gray-300">Loading homepage content...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !page) {
    return (
      <main className="min-h-screen animate-fade-in relative">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-2xl mx-auto p-8">
            <div className="text-red-400 mb-4 text-2xl">🔍 React Bricks Page Missing</div>
            <p className="text-gray-300 mb-6">{error || 'No page content found'}</p>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-6 text-left">
              <h3 className="text-white font-bold mb-4">📋 How to Fix This:</h3>
              <ol className="text-sm text-gray-300 space-y-3">
                <li><strong>1.</strong> Click <span className="text-neonCyan">Admin Panel</span> in the top navigation</li>
                <li><strong>2.</strong> Look for the <span className="text-neonCyan">React Bricks Editor</span> link</li>
                <li><strong>3.</strong> In React Bricks, create a new page with slug: <span className="text-neonCyan">&quot;homepage&quot;</span></li>
                <li><strong>4.</strong> Add the <span className="text-neonCyan">&quot;Welcoming Section&quot;</span> brick</li>
                <li><strong>5.</strong> Save and publish the page</li>
              </ol>
            </div>
            
            <div className="flex gap-4 justify-center">
              <a 
                href="/admin/editor" 
                className="bg-neonCyan text-black px-6 py-3 rounded font-medium hover:bg-neonPink transition-all"
              >
                🎨 React Bricks Editor
              </a>
              <a 
                href="/admin" 
                className="border border-neonCyan text-neonCyan px-6 py-3 rounded font-medium hover:border-neonPink hover:text-neonPink transition-all"
              >
                📊 Admin Panel
              </a>
            </div>
            
            <div className="mt-6 text-xs text-gray-500">
              Check browser console for detailed error information
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen animate-fade-in relative">
      {/* Render the React Bricks page content */}
      <PageViewer page={page} />
    </main>
  );
}
