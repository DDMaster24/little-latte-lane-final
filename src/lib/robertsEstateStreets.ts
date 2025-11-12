/**
 * Roberts Estate Street Validation
 * Complete list of all streets within Roberts Estate for delivery fee validation
 * R10 delivery if address matches any of these streets, R30 otherwise
 */

export const ROBERTS_ESTATE_STREETS = [
  'Sparaxis St',
  'Aristea Cres',
  'Clivia Cres',
  'Amaryllis St',
  'Freesia Street',
  'Hypoxis Street',
  'Ixia Street',
  'Lillium St',
  'Begonia St',
  'Nerine Cres',
] as const;

/**
 * Check if a street name is within Roberts Estate
 * Case-insensitive exact or partial matching
 */
export function isRobertsEstateAddress(streetName: string): boolean {
  if (!streetName) return false;
  
  const normalized = streetName.toLowerCase().trim();
  
  // Check if it matches any Roberts Estate street
  return ROBERTS_ESTATE_STREETS.some(street => {
    const streetLower = street.toLowerCase();
    return normalized === streetLower || normalized.includes(streetLower) || streetLower.includes(normalized);
  });
}

/**
 * Search for matching Roberts Estate streets based on user input
 * Returns filtered list for autocomplete dropdown
 * ONLY matches the street NAME part (e.g., "Freesia" in "Freesia Street")
 * Prevents false positives like "Test Street" matching any street with "Street" in it
 */
export function searchRobertsEstateStreets(query: string): string[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return ROBERTS_ESTATE_STREETS.filter(street => {
    const streetLower = street.toLowerCase();
    
    // Extract the street NAME part (before "street", "st", "cres", "crescent")
    const streetNamePart = streetLower
      .replace(/\s+(street|st|cres|crescent)$/i, '')
      .trim();
    
    // Match if query matches the street name part OR the full street name
    // This ensures "Freesia" matches "Freesia Street"
    // But "Test Street" does NOT match "Freesia Street" (only "Test" would match if there was a "Test Street")
    return streetNamePart.includes(normalizedQuery) || streetLower === normalizedQuery;
  });
}

/**
 * Get complete list of Roberts Estate streets for display
 */
export function getRobertsEstateStreetsList(): string[] {
  return [...ROBERTS_ESTATE_STREETS];
}

/**
 * Validate if street name is in Roberts Estate
 * Returns exact match from the list if found
 */
export function validateAddressForRobertsEstate(streetName: string): {
  isRobertsEstate: boolean;
  matchedStreet?: string;
  confidence: 'high' | 'low';
} {
  if (!streetName) {
    return { isRobertsEstate: false, confidence: 'low' };
  }
  
  const normalized = streetName.toLowerCase().trim();
  
  // Find exact match
  const matchedStreet = ROBERTS_ESTATE_STREETS.find(street => 
    street.toLowerCase() === normalized
  );
  
  if (matchedStreet) {
    return {
      isRobertsEstate: true,
      matchedStreet,
      confidence: 'high',
    };
  }
  
  // Check partial match
  const partialMatch = ROBERTS_ESTATE_STREETS.find(street => 
    street.toLowerCase().includes(normalized) || normalized.includes(street.toLowerCase())
  );
  
  if (partialMatch) {
    return {
      isRobertsEstate: true,
      matchedStreet: partialMatch,
      confidence: 'high',
    };
  }
  
  return { isRobertsEstate: false, confidence: 'low' };
}
