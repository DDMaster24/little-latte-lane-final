/**
 * Menu Item Grouping Utilities
 * 
 * Groups duplicate menu items with different sizes into single items with size variants.
 * This keeps the database unchanged while improving the display UX.
 */

import type { MenuItem } from '@/types/app-types';

export interface MenuVariant {
  id: string;
  name: string;
  price: number;
  size: string;
  originalItem: MenuItem;
}

export interface GroupedMenuItem {
  id: string; // Base item ID (first variant)
  baseName: string; // Name without size suffix
  description: string | null;
  category_id: string | null;
  variants: MenuVariant[];
  hasMultipleSizes: boolean;
  originalItem?: MenuItem; // For single-variant items
}

/**
 * Extract size information from menu item names
 */
function extractSizeInfo(name: string): { baseName: string; size: string } {
  // Common size patterns to match
  const sizePatterns = [
    /^(.+?)\s+(Regular|Large|Small|Medium|R|L|S|M)$/i,
    /^(.+?)\s+(Reg|Lrg|Sm|Med)$/i,
    /^(.+?)\s+\((Regular|Large|Small|Medium|R|L|S|M)\)$/i,
    /^(.+?)\s+-\s+(Regular|Large|Small|Medium|R|L|S|M)$/i,
  ];

  for (const pattern of sizePatterns) {
    const match = name.match(pattern);
    if (match) {
      return {
        baseName: match[1].trim(),
        size: match[2].trim()
      };
    }
  }

  // If no size pattern found, treat as regular size
  return {
    baseName: name.trim(),
    size: 'Regular'
  };
}

/**
 * Normalize size names for consistent display
 */
function normalizeSizeName(size: string): string {
  const sizeMap: Record<string, string> = {
    'R': 'Regular',
    'L': 'Large', 
    'S': 'Small',
    'M': 'Medium',
    'Reg': 'Regular',
    'Lrg': 'Large',
    'Sm': 'Small',
    'Med': 'Medium'
  };
  
  return sizeMap[size] || size;
}

/**
 * Group menu items by their base name and create size variants
 */
export function groupMenuItemsBySize(menuItems: MenuItem[]): GroupedMenuItem[] {
  const itemGroups = new Map<string, MenuItem[]>();
  
  // Group items by their base name
  menuItems.forEach(item => {
    if (!item.name) return;
    
    const { baseName } = extractSizeInfo(item.name);
    const key = baseName.toLowerCase();
    
    if (!itemGroups.has(key)) {
      itemGroups.set(key, []);
    }
    itemGroups.get(key)!.push(item);
  });
  
  // Convert groups to GroupedMenuItem format
  const groupedItems: GroupedMenuItem[] = [];
  
  itemGroups.forEach((items, _baseNameKey) => {
    if (items.length === 0) return;
    
    // Sort items by size (Small -> Regular -> Medium -> Large)
    const sizeOrder = ['Small', 'S', 'Sm', 'Regular', 'R', 'Reg', 'Medium', 'M', 'Med', 'Large', 'L', 'Lrg'];
    items.sort((a, b) => {
      const sizeA = extractSizeInfo(a.name || '').size;
      const sizeB = extractSizeInfo(b.name || '').size;
      
      const indexA = sizeOrder.indexOf(sizeA);
      const indexB = sizeOrder.indexOf(sizeB);
      
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
    
    const baseItem = items[0];
    const { baseName } = extractSizeInfo(baseItem.name || '');
    
    // Create variants for each size
    const variants: MenuVariant[] = items.map(item => {
      const { size } = extractSizeInfo(item.name || '');
      return {
        id: item.id,
        name: item.name || '',
        price: item.price || 0,
        size: normalizeSizeName(size),
        originalItem: item
      };
    });
    
    const groupedItem: GroupedMenuItem = {
      id: baseItem.id,
      baseName,
      description: baseItem.description,
      category_id: baseItem.category_id,
      variants,
      hasMultipleSizes: variants.length > 1,
      originalItem: variants.length === 1 ? baseItem : undefined
    };
    
    groupedItems.push(groupedItem);
  });
  
  return groupedItems;
}

/**
 * Check if an item needs size selection before adding to cart
 */
export function needsSizeSelection(groupedItem: GroupedMenuItem, selectedSize?: string): boolean {
  return groupedItem.hasMultipleSizes && !selectedSize;
}

/**
 * Get the variant for a specific size selection
 */
export function getVariantBySize(groupedItem: GroupedMenuItem, selectedSize: string): MenuVariant | null {
  return groupedItem.variants.find(variant => variant.size === selectedSize) || null;
}

/**
 * Get default size for an item (usually the first variant)
 */
export function getDefaultSize(groupedItem: GroupedMenuItem): string {
  return groupedItem.variants[0]?.size || 'Regular';
}