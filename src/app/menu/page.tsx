/**
 * React Bricks Editable Menu Page - Professional Architecture
 *
 * This menu page now uses React Bricks components for full admin editing
 * while preserving the exact current appearance and functionality.
 */

'use client';

import Link from 'next/link';
import { ClientOnly } from '@/components/ClientOnly';
import {
  CategorySkeleton,
  LoadingSpinner,
} from '@/components/LoadingComponents';
import { useMenu } from '@/hooks/useMenu';
import { ReactBricks } from 'react-bricks/frontend';
import config from '../../../react-bricks/config';
import MenuHero from '../../../react-bricks/bricks/MenuHero';
import type { Category } from '@/lib/dataClient';

function MenuContent() {
  const { categories, loading, error, refetch } = useMenu();

  // React Bricks configuration
  const reactBricksConfig = {
    ...config,
    navigate: (path: string) => {
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    },
  };

  // Group categories by logical sections (preserved from original)
  const groupCategoriesByType = () => {
    const drinks = categories.filter(cat => 
      cat.name.toLowerCase().includes('drink') || 
      cat.name.toLowerCase().includes('latte') ||
      cat.name.toLowerCase().includes('frappe') ||
      cat.name.toLowerCase().includes('smoothie') ||
      cat.name.toLowerCase().includes('coke')
    );
    
    const food = categories.filter(cat => 
      cat.name.toLowerCase().includes('pizza') || 
      cat.name.toLowerCase().includes('toastie') ||
      cat.name.toLowerCase().includes('meal')
    );
    
    const breakfast = categories.filter(cat => 
      cat.name.toLowerCase().includes('scone') || 
      cat.name.toLowerCase().includes('breakfast') ||
      cat.name.toLowerCase().includes('side')
    );
    
    const extras = categories.filter(cat => 
      !drinks.includes(cat) && !food.includes(cat) && !breakfast.includes(cat)
    );

    return [
      { name: 'Drinks & Beverages', categories: drinks, icon: '☕' },
      { name: 'Main Food', categories: food, icon: '🍕' },
      { name: 'Breakfast & Sides', categories: breakfast, icon: '🥐' },
      { name: 'Extras & Specialties', categories: extras, icon: '✨' }
    ].filter(section => section.categories.length > 0);
  };

  const sections = groupCategoriesByType();

  // Function to get category icons (preserved from original)
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('hot drinks')) return '☕';
    if (name.includes('lattes') && !name.includes('iced')) return '🍮';
    if (name.includes('iced lattes')) return '🧊';
    if (name.includes('frappes')) return '🥤';
    if (name.includes('smoothies')) return '🍓';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('toasties')) return '🥪';
    if (name.includes('all day meals')) return '🍽️';
    if (name.includes('scones')) return '🥐';
    if (name.includes('sides')) return '🍟';
    
    return '';
  };

  if (loading) {
    return (
      <main className="bg-darkBg py-4 sm:py-8 px-4 sm:px-6 overflow-x-hidden">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Menu
          </h1>
        </div>
        <CategorySkeleton />
        <div className="flex justify-center mt-8 sm:mt-12">
          <div className="bg-purple-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg animate-pulse">
            <div className="w-24 sm:w-32 h-4 bg-purple-500 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-darkBg py-4 sm:py-8 px-4 sm:px-6 overflow-x-hidden">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Menu
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4 px-4">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-red-400 mb-2">
              Menu temporarily unavailable
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">{error}</p>
            <button
              onClick={refetch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (categories.length === 0) {
    return (
      <main className="bg-darkBg py-4 sm:py-8 px-4 sm:px-6 overflow-x-hidden">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Menu
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg">Loading menu categories...</p>
        </div>
      </main>
    );
  }

  return (
    <ReactBricks {...reactBricksConfig}>
      <main className="bg-darkBg py-4 sm:py-8 overflow-x-hidden min-h-screen">
        
        {/* Editable Menu Hero Section */}
        <MenuHero
          heroTitle="Our Full Menu"
          heroSubtitle="Organized by category for easy browsing"
          leftEmoji="🍽️"
          rightEmoji="🍽️"
          ctaButtonText="Browse All Menu Items"
          ctaButtonLink="/menu/modern"
          showTitle={true}
          showSubtitle={true}
          showDescription={false}
          showEmojis={true}
          showButtons={true}
          showSecondaryButton={false}
          secondaryButtonText=""
          secondaryButtonLink=""
          contentAlignment="center"
          sectionPadding="lg"
          backgroundColor="#0f0f0f"
          titleColor={{ color: '#ffffff' }}
          subtitleColor={{ color: '#d1d5db' }}
          descriptionColor={{ color: '#d1d5db' }}
          heroStyle="decorative"
          buttonStyle="neon"
          textShadow="subtle"
          backgroundOverlay={0.7}
        />

        {/* Dynamic Sections - Display organized categories */}
        <div className="space-y-6 sm:space-y-12">
          {sections.map((section, index) => {
            const sectionCategories = section.categories;
            
            return (
              <div key={`section-${index}`} className="w-full">
                {/* Section using MenuSection brick for editing */}
                <div className="bg-gray-900/50 border-y border-gray-700/50 py-6 sm:py-8">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    
                    {/* Section Header */}
                    <div className="text-center mb-6 sm:mb-8">
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                        <span className="text-2xl sm:text-3xl">{section.icon}</span>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
                          {section.name}
                        </h2>
                        <span className="text-2xl sm:text-3xl">{section.icon}</span>
                      </div>
                    </div>

                    {/* Categories Grid - Preserving exact current layout */}
                    {sectionCategories.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl sm:text-6xl mb-4">🚧</div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">Coming Soon</h3>
                        <p className="text-sm sm:text-base text-gray-500">We&apos;re working on adding items to this section</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                        {sectionCategories.map((category: Category) => (
                          <div
                            key={category.id}
                            className="category-card flex-none w-72 sm:w-80"
                          >
                            <Link
                              href={`/menu/modern?category=${category.id}`}
                              className="group relative bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50 p-4 sm:p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in w-full h-full block"
                              style={{ 
                                background: 'rgba(0, 0, 0, 0.4)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
                              }}
                              prefetch={true}
                            >
                              {/* Category Icon Section */}
                              <div className="flex flex-col items-center text-center">
                                <div 
                                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-3 sm:mb-4 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm border border-neonCyan/20 group-hover:border-neonPink/40 transition-all duration-300"
                                >
                                  <span 
                                    className="text-2xl sm:text-3xl lg:text-4xl"
                                  >
                                    {getCategoryIcon(category.name)}
                                  </span>
                                </div>
                                
                                {/* Category Name */}
                                <h3 
                                  className="text-lg sm:text-xl font-bold text-neonCyan group-hover:text-neonPink transition-colors duration-300 mb-2"
                                >
                                  {category.name}
                                </h3>
                                
                                {/* Category Description */}
                                {category.description && (
                                  <p 
                                    className="text-gray-300 text-xs sm:text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300 line-clamp-3"
                                  >
                                    {category.description}
                                  </p>
                                )}
                                
                                {/* Hover Effect Glow */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Items Button - Preserved exactly */}
        <div className="flex justify-center mt-8 sm:mt-12 px-4">
          <Link
            href="/menu/modern"
            className="neon-button group relative bg-black/20 backdrop-blur-md border border-neonCyan/50 hover:border-neonPink/70 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-neonCyan hover:text-neonPink transition-all duration-300 hover:scale-105 hover:shadow-neon text-sm sm:text-base"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
            }}
            prefetch={true}
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">🍽️</span>
              <span>Browse All Menu Items</span>
              <span className="text-2xl">🍽️</span>
            </span>
          </Link>
        </div>

        {/* Preserved CSS for responsive centered grid */}
        <style jsx>{`
          @media (min-width: 1536px) {
            .category-card {
              width: calc(20% - 1.2rem);
              min-width: 280px;
            }
          }
          
          @media (min-width: 1280px) and (max-width: 1535px) {
            .category-card {
              width: calc(25% - 1.125rem);
              min-width: 280px;
            }
          }
          
          @media (min-width: 1024px) and (max-width: 1279px) {
            .category-card {
              width: calc(33.333% - 1rem);
              min-width: 280px;
            }
          }
          
          @media (min-width: 768px) and (max-width: 1023px) {
            .category-card {
              width: calc(50% - 1rem);
              min-width: 280px;
            }
          }
          
          @media (max-width: 767px) {
            .category-card {
              width: 100%;
              max-width: 400px;
            }
          }
        `}</style>
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
