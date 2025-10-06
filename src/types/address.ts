/**
 * Address Types - Simplified without Google Maps
 * Manual entry with delivery zone detection based on suburb
 */

export interface ValidatedAddress {
  streetAddress: string;
  suburb: string;
  unitNumber: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  deliveryZone: 'roberts_estate' | 'middleburg' | 'outside';
  deliveryFee: number;
  isDeliveryAvailable: boolean;
  fullAddress: string;
  coordinates?: { lat: number; lng: number } | null;
  isAddressVerified: boolean;
  formattedAddress?: string;
}

/**
 * Detect delivery zone based on suburb name
 */
export function detectDeliveryZone(suburb: string): {
  zone: ValidatedAddress['deliveryZone'];
  fee: number;
  available: boolean;
} {
  const suburbLower = suburb.toLowerCase().trim();

  // Roberts Estate - Special rate (R15)
  if (suburbLower.includes('roberts') || suburbLower.includes('estate')) {
    return { zone: 'roberts_estate', fee: 15, available: true };
  }

  // Middleburg suburbs - Standard rate (R25)
  const middleburgSuburbs = [
    'central',
    'east',
    'west',
    'north',
    'south',
    'ext',
    'extension',
    'middleburg',
    'middelburg',
  ];

  if (middleburgSuburbs.some((s) => suburbLower.includes(s))) {
    return { zone: 'middleburg', fee: 25, available: true };
  }

  // Outside delivery area
  return { zone: 'outside', fee: 0, available: false };
}

/**
 * Build full address string from components
 */
export function buildFullAddress(address: Partial<ValidatedAddress>): string {
  const parts = [
    address.unitNumber,
    address.streetAddress,
    address.suburb,
    address.city,
    address.postalCode,
    address.province,
    address.country,
  ].filter((part) => part && part.trim());

  return parts.join(', ');
}

/**
 * Validate address has required fields
 */
export function validateAddress(address: Partial<ValidatedAddress>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!address.streetAddress?.trim()) {
    errors.push('Street address is required');
  }

  if (!address.suburb?.trim()) {
    errors.push('Suburb is required');
  }

  if (!address.city?.trim()) {
    errors.push('City is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
