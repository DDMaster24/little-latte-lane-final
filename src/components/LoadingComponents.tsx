/**
 * Enhanced Loading Components with Skeleton Loaders
 * Professional loading states for better UX
 */

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export function CategorySkeleton({
  count = 6,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700/50 flex flex-col items-center space-y-4 animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-full h-32 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg shimmer" />
          {/* Title skeleton */}
          <div className="w-3/4 h-5 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
          {/* Description skeleton */}
          <div className="w-full h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
        </div>
      ))}
    </div>
  );
}

export function MenuItemSkeleton({
  count = 8,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50 animate-pulse space-y-4">
          {/* Image skeleton */}
          <div className="w-full h-48 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg shimmer" />
          {/* Title skeleton */}
          <div className="w-3/4 h-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
            <div className="w-4/5 h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
          </div>
          {/* Price and button skeleton */}
          <div className="flex justify-between items-center pt-2">
            <div className="w-1/4 h-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
            <div className="w-24 h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  text = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-4 border-gray-600 border-t-neonCyan ${sizeClasses[size]}`}
      />
      {text && (
        <p className="text-neonText text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-8 p-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="w-1/3 h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
        <div className="w-2/3 h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
      </div>
      
      {/* Content skeleton */}
      <CategorySkeleton count={6} />
    </div>
  );
}

export function CardSkeleton({
  count = 1,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700/50 animate-pulse space-y-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full shimmer" />
            <div className="flex-1 space-y-2">
              <div className="w-1/2 h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
              <div className="w-1/3 h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
            <div className="w-3/4 h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
