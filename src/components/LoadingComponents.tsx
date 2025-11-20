/**
 * Enhanced Loading Components with Skeleton Loaders
 * Professional loading states for better UX
 */

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

// Neon Coffee Cup Loading Component - Using Custom GIF
export function NeonCoffeeCupLoader({
  size = 'md',
  text,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Custom Loading GIF */}
      <div className={`relative ${sizeClasses[size]}`}>
        <img
          src="/loading-screen.gif"
          alt="Loading Little Latte Lane"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

interface LoadingProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

// Enhanced Loading Progress Component
export function LoadingProgress({ steps, currentStep, className = '' }: LoadingProgressProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-center">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-neonCyan text-black animate-pulse'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-1 mx-2 transition-all duration-500 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <p className="text-neonCyan font-medium">{steps[currentStep]}</p>
      </div>
    </div>
  );
}

// Enhanced Category Skeleton with sophisticated neon animations
export function CategorySkeleton({
  count = 6,
  className = '',
}: LoadingSkeletonProps) {
  const gridClass = className.includes('grid') ? className : `grid-responsive-4 ${className}`;
  
  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-black/40 backdrop-blur-sm p-4 xs:p-6 rounded-xl shadow-neon-subtle border border-neonCyan/20 flex flex-col items-center space-y-3 xs:space-y-4 animate-pulse touch-target hover:border-neonCyan/40 transition-all duration-500"
          style={{ 
            animationDelay: `${i * 0.1}s`,
            minHeight: '200px' // Match our category cards
          }}
        >
          {/* Image skeleton with neon glow effect */}
          <div className="w-full h-20 xs:h-24 sm:h-32 bg-gradient-to-br from-neonCyan/10 via-black/50 to-neonPink/10 rounded-lg shimmer-neon relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-neonCyan/5 to-transparent animate-pulse" />
            <div className="absolute top-2 right-2 w-3 h-3 bg-neonCyan/60 rounded-full animate-ping" />
          </div>
          {/* Title skeleton with neon glow */}
          <div className="w-3/4 h-4 xs:h-5 bg-gradient-to-r from-neonCyan/30 via-neonPink/20 to-neonCyan/30 rounded shimmer-neon shadow-sm shadow-neonCyan/20" />
          {/* Description skeleton */}
          <div className="w-full h-3 bg-gradient-to-r from-gray-700/60 via-gray-600/40 to-gray-700/60 rounded shimmer" />
          {/* Button skeleton with enhanced glow */}
          <div className="w-20 h-8 bg-gradient-to-r from-neonPink/30 via-neonCyan/20 to-neonPink/30 rounded-lg shimmer-neon shadow-md shadow-neonPink/20" />
        </div>
      ))}
    </div>
  );
}

// Enhanced Menu Item Skeleton with neon styling
export function MenuItemSkeleton({
  count = 8,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-neon-subtle border border-neonCyan/20 animate-pulse space-y-4 hover:scale-105 hover:border-neonCyan/40 transition-all duration-300"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          {/* Image skeleton with neon glow */}
          <div className="w-full aspect-video bg-gradient-to-br from-neonCyan/10 via-black/50 to-neonPink/10 rounded-lg shimmer-neon relative overflow-hidden shadow-md shadow-neonCyan/20">
            <div className="absolute inset-0 bg-gradient-to-t from-neonCyan/10 to-transparent" />
            <div className="absolute top-3 right-3 w-4 h-4 bg-gradient-to-br from-neonCyan to-neonPink rounded-full animate-ping" />
          </div>
          {/* Title skeleton with enhanced glow */}
          <div className="w-3/4 h-6 bg-gradient-to-r from-neonCyan/30 via-neonPink/20 to-neonCyan/30 rounded shimmer-neon shadow-sm shadow-neonCyan/30" />
          {/* Description skeleton - multiple lines with neon accents */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-gradient-to-r from-gray-700/60 via-gray-600/40 to-gray-700/60 rounded shimmer" />
            <div className="w-4/5 h-4 bg-gradient-to-r from-gray-700/60 via-gray-600/40 to-gray-700/60 rounded shimmer" />
            <div className="w-3/5 h-4 bg-gradient-to-r from-gray-700/60 via-gray-600/40 to-gray-700/60 rounded shimmer" />
          </div>
          {/* Price and button skeleton with enhanced neon effects */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-neonCyan rounded-full shadow-sm shadow-neonCyan/50" />
              <div className="w-20 h-6 bg-gradient-to-r from-neonCyan/40 via-neonCyan/30 to-neonCyan/40 rounded shimmer-neon shadow-md shadow-neonCyan/30" />
            </div>
            <div className="w-24 h-10 bg-gradient-to-r from-neonPink/40 via-neonPink/30 to-neonPink/40 rounded-lg shimmer-neon shadow-md shadow-neonPink/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Enhanced Loading Spinner with advanced neon variants
export function LoadingSpinner({
  size = 'md',
  className = '',
  text = '',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'bounce';
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  if (variant === 'dots') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-br from-neonCyan to-neonPink rounded-full animate-bounce shadow-lg shadow-neonCyan/50"
              style={{ 
                animationDelay: `${i * 0.2}s`,
                filter: 'drop-shadow(0 0 4px currentColor)'
              }}
            />
          ))}
        </div>
        {text && (
          <p className="text-neonText text-sm font-medium animate-pulse bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div
          className={`bg-gradient-to-r from-neonCyan to-neonPink rounded-full animate-pulse shadow-lg shadow-neonCyan/50 ${sizeClasses[size]}`}
          style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
        />
        {text && (
          <p className="text-neonText text-sm font-medium animate-pulse bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'bounce') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-8 bg-gradient-to-t from-neonCyan to-neonPink rounded-full animate-pulse shadow-md shadow-neonCyan/40"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
                filter: 'drop-shadow(0 0 3px currentColor)'
              }}
            />
          ))}
        </div>
        {text && (
          <p className="text-neonText text-sm font-medium bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
            {text}
          </p>
        )}
      </div>
    );
  }

  // Enhanced default spinner with neon glow
  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-4 border-gray-700/30 border-t-neonCyan shadow-lg shadow-neonCyan/30 ${sizeClasses[size]}`}
        style={{ filter: 'drop-shadow(0 0 6px rgb(0, 255, 255, 0.5))' }}
      />
      {text && (
        <p className="text-neonText text-sm font-medium animate-pulse bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
          {text}
        </p>
      )}
    </div>
  );
}

// Enhanced Page Loading Skeleton with sophisticated neon styling
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Header skeleton with enhanced neon gradient effect */}
      <div className="space-y-4 text-center">
        <div className="w-1/3 h-12 bg-gradient-to-r from-neonCyan/40 via-neonPink/40 to-neonCyan/40 rounded-lg shimmer-neon mx-auto shadow-lg shadow-neonCyan/30" />
        <div className="w-2/3 h-6 bg-gradient-to-r from-gray-700/60 via-gray-600/40 to-gray-700/60 rounded shimmer mx-auto" />
        <div className="flex justify-center space-x-4 mt-6">
          <div className="w-24 h-8 bg-gradient-to-r from-neonCyan/30 to-neonCyan/20 rounded-full shimmer-neon shadow-md shadow-neonCyan/20" />
          <div className="w-32 h-8 bg-gradient-to-r from-neonPink/30 to-neonPink/20 rounded-full shimmer-neon shadow-md shadow-neonPink/20" />
        </div>
      </div>
      
      {/* Content skeleton with enhanced neon effects */}
      <CategorySkeleton count={6} />
      
      {/* Footer action skeleton with enhanced glow */}
      <div className="flex justify-center">
        <div className="w-48 h-12 bg-gradient-to-r from-neonCyan/40 to-neonPink/40 rounded-xl shimmer-neon shadow-lg shadow-neonCyan/30" />
      </div>
    </div>
  );
}

// Enhanced Card Skeleton with better structure
export function CardSkeleton({
  count = 1,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700/50 animate-pulse space-y-4 hover:border-neonCyan/30 transition-colors duration-300"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-neonCyan/30 to-neonPink/30 rounded-full shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-1/2 h-5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer" />
              <div className="w-1/3 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer" />
            </div>
            <div className="w-16 h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer" />
            <div className="w-3/4 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer" />
            <div className="w-1/2 h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

// New: Cart Loading Skeleton
export function CartSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Cart header */}
      <div className="flex items-center justify-between">
        <div className="w-24 h-6 bg-gradient-to-r from-neonCyan/30 to-neonPink/30 rounded shimmer" />
        <div className="w-8 h-8 bg-gray-700 rounded-full shimmer" />
      </div>
      
      {/* Cart items */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="w-12 h-12 bg-gray-700 rounded shimmer" />
          <div className="flex-1 space-y-2">
            <div className="w-3/4 h-4 bg-gray-700 rounded shimmer" />
            <div className="w-1/2 h-3 bg-gray-700 rounded shimmer" />
          </div>
          <div className="w-16 h-6 bg-gray-700 rounded shimmer" />
        </div>
      ))}
      
      {/* Cart total */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex justify-between items-center">
          <div className="w-12 h-6 bg-gray-700 rounded shimmer" />
          <div className="w-20 h-8 bg-gradient-to-r from-neonCyan/30 to-neonPink/30 rounded shimmer" />
        </div>
      </div>
      
      {/* Checkout button */}
      <div className="w-full h-12 bg-gradient-to-r from-neonCyan/20 to-neonPink/20 rounded-lg shimmer" />
    </div>
  );
}

// New: Order Status Loading
export function OrderStatusSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Order header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-32 h-6 bg-gray-700 rounded shimmer" />
          <div className="w-48 h-4 bg-gray-700 rounded shimmer" />
        </div>
        <div className="w-20 h-8 bg-neonCyan/20 rounded-full shimmer" />
      </div>
      
      {/* Progress steps */}
      <div className="flex justify-between items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-gray-700 rounded-full shimmer" />
            <div className="w-16 h-3 bg-gray-700 rounded shimmer" />
          </div>
        ))}
      </div>
      
      {/* Order details */}
      <div className="space-y-3">
        <div className="w-24 h-5 bg-gray-700 rounded shimmer" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-gray-800/30 rounded">
            <div className="w-32 h-4 bg-gray-700 rounded shimmer" />
            <div className="w-16 h-4 bg-gray-700 rounded shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

// New: Enhanced Error State Component
export function ErrorState({
  title = "Something went wrong",
  message = "Please try again later",
  onRetry,
  className = ''
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center ${className}`}>
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
        <div className="w-12 h-12 text-red-400">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-red-400">{title}</h3>
        <p className="text-gray-300 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
