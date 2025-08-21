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

  // Define main category groupings with proper icons
  const categoryGroups = {
    drinks: {
      title: 'Drinks',
      description: 'Premium coffee, lattes, cold drinks & smoothies',
      icon: '☕',
      keywords: ['hot drinks', 'lattes', 'iced lattes', 'frappes', 'fizzers', 'freezos', 'smoothies'],
    },
    mainFood: {
      title: 'Main Food',
      description: 'Fresh pizzas, hearty meals & grilled toasties',
      icon: '🍕',
      keywords: ['pizza', 'toasties', 'all day meals'],
    },
    sidesBreakfast: {
      title: 'Sides & Breakfast',
      description: 'All-day breakfast, scones & perfect accompaniments',
      icon: '🥐',
      keywords: ['scones', 'all day brekkies', 'sides'],
    },
    extras: {
      title: 'Extras',
      description: 'Specialty items & unique offerings',
      icon: '🧀',
      keywords: ['extras', 'monna & rassies corner'],
    },
  };

  // Function to get specific, realistic icons for individual categories
  const getCategoryIcon = (categoryName: string, groupIcon: string) => {
    const name = categoryName.toLowerCase();
    
    // Drinks category icons - More specific and realistic
    if (name.includes('hot drinks')) return '☕'; // Classic hot coffee cup
    if (name.includes('lattes') && !name.includes('iced')) return '🍮'; // Latte with foam art
    if (name.includes('iced lattes')) return '�'; // Iced bubble tea/iced latte
    if (name.includes('frappes')) return '�'; // Frappuccino-style drink with straw
    if (name.includes('fizzers')) return '�'; // Fizzy drinks with bubbles
    if (name.includes('freezos')) return '🍧'; // Frozen/slush drinks
    if (name.includes('smoothies')) return '🍓'; // Fresh fruit smoothie
    
    // Main food category icons - More specific
    if (name.includes('pizza') && !name.includes('add')) return '🍕'; // Pizza slice
    if (name.includes('pizza') && name.includes('add')) return '🧄'; // Pizza add-ons/toppings
    if (name.includes('toasties')) return '🥪'; // Grilled sandwich
    if (name.includes('all day meals')) return '🍽️'; // Full meal plate
    
    // Sides & breakfast category icons - More specific
    if (name.includes('scones')) return '🥐'; // Pastry/scone
    if (name.includes('all day brekkies') || name.includes('breakfast')) return '🍳'; // Breakfast eggs
    if (name.includes('sides')) return '🍟'; // Side dishes
    
    // Extras category icons - More specific
    if (name.includes('monna') || name.includes('rassies')) return '🧀'; // Specialty cheese items
    if (name.includes('extras')) return '✨'; // Special extras
    
    // Return group icon as fallback
    return groupIcon;
  };

  // Function to categorize menu categories into main groups
  const categorizeByGroup = () => {
    const grouped: {
      drinks: typeof categories;
      mainFood: typeof categories;
      sidesBreakfast: typeof categories;
      extras: typeof categories;
    } = {
      drinks: [],
      mainFood: [],
      sidesBreakfast: [],
      extras: [],
    };

    categories.forEach((category) => {
      const categoryName = category.name.toLowerCase();
      
      // Skip Pizza Add-ons category entirely
      if (categoryName.includes('pizza add') || categoryName.includes('add-on') || categoryName.includes('add on') || categoryName.includes('addon')) {
        return; // Skip this category
      }
      
      if (categoryGroups.drinks.keywords.some(keyword => categoryName.includes(keyword))) {
        grouped.drinks.push(category);
      } else if (categoryGroups.mainFood.keywords.some(keyword => categoryName.includes(keyword))) {
        grouped.mainFood.push(category);
      } else if (categoryGroups.sidesBreakfast.keywords.some(keyword => categoryName.includes(keyword))) {
        grouped.sidesBreakfast.push(category);
      } else if (categoryGroups.extras.keywords.some(keyword => categoryName.includes(keyword))) {
        grouped.extras.push(category);
      } else {
        // Default to extras for uncategorized items
        grouped.extras.push(category);
      }
    });

    return grouped;
  };

  if (loading) {
    return (
      <main className="bg-darkBg py-8 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Menu
          </h1>
        </div>
        <CategorySkeleton />
        <div className="flex justify-center mt-12">
          <div className="bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg animate-pulse">
            <div className="w-32 h-4 bg-purple-500 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-darkBg py-8 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Menu
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Menu temporarily unavailable
            </h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
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
      <main className="bg-darkBg py-8 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            Menu
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-300 text-lg">Loading menu categories...</p>
        </div>
      </main>
    );
  }

  const groupedCategories = categorizeByGroup();

  return (
    <main className="bg-darkBg py-8 px-6">
      {/* Header - Matching Homepage Style */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-neonCyan via-neonBlue to-neonPink bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4">
          <span className="text-4xl">🍽️</span>
          <span>Our Full Menu</span>
          <span className="text-4xl">🍽️</span>
        </h1>
        <p className="text-gray-300 text-lg">Organized by category for easy browsing</p>
      </div>

      {/* Organized Categories by Main Groups */}
      <div className="space-y-12">
        {(Object.entries(categoryGroups) as Array<[keyof typeof categoryGroups, typeof categoryGroups[keyof typeof categoryGroups]]>).map(([groupKey, groupInfo]) => {
          const categoryList = groupedCategories[groupKey];
          
          if (categoryList.length === 0) return null;

          return (
            <div key={groupKey} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
              {/* Group Header - Enhanced with glassmorphism */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-3xl">{groupInfo.icon}</span>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
                    {groupInfo.title}
                  </h2>
                  <span className="text-3xl">{groupInfo.icon}</span>
                </div>
                <p className="text-gray-300 text-lg">{groupInfo.description}</p>
              </div>

              {/* Categories Grid - Fixed Size Panels with 4-per-row max and proper wrapping */}
              <div className="flex flex-wrap justify-center gap-4 mb-12 w-full px-4">
                {categoryList.map((category: Category) => (
                  <Link
                    key={category.id}
                    href={`/menu/modern?category=${category.id}`}
                    className="group relative bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in"
                    style={{ 
                      background: 'rgba(0, 0, 0, 0.4)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)',
                      width: 'calc(25% - 12px)', // Fixed width for 4-per-row (accounting for gap)
                      minWidth: '280px', // Minimum width for responsiveness
                      maxWidth: '350px'  // Maximum width to maintain consistency
                    }}
                    prefetch={true}
                  >
                    {/* Category Icon Section */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm border border-neonCyan/20 group-hover:border-neonPink/40 transition-all duration-300">
                        <span className="text-4xl">
                          {getCategoryIcon(category.name, groupInfo.icon)}
                        </span>
                      </div>
                      
                      {/* Category Name */}
                      <h3 className="text-xl font-bold text-neonCyan group-hover:text-neonPink transition-colors duration-300 mb-2">
                        {category.name}
                      </h3>
                      
                      {/* Category Description */}
                      {category.description && (
                        <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                          {category.description}
                        </p>
                      )}
                      
                      {/* Hover Effect Glow */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Items Button - Matching Homepage Style */}
      <div className="flex justify-center mt-12">
        <Link
          href="/menu/modern"
          className="neon-button group relative bg-black/20 backdrop-blur-md border border-neonCyan/50 hover:border-neonPink/70 px-8 py-4 rounded-xl font-bold text-neonCyan hover:text-neonPink transition-all duration-300 hover:scale-105 hover:shadow-neon"
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
