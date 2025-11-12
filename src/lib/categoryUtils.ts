/**
 * Category URL utilities for clean slug-based routing
 */

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Common category name to slug mappings for consistency
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'Hot Drinks': 'hot-drinks',
  'Lattes': 'lattes', 
  'Iced Lattes': 'iced-lattes',
  'Frappes': 'frappes',
  'Smoothies': 'smoothies',
  'Fizzers': 'fizzers',
  'Freezos': 'freezos',
  'Coffee': 'coffee',
  'Tea': 'tea',
  'Cold Drinks': 'cold-drinks',
  'Breakfast': 'breakfast',
  'Lunch': 'lunch', 
  'Dinner': 'dinner',
  'Sides': 'sides',
  'Snacks': 'snacks',
  'Desserts': 'desserts',
  'Extras': 'extras',
  'Specialties': 'specialties',
  'Pizza': 'pizza',
  'Burgers': 'burgers',
  'Sandwiches': 'sandwiches',
  'Salads': 'salads'
}

export function getCategorySlug(categoryName: string): string {
  // Check if we have a predefined mapping first
  if (CATEGORY_SLUG_MAP[categoryName]) {
    return CATEGORY_SLUG_MAP[categoryName]
  }
  
  // Otherwise generate slug from name
  return createSlug(categoryName)
}