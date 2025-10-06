import { type ValidatedAddress } from '@/types/address';
import { type DeliveryZone } from '@/lib/deliveryZones';

/**
 * Enhanced Address interface for backward compatibility
 * Used by existing components that haven't been migrated to ValidatedAddress yet
 * 
 * @deprecated This interface exists for backward compatibility only.
 * New code should use ValidatedAddress from addressValidation.ts
 */
export interface EnhancedAddress {
  streetAddress: string;
  suburb: string;
  unitNumber: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  isRobertsEstateResident: boolean;
  googlePlaceId?: string;
  formattedAddress?: string;
  fullAddress: string; // Combined address for storage
}

/**
 * Convert ValidatedAddress to EnhancedAddress for backward compatibility
 * 
 * This function enables seamless integration between the new validated address
 * system and legacy components still using EnhancedAddress.
 * 
 * @param validated - The validated address from the new system
 * @returns EnhancedAddress compatible with legacy components
 */
export const validatedToEnhanced = (validated: ValidatedAddress): EnhancedAddress => {
  return {
    streetAddress: validated.streetAddress ?? '',
    suburb: validated.suburb ?? '',
    unitNumber: validated.unitNumber ?? '',
    postalCode: validated.postalCode ?? '',
    city: validated.city ?? 'Middleburg',
    province: validated.province ?? 'Mpumalanga',
    country: validated.country ?? 'South Africa',
    isRobertsEstateResident: validated.deliveryZone === 'roberts_estate',
    googlePlaceId: validated.googlePlaceId,
    formattedAddress: validated.formattedAddress,
    fullAddress: validated.fullAddress
  };
};

/**
 * Convert EnhancedAddress to ValidatedAddress for new system
 * 
 * This function allows legacy EnhancedAddress data to be used with the new
 * validated address system. Note that converted addresses lack GPS coordinates
 * and are marked as unverified.
 * 
 * @param enhanced - The legacy enhanced address
 * @returns ValidatedAddress with conservative defaults for missing data
 */
export const enhancedToValidated = (enhanced: EnhancedAddress): ValidatedAddress => {
  const deliveryZone: DeliveryZone = enhanced.isRobertsEstateResident ? 'roberts_estate' : 'middleburg';
  const deliveryFee = deliveryZone === 'roberts_estate' ? 10 : 30;
  
  return {
    streetAddress: enhanced.streetAddress ?? '',
    suburb: enhanced.suburb ?? '',
    unitNumber: enhanced.unitNumber ?? '',
    postalCode: enhanced.postalCode ?? '',
    city: enhanced.city ?? 'Middleburg',
    province: enhanced.province ?? 'Mpumalanga',
    country: enhanced.country ?? 'South Africa',
    formattedAddress: enhanced.formattedAddress,
    fullAddress: enhanced.fullAddress,
    googlePlaceId: enhanced.googlePlaceId,
    coordinates: undefined, // Not available from EnhancedAddress
    deliveryZone,
    deliveryFee,
    isDeliveryAvailable: true, // Conservative: assume available for backward compatibility
    isAddressVerified: false, // Conservative: mark as unverified
    confidenceScore: 0.5, // Medium confidence for legacy data
    validationWarnings: [
      '⚠️ Address converted from legacy system - GPS verification recommended',
      `Delivery fee calculated as ${deliveryZone === 'roberts_estate' ? 'Roberts Estate (R10)' : 'Middleburg (R30)'}`
    ]
  };
};