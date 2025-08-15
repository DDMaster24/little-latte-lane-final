import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-gray-700/50 animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

function MenuItemSkeleton() {
  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg p-4">
      <Skeleton className="aspect-square w-full mb-3" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center">
      <Skeleton className="h-32 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export { Skeleton, MenuItemSkeleton, CategorySkeleton };
