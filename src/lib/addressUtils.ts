import { EnhancedAddress } from '@/lib/addressCompat';

/**
 * Address utilities for parsing, validation, and storage
 * Handles the enhanced address system with Roberts Estate verification
 */

// Default empty address
export const createEmptyAddress = (): EnhancedAddress => ({
  streetAddress: '',
  suburb: '',
  unitNumber: '',
  postalCode: '',
  city: 'George',
  province: 'Western Cape',
  country: 'South Africa',
  isRobertsEstateResident: false,
  fullAddress: ''
});

// Parse legacy single address string into enhanced address object
export const parseAddressString = (addressString: string | null): EnhancedAddress => {
  if (!addressString) {
    return createEmptyAddress();
  }

  // Try to parse if it's JSON (enhanced address)
  try {
    const parsed = JSON.parse(addressString);
    if (parsed && typeof parsed === 'object' && parsed.fullAddress !== undefined) {
      return {
        ...createEmptyAddress(),
        ...parsed
      };
    }
  } catch {
    // Not JSON, treat as legacy single address
  }

  // Legacy single address string - try to parse components
  const parts = addressString.split(',').map(part => part.trim());
  const address = createEmptyAddress();
  
  if (parts.length >= 1) address.streetAddress = parts[0];
  if (parts.length >= 2) address.suburb = parts[1];
  if (parts.length >= 3) address.postalCode = parts[2];
  if (parts.length >= 4) address.city = parts[3];
  
  address.fullAddress = addressString;
  
  return address;
};

// Convert enhanced address to storage string (JSON)
export const serializeAddress = (address: EnhancedAddress): string => {
  return JSON.stringify({
    streetAddress: address.streetAddress,
    suburb: address.suburb,
    unitNumber: address.unitNumber,
    postalCode: address.postalCode,
    city: address.city,
    province: address.province,
    country: address.country,
    isRobertsEstateResident: address.isRobertsEstateResident,
    formattedAddress: address.formattedAddress,
    fullAddress: address.fullAddress
  });
};

// Create display-friendly address string
export const formatAddressForDisplay = (address: EnhancedAddress): string => {
  if (!address.streetAddress && !address.fullAddress) {
    return 'No address provided';
  }
  
  // If fullAddress exists and looks complete, use it directly
  // (fullAddress already has all components formatted correctly)
  if (address.fullAddress && address.fullAddress.includes(',')) {
    return address.fullAddress;
  }
  
  // Otherwise build from components
  return [
    address.unitNumber,
    address.streetAddress,
    address.suburb,
    address.city,
    address.postalCode,
    address.province
  ].filter(Boolean).join(', ');
};

// Validate address completeness
export const validateAddress = (address: EnhancedAddress, requireRobertsEstate = false): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!address.streetAddress && !address.fullAddress) {
    errors.push('Street address is required');
  }
  
  if (!address.suburb && !address.fullAddress) {
    errors.push('Suburb/area is required');
  }
  
  if (requireRobertsEstate && !address.isRobertsEstateResident) {
    errors.push('Roberts Estate residency verification is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Check if address indicates Roberts Estate residence
export const isLikelyRobertsEstate = (address: EnhancedAddress): boolean => {
  const addressText = (address.fullAddress + ' ' + address.formattedAddress + ' ' + address.suburb).toLowerCase();
  
  const robertsEstateKeywords = [
    'roberts estate',
    'roberts',
    'estate',
    'blanco',
    'heatherlands',
    'george'
  ];
  
  return robertsEstateKeywords.some(keyword => addressText.includes(keyword));
};

// Create delivery address string for orders (backward compatibility)
export const createDeliveryAddress = (address: EnhancedAddress): string => {
  return formatAddressForDisplay(address);
};

// Address validation for delivery eligibility
export const validateDeliveryEligibility = (address: EnhancedAddress): {
  eligible: boolean;
  reason?: string;
} => {
  if (!address.isRobertsEstateResident) {
    return {
      eligible: false,
      reason: 'Roberts Estate residency verification required'
    };
  }
  
  if (!address.streetAddress && !address.fullAddress) {
    return {
      eligible: false,
      reason: 'Complete address information required'
    };
  }
  
  return { eligible: true };
};

// Extract address components for admin display
export const getAddressComponents = (address: EnhancedAddress) => ({
  street: address.streetAddress,
  unit: address.unitNumber,
  suburb: address.suburb,
  postalCode: address.postalCode,
  city: address.city,
  province: address.province,
  country: address.country,
  full: address.fullAddress,
  googleFormatted: address.formattedAddress,
  residencyVerified: address.isRobertsEstateResident
});