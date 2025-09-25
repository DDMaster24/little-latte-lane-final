/**
 * Category Slug Route - Clean URLs for category selection
 * Handles URLs like /ordering/category/frappes
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugToTitle, getCategorySlug } from '@/lib/categoryUtils';
import { useMenuCategories } from '@/hooks/useMenuCategories';

interface CategorySlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategorySlugPage({ params }: CategorySlugPageProps) {
  const router = useRouter();
  const { categories, loading } = useMenuCategories();
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    params.then(({ slug }) => {
      setSlug(slug);
    });
  }, [params]);

  useEffect(() => {
    if (loading || !slug) return;

    // Find the category that matches this slug
    const matchingCategory = categories.find(category => {
      const categorySlug = getCategorySlug(category.name);
      return categorySlug === slug;
    });

    if (matchingCategory) {
      // Redirect to the ordering page with the category ID parameter
      router.replace(`/ordering?category=${matchingCategory.id}`);
    } else {
      // If category not found, redirect to main ordering page
      router.replace('/ordering');
    }
  }, [slug, categories, loading, router]);

  // Show loading while we redirect
  return (
    <div className="min-h-screen bg-darkBg text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-neonCyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-purple-400">Loading {slug ? slugToTitle(slug) : 'category'}...</p>
      </div>
    </div>
  );
}