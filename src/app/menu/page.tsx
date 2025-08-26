/**
 * Clean Menu Page - Single Source of Truth
 *
 * This uses our clean architecture with proper data fetching,
 * hydration handling, and error management.
 */

'use client';

import Link from 'next/link';
import { ClientOnly } from '@/components/ClientOnly';
import {
  CategorySkeleton,
  LoadingSpinner,
} from '@/components/LoadingComponents';
import { useMenu } from '@/hooks/useMenu';
import type { Category } from '@/lib/dataClient';

function MenuContent() {
  const { categories, loading, error, refetch } = useMenu();

  // Since the database doesn't have parent_id, we'll display all categories directly
  // Group them by logical sections for better UX
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

  // Function to get specific, realistic icons for categories
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    // Section-level icons
    if (name.includes('drinks')) return '☕';
    if (name.includes('food')) return '🍕';
    if (name.includes('meals')) return '🍽️';
    if (name.includes('extras')) return '✨';
    if (name.includes('sweets')) return '🍰';
    if (name.includes('monna') || name.includes('rassies')) return '🧀';
    
    // Category-level icons - More specific and realistic
    if (name.includes('hot drinks')) return '☕'; // Classic hot coffee cup
    if (name.includes('lattes') && !name.includes('iced')) return '🍮'; // Latte with foam art
    if (name.includes('iced lattes')) return '🧊'; // Iced bubble tea/iced latte
    if (name.includes('frappes')) return '🥤'; // Frappuccino-style drink with straw
    if (name.includes('fizzers')) return '🫧'; // Fizzy drinks with bubbles
    if (name.includes('freezos')) return '🍧'; // Frozen/slush drinks
    if (name.includes('smoothies')) return '🍓'; // Fresh fruit smoothie
    if (name.includes('coke')) return '🥤'; // Coke drinks
    
    // Food category icons - More specific
    if (name.includes('pizza') && !name.includes('add')) return '🍕'; // Pizza slice
    if (name.includes('pizza') && name.includes('add')) return '🧄'; // Pizza add-ons/toppings
    if (name.includes('toasties')) return '🥪'; // Grilled sandwich
    if (name.includes('all day meals')) return '🍽️'; // Full meal plate
    
    // Meals category icons - More specific
    if (name.includes('scones')) return '🥐'; // Pastry/scone
    if (name.includes('all day brekkies') || name.includes('breakfast')) return '🍳'; // Breakfast eggs
    if (name.includes('sides')) return '🍟'; // Side dishes
    
    // Extras category icons - More specific
    if (name.includes('kids')) return '🧀'; // Kids menu items
    if (name.includes('desserts')) return '🍰'; // Desserts
    
    // Default section icons
    return '🏠'; // Default fallback
  };

  // Function to get categories for a specific section (now handled by our grouping)
  // This function is no longer needed since we group categories directly

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
    <main className="bg-darkBg py-4 sm:py-8 px-4 sm:px-6 overflow-x-hidden min-h-screen">
      {/* Header - Matching Homepage Style */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-neonCyan via-neonBlue to-neonPink bg-clip-text text-transparent mb-4 flex items-center justify-center gap-2 sm:gap-4">
          <span className="text-2xl sm:text-3xl lg:text-4xl">🍽️</span>
          <span>Our Full Menu</span>
          <span className="text-2xl sm:text-3xl lg:text-4xl">🍽️</span>
        </h1>
        <p className="text-gray-300 text-sm sm:text-base lg:text-lg">Organized by category for easy browsing</p>
      </div>

      {/* Sections - Display organized categories */}
      <div className="space-y-6 sm:space-y-12 max-w-7xl mx-auto">
        {sections.map((section, index) => {
          const sectionCategories = section.categories;
          
          return (
            <div key={`section-${index}`} className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-700/50">
              {/* Section Header - Enhanced with glassmorphism */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                  <span className="text-2xl sm:text-3xl">{section.icon}</span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
                    {section.name}
                  </h2>
                  <span className="text-2xl sm:text-3xl">{section.icon}</span>
                </div>
              </div>

              {/* Categories Grid */}
              {sectionCategories.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl sm:text-6xl mb-4">🚧</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">Coming Soon</h3>
                  <p className="text-sm sm:text-base text-gray-500">We&apos;re working on adding items to this section</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                  {sectionCategories.map((category: Category) => (
                    <Link
                      key={category.id}
                      href={`/menu/modern?category=${category.id}`}
                      className="group relative bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50 p-4 sm:p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in w-full h-full"
                      style={{ 
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
                      }}
                      prefetch={true}
                    >
                      {/* Category Icon Section */}
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-3 sm:mb-4 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm border border-neonCyan/20 group-hover:border-neonPink/40 transition-all duration-300">
                          <span className="text-2xl sm:text-3xl lg:text-4xl">
                            {getCategoryIcon(category.name)}
                          </span>
                        </div>
                        
                        {/* Category Name */}
                        <h3 className="text-lg sm:text-xl font-bold text-neonCyan group-hover:text-neonPink transition-colors duration-300 mb-2">
                          {category.name}
                        </h3>
                        
                        {/* Category Description */}
                        {category.description && (
                          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300 line-clamp-3">
                            {category.description}
                          </p>
                        )}
                        
                        {/* Hover Effect Glow */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Items Button - Matching Homepage Style */}
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
    </main>
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
