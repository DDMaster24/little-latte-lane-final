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
 */
export function searchRobertsEstateStreets(query: string): string[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return ROBERTS_ESTATE_STREETS.filter(street => 
    street.toLowerCase().includes(normalizedQuery)
  );
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
