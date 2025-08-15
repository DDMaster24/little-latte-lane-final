/**
 * Clean Loading Components
 *
 * Consistent loading states across the application
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
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-800 p-4 rounded-lg shadow-neon flex flex-col items-center animate-pulse"
        >
          <div className="w-full h-32 bg-gray-700 rounded mb-3" />
          <div className="w-24 h-4 bg-gray-700 rounded" />
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
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
          <div className="w-full h-48 bg-gray-700 rounded mb-4" />
          <div className="w-3/4 h-6 bg-gray-700 rounded mb-2" />
          <div className="w-full h-4 bg-gray-700 rounded mb-4" />
          <div className="w-1/4 h-6 bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-neon-green ${sizeClasses[size]} ${className}`}
    />
  );
}
