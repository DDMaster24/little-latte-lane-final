/**
 * Roberts Estate Street Validation
 * Simple list of all streets within Roberts Estate for delivery fee validation
 * R10 delivery if address matches any of these streets, R30 otherwise
 */

export const ROBERTS_ESTATE_STREETS = [
  // Main streets in Roberts Estate
  'rstr crescent',
  'hypoxis street',
  'hypoxis',
  'strelitzia street',
  'strelitzia',
  'protea street',
  'protea',
  'erica street',
  'erica',
  
  // Common variations and abbreviations
  'rstr',
  'rstr cres',
  
  // Add more as discovered
] as const;

/**
 * Check if an address is within Roberts Estate based on street name
 * Case-insensitive partial matching
 */
export function isRobertsEstateAddress(address: string): boolean {
  if (!address) return false;
  
  const normalizedAddress = address.toLowerCase().trim();
  
  // Check if any of the Roberts Estate streets are mentioned in the address
  return ROBERTS_ESTATE_STREETS.some(street => 
    normalizedAddress.includes(street)
  );
}

/**
 * Get a friendly list of Roberts Estate streets for display
 */
export function getRobertsEstateStreetsList(): string[] {
  return [
    'RSTR Crescent',
    'Hypoxis Street',
    'Strelitzia Street',
    'Protea Street',
    'Erica Street',
  ];
}

/**
 * Validate and suggest if address might be Roberts Estate
 */
export function validateAddressForRobertsEstate(streetAddress: string, suburb?: string): {
  isRobertsEstate: boolean;
  confidence: 'high' | 'medium' | 'low';
  suggestion?: string;
} {
  const normalizedSuburb = suburb?.toLowerCase().trim() || '';
  
  // High confidence: Street name matches AND suburb mentions "roberts estate"
  if (isRobertsEstateAddress(streetAddress) && normalizedSuburb.includes('roberts')) {
    return {
      isRobertsEstate: true,
      confidence: 'high',
    };
  }
  
  // Medium confidence: Only street name matches
  if (isRobertsEstateAddress(streetAddress)) {
    return {
      isRobertsEstate: true,
      confidence: 'medium',
      suggestion: 'This appears to be a Roberts Estate address. Please confirm if you live in Roberts Estate.',
    };
  }
  
  // Low confidence: Suburb mentions Roberts Estate but street doesn't match
  if (normalizedSuburb.includes('roberts')) {
    return {
      isRobertsEstate: false,
      confidence: 'low',
      suggestion: 'You mentioned Roberts Estate, but the street name doesn\'t match our records. Please verify your address.',
    };
  }
  
  // Not Roberts Estate
  return {
    isRobertsEstate: false,
    confidence: 'high',
  };
}
