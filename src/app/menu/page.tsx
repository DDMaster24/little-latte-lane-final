'use client';

import { useEffect, useState } from 'react';
import { PageViewer, fetchPage, ReactBricks, types } from 'react-bricks/frontend';
import { ClientOnly } from '@/components/ClientOnly';
import { CategorySkeleton } from '@/components/LoadingComponents';
import MenuClosurePage from '@/components/MenuClosurePage';
import { useRestaurantClosure } from '@/hooks/useRestaurantClosure';
import config from '../../../react-bricks/config';
import Link from 'next/link';

function MenuContent() {
  const [page, setPage] = useState<types.Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isClosed } = useRestaurantClosure();

  // React Bricks configuration
  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    },
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('=== MENU PAGE REACT BRICKS DEBUG ===');
        console.log('Config API Key available:', !!config.apiKey);
        
        if (!config.apiKey) {
          setError('React Bricks API key is missing');
          return;
        }

        // Try to fetch the menu page from React Bricks
        const slugsToTry = ['menu-page', 'menu', 'our-menu'];
        let pageData = null;

        for (const slug of slugsToTry) {
          try {
            console.log(`Trying to fetch React Bricks menu page with slug: "${slug}"`);
            pageData = await fetchPage({
              slug,
              language: '',
              config
            });
            if (pageData) {
              console.log(`✅ Successfully fetched menu page with slug: "${slug}"`);
              console.log('Menu page data:', pageData);
              break;
            }
          } catch (err) {
            console.log(`❌ Failed to fetch menu page with slug "${slug}":`, err);
          }
        }

        if (pageData) {
          setPage(pageData);
        } else {
          // If no React Bricks page found, create fallback content
          console.log('No React Bricks menu page found, rendering fallback content');
          setError('Menu page not found in React Bricks - please create one in the editor');
        }
      } catch (err) {
        console.error('Error loading React Bricks menu page:', err);
        setError('Failed to load menu page content');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  if (loading) {
    return (
      <main className="bg-darkBg py-8 px-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonCyan mx-auto mb-4"></div>
            <p className="text-gray-300">Loading menu content...</p>
          </div>
        </div>
      </main>
    );
  }

  // Restaurant is closed - show enhanced closure page
  if (isClosed) {
    return <MenuClosurePage />;
  }

  if (error || !page) {
    return (
      <main className="bg-darkBg py-8 px-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <div className="text-neonPink mb-4 text-2xl">🍽️</div>
            <h1 className="text-2xl font-bold text-neonCyan mb-4">Menu Page Setup Needed</h1>
            <p className="text-gray-300 mb-6">{error || 'No menu page content found'}</p>
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-neonCyan font-semibold mb-2">To fix this:</h3>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Go to the <strong>React Bricks Editor</strong></li>
                <li>Create a new page with slug: <code className="bg-gray-700 px-1 rounded">menu-page</code></li>
                <li>Add the Menu Components (Drinks, Main Food, etc.)</li>
                <li>Publish the page</li>
              </ol>
            </div>
            <div className="flex justify-center mt-8">
              <Link
                href="/menu/modern"
                className="neon-button group relative bg-black/20 backdrop-blur-md border border-neonCyan/50 hover:border-neonPink/70 px-6 py-3 rounded-xl font-bold text-neonCyan hover:text-neonPink transition-all duration-300 hover:scale-105"
                style={{ 
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
                }}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">🍽️</span>
                  <span>Browse All Menu Items</span>
                  <span className="text-xl">🍽️</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <ReactBricks {...reactBricksConfig}>
      <main className="bg-darkBg overflow-x-hidden min-h-screen">
        {/* Render the React Bricks menu page content */}
        <PageViewer page={page} />
        
        {/* Fallback Browse All Button - only show if restaurant is open */}
        {!isClosed && (
          <div className="flex justify-center mt-8 sm:mt-12 px-4 pb-8">
            <Link
              href="/menu/modern"
              className="neon-button group relative bg-black/20 backdrop-blur-md border border-neonCyan/50 hover:border-neonPink/70 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-neonCyan hover:text-neonPink transition-all duration-300 hover:scale-105 hover:shadow-neon text-sm sm:text-base"
              style={{ 
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
              }}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">🍽️</span>
                <span>Browse All Menu Items</span>
                <span className="text-2xl">🍽️</span>
              </span>
            </Link>
          </div>
        )}
      </main>
    </ReactBricks>
  );
}

export default function MenuPage() {
  return (
    <ClientOnly
      fallback={
        <main className="bg-darkBg py-8 px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
              Menu
            </h1>
          </div>
          <CategorySkeleton />
        </main>
      }
    >
      <MenuContent />
    </ClientOnly>
  );
}
