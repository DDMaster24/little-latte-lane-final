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
        <section className="w-full shadow-neon rounded-xl" style={{ backgroundColor: '#0f0f0f' }}>
          <div className="text-center py-8 xs:py-12 px-6">
            <h2 className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
              🍽️ View Our Categories
            </h2>
          </div>
          <div className="px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12">
            <CategorySkeleton count={4} className="grid-responsive-4 max-w-7xl mx-auto" />
          </div>
        </section>
      }
    >
      <section 
        className="w-full shadow-neon rounded-xl animate-fade-in"
        style={{
          backgroundColor: '#0f0f0f',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        data-editable="categories-section-background"
      >
        {/* Centered Header with Fluid Typography */}
        <div className="text-center py-8 xs:py-12 px-6">
          <h2 
            className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4"
            data-editable="categories-title"
          >
            🍽️ View Our Categories
          </h2>
        </div>

        {/* Responsive Category Grid - Mobile First Design */}
        <div className="px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12">
          <div className="grid-responsive-4 max-w-7xl mx-auto">
            {mainCategories.map((category, index) => {
              const categoryCard = (
                <div
                  key={category.id}
                  className="group relative bg-black/20 backdrop-blur-md border border-neonCyan/30 hover:border-neonPink/50 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-neon animate-fade-in touch-target"
                  data-editable={`category-${category.id}-card`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)',
                    minHeight: '200px', // Ensure minimum touch-friendly size
                  }}
                >
                  {/* Content Container with Responsive Padding */}
                  <div className="p-4 xs:p-6 h-full flex flex-col">
                    {/* Glassmorphic Icon Container - Responsive Sizing */}
                    <div 
                      className="w-full h-20 xs:h-24 sm:h-32 bg-gradient-to-br from-neonCyan/10 to-neonPink/10 backdrop-blur-sm rounded-lg mb-3 xs:mb-4 flex items-center justify-center group-hover:from-neonCyan/20 group-hover:to-neonPink/20 transition-all duration-300 border border-neonCyan/20 cursor-pointer hover:border-neonPink/50"
                      data-editable={`category-${category.id}-icon-container`}
                    >
                      <span 
                        className="text-2xl xs:text-3xl sm:text-4xl filter drop-shadow-lg cursor-pointer"
                        data-editable={`category-${category.id}-icon`}
                      >
                        {category.icon}
                      </span>
                    </div>
                    
                    {/* Category Title - Fluid Typography */}
                    <h3 
                      className="text-neonCyan font-semibold text-center group-hover:text-neonPink transition-colors duration-300 text-fluid-base xs:text-fluid-lg mb-2 xs:mb-3 cursor-pointer hover:text-neonPink/80"
                      data-editable={`category-${category.id}-title`}
                    >
                      {category.name}
                    </h3>
                    
                    {/* Description - Responsive Text */}
                    <p 
                      className="text-gray-300 text-fluid-xs xs:text-fluid-sm text-center leading-relaxed flex-grow flex items-center justify-center cursor-pointer hover:text-gray-100"
                      data-editable={`category-${category.id}-description`}
                    >
                      {category.description}
                    </p>
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neonCyan/5 to-neonPink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );

              // Wrap with Link for navigation
              return (
                <Link key={category.id} href="/menu" className="block">
                  {categoryCard}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Centered View Full Menu Button - Responsive */}
        <div className="text-center px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12 animate-bounce-in" style={{ animationDelay: '0.5s' }}>
          {/* Navigation button */}
          <Link
            href="/menu"
            className="neon-button text-fluid-base xs:text-fluid-lg px-6 xs:px-8 py-3 xs:py-4 inline-flex items-center gap-2 touch-target"
          >
            <span>🍽️</span>
            <span>View Full Menu</span>
          </Link>
        </div>
      </section>
    </ClientOnly>
  );
}
