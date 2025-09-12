'use client';

import { useEffect, useState } from 'react';
import { PageViewer, fetchPage } from 'react-bricks/frontend';
import { types } from 'react-bricks';

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
            pageData = await fetchPage(pageName, process.env.NEXT_PUBLIC_API_KEY!);
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
    // TEMPORARY FIX: Render static homepage content while React Bricks is down
    const StaticHomepage = () => (
      <main className="min-h-screen animate-fade-in relative">
        {/* Import and render WelcomingSection directly */}
        <section className="bg-gradient-to-br from-darkBg via-gray-900 to-darkBg section-padding overflow-hidden">
          <div className="container-wide animate-fade-in">
            {/* Hero Header */}
            <div className="text-center py-4 xs:py-6 sm:py-8">
              <h1 className="text-4xl md:text-6xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-6">
                Welcome to Little Latte Lane
              </h1>
              
              <p className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl text-gray-300 mb-3 xs:mb-4 max-w-4xl mx-auto">
                Café & Deli - Where Great Food Meets Amazing Experiences
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-4 xs:mb-6">
                <span className="bg-neonCyan text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium rounded">
                  Now Open
                </span>
                <span className="bg-neonPink text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium rounded">
                  Dine In • Takeaway • Delivery
                </span>
              </div>
            </div>

            {/* Carousel Section */}
            <div className="mb-6 w-full">
              <div className="relative w-full min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="w-80 h-96 bg-gradient-to-br from-neonCyan to-blue-600 backdrop-blur-sm border-2 border-neonCyan shadow-2xl rounded-lg">
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-2xl mb-2 text-center">Welcome Panel</h3>
                      <p className="text-gray-300 text-sm mb-4 text-center">Experience our amazing carousel system with advanced customization</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">🎠</div>
                        <p>React Bricks Carousel</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="bg-neonCyan text-white w-full justify-center px-4 py-2 rounded text-sm font-medium flex">
                        Featured
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center pt-4">
              <h2 className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-3">
                Ready to Experience Little Latte Lane?
              </h2>
              <p className="text-lg text-gray-300 mb-4 max-w-2xl mx-auto">
                Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <div className="flex items-center justify-center gap-2 text-neonCyan">
                  <span className="text-sm font-medium">⭐ Exceptional Quality</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-neonPink">
                  <span className="text-sm font-medium">📍 Prime Location</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <span className="text-sm font-medium">🚗 Easy Parking</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* React Bricks Status Notice */}
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-neonCyan rounded-lg p-4 max-w-sm">
          <div className="text-white text-sm">
            <div className="text-red-400 font-bold mb-2">🔧 Maintenance Mode</div>
            <p className="text-gray-300">React Bricks authentication issue detected. Showing static content temporarily.</p>
            <div className="mt-2 text-xs text-gray-500">
              Error: {error || 'Authentication failed (401)'}
            </div>
          </div>
        </div>
      </main>
    );

    return <StaticHomepage />;
  }

  return (
    <main className="min-h-screen animate-fade-in relative">
      {/* Render the React Bricks page content */}
      <PageViewer page={page} />
    </main>
  );
}
