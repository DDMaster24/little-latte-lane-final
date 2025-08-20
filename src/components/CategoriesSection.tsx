/**
 * Clean Categories Section
 */

'use client';

import Link from 'next/link';
import { ClientOnly } from '@/components/ClientOnly';
import { CategorySkeleton } from '@/components/LoadingComponents';

export default function CategoriesSection() {
  // Define the 4 main categories for the homepage with unified neon theme
  const mainCategories = [
    {
      id: 'drinks',
      name: 'Drinks',
      description: 'Premium coffee, lattes, cold drinks & smoothies',
      icon: '☕',
    },
    {
      id: 'main-food',
      name: 'Main Food',
      description: 'Fresh pizzas, hearty meals & grilled toasties',
      icon: '🍕',
    },
    {
      id: 'sides-breakfast',
      name: 'Sides & Breakfast',
      description: 'All-day breakfast, scones & perfect accompaniments',
      icon: '🥐',
    },
    {
      id: 'extras',
      name: 'Extras',
      description: 'Specialty items & unique offerings',
      icon: '🧀',
    },
  ];

  return (
    <ClientOnly
      fallback={
        <section className="bg-darkBg shadow-neon rounded-lg m-4">
          <div className="py-12 px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-neon-gradient">
                🍽️ View Our Categories
              </h2>
            </div>
            <CategorySkeleton count={4} />
          </div>
        </section>
      }
    >
      <section className="bg-darkBg shadow-neon rounded-lg m-4">
        <div className="py-12 px-6">
          {/* Centered Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-neon-gradient">
              🍽️ View Our Categories
            </h2>
          </div>

          {/* Centered Category Cards with Glassmorphism */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 max-w-6xl mx-auto">
            {mainCategories.map((category, index) => (
              <Link
                key={category.id}
                href="/menu"
                className="group relative bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in w-full sm:w-80 md:w-72 lg:w-80"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)'
                }}
              >
                {/* Glassmorphic Icon Container */}
                <div className="w-full h-32 bg-gradient-to-br from-neonCyan/10 to-neonPink/10 backdrop-blur-sm rounded-lg mb-4 flex items-center justify-center group-hover:from-neonCyan/20 group-hover:to-neonPink/20 transition-all duration-300 border border-neonCyan/20">
                  <span className="text-4xl filter drop-shadow-lg">{category.icon}</span>
                </div>
                
                {/* Category Title */}
                <h3 className="text-neonCyan font-semibold text-center group-hover:text-neonPink transition-colors duration-300 text-lg mb-2">
                  {category.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-300 text-sm text-center leading-relaxed">
                  {category.description}
                </p>
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Link>
            ))}
          </div>

          {/* Centered View Full Menu Button - Matching Header Style */}
          <div className="text-center animate-bounce-in" style={{ animationDelay: '0.5s' }}>
            <Link
              href="/menu"
              className="neon-button text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              🍽️ View Full Menu
            </Link>
          </div>
        </div>
      </section>
    </ClientOnly>
  );
}
