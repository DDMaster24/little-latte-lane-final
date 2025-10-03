// Enhanced Address Validation Service with Delivery Zone Detection
import { ZoneDetection, ADDRESS_VALIDATION, type DeliveryZone } from './deliveryZones';

export interface BaseAddress {
  streetAddress: string;
  suburb: string;
  unitNumber: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
}

export interface ValidatedAddress extends BaseAddress {
  streetAddress: string;
  suburb: string;
  unitNumber: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  fullAddress: string;
  
  // Enhanced fields for delivery system
  googlePlaceId?: string;
  formattedAddress?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // Delivery zone information
  deliveryZone: DeliveryZone;
  deliveryFee: number;
  isDeliveryAvailable: boolean;
  
  // Validation status
  isAddressVerified: boolean;
  confidenceScore: number;
  validationWarnings: string[];
}

export interface AddressValidationResult {
  success: boolean;
  address?: ValidatedAddress;
  error?: string;
  warnings: string[];
}

export class AddressValidationService {
  private googleMapsLoaded = false;

  /**
   * Initialize Google Maps API
   */
  async initializeGoogleMaps(): Promise<boolean> {
    if (this.googleMapsLoaded && window.google?.maps?.places) {
      return true;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey || apiKey === 'your_google_places_api_key_here') {
      console.warn('Google Places API key not configured');
      return false;
    }

    return new Promise((resolve) => {
      if (window.google?.maps?.places) {
        this.googleMapsLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.googleMapsLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Validate address using Google Places API
   */
  async validateWithGooglePlaces(searchAddress: string): Promise<AddressValidationResult> {
    const warnings: string[] = [];

    try {
      const mapsLoaded = await this.initializeGoogleMaps();
      if (!mapsLoaded) {
        return {
          success: false,
          error: 'Google Maps API not available',
          warnings: ['Falling back to manual address entry']
        };
      }

      const service = new google.maps.places.PlacesService(document.createElement('div'));

      // Search for the address
      const placeRequest: google.maps.places.FindPlaceFromQueryRequest = {
        query: searchAddress,
        fields: ['place_id', 'formatted_address', 'geometry', 'address_components', 'name'],
        locationBias: ADDRESS_VALIDATION.googlePlaces.locationBias
      };

      return new Promise((resolve) => {
        service.findPlaceFromQuery(placeRequest, (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.[0]) {
            resolve({
              success: false,
              error: 'Address not found via Google Places',
              warnings: ['Please try manual entry or check spelling']
            });
            return;
          }

          const place = results[0];
          
          // Get detailed place information
          service.getDetails({
            placeId: place.place_id!,
            fields: ['address_components', 'formatted_address', 'geometry', 'place_id']
          }, (placeDetails, detailStatus) => {
            if (detailStatus !== google.maps.places.PlacesServiceStatus.OK || !placeDetails) {
              resolve({
                success: false,
                error: 'Could not get place details',
                warnings: []
              });
              return;
            }

            // Validate the address
            const validationResult = this.processGooglePlaceResult(placeDetails, warnings);
            resolve(validationResult);
          });
        });
      });

    } catch (error) {
      return {
        success: false,
        error: `Validation failed: ${error}`,
        warnings
      };
    }
  }

  /**
   * Process Google Places result and validate delivery zone
   */
  private processGooglePlaceResult(
    place: google.maps.places.PlaceResult,
    warnings: string[]
  ): AddressValidationResult {
    try {
      const coords = place.geometry?.location;
      if (!coords) {
        return {
          success: false,
          error: 'Could not determine location coordinates',
          warnings
        };
      }

      const lat = coords.lat();
      const lng = coords.lng();

      // Parse address components
      const addressComponents = this.parseAddressComponents(place.address_components || []);
      
      // Validate it's in Middleburg/Mpumalanga
      const locationValidation = this.validateLocation(addressComponents, lat, lng);
      warnings.push(...locationValidation.warnings);

      if (!locationValidation.isValid) {
        return {
          success: false,
          error: locationValidation.error,
          warnings
        };
      }

      // Detect delivery zone with GPS validation
      const deliveryZone = ZoneDetection.detectZone(lat, lng);
      const deliveryFee = ZoneDetection.getDeliveryFee(lat, lng);
      const isDeliveryAvailable = ZoneDetection.isDeliveryAvailable(lat, lng);

      // Add delivery-specific warnings
      if (deliveryZone === 'outside') {
        warnings.push('This address is outside our delivery area');
      } else if (deliveryZone === 'middleburg') {
        warnings.push('This address is outside Roberts Estate - R30 delivery fee will apply');
      }

      const validatedAddress: ValidatedAddress = {
        ...addressComponents,
        fullAddress: this.combineAddress(addressComponents),
        googlePlaceId: place.place_id,
        formattedAddress: place.formatted_address,
        coordinates: { lat, lng },
        deliveryZone, // Type is already DeliveryZone from detectZone
        deliveryFee,
        isDeliveryAvailable,
        isAddressVerified: true,
        confidenceScore: this.calculateConfidenceScore(place, addressComponents),
        validationWarnings: warnings
      };

      return {
        success: true,
        address: validatedAddress,
        warnings
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to process address: ${error}`,
        warnings
      };
    }
  }

  /**
   * Parse Google Places address components
   */
  private parseAddressComponents(components: google.maps.GeocoderAddressComponent[]) {
    const result = {
      streetAddress: '',
      suburb: '',
      unitNumber: '',
      postalCode: '',
      city: 'Middleburg',
      province: 'Mpumalanga',
      country: 'South Africa'
    };

    components.forEach((component) => {
      const types = component.types;
      
      if (types.includes('street_number') || types.includes('route')) {
        result.streetAddress += component.long_name + ' ';
      }
      if (types.includes('sublocality') || types.includes('neighborhood')) {
        result.suburb = component.long_name;
      }
      if (types.includes('postal_code')) {
        result.postalCode = component.long_name;
      }
      if (types.includes('locality')) {
        result.city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        result.province = component.long_name;
      }
      if (types.includes('country')) {
        result.country = component.long_name;
      }
    });

    result.streetAddress = result.streetAddress.trim();
    return result;
  }

  /**
   * Validate location is in Middleburg/Mpumalanga
   */
  private validateLocation(address: BaseAddress, lat: number, lng: number) {
    const warnings: string[] = [];
    
    // Check if address contains Middleburg
    const addressText = `${address.city} ${address.suburb} ${address.streetAddress}`.toLowerCase();
    const containsMiddleburg = addressText.includes('middleburg') || addressText.includes('middelburg');
    
    if (!containsMiddleburg) {
      warnings.push('Address may not be in Middleburg - please verify');
    }

    // Check province
    if (!address.province.toLowerCase().includes('mpumalanga')) {
      warnings.push('Address may not be in Mpumalanga province');
    }

    // Check distance from Middleburg center
    const distanceFromCenter = ZoneDetection.calculateDistance(
      lat, lng, -25.775, 29.464
    );

    if (distanceFromCenter > ADDRESS_VALIDATION.rules.maxDistanceFromCenter) {
      return {
        isValid: false,
        error: `Address is ${distanceFromCenter.toFixed(1)}km from Middleburg - outside delivery area`,
        warnings
      };
    }

    if (distanceFromCenter > 20) {
      warnings.push(`Address is ${distanceFromCenter.toFixed(1)}km from Middleburg center`);
    }

    return {
      isValid: true,
      warnings
    };
  }

  /**
   * Calculate confidence score for address validation
   */
  private calculateConfidenceScore(place: google.maps.places.PlaceResult, address: BaseAddress): number {
    let score = 0.5; // Base score

    // Has place ID
    if (place.place_id) score += 0.2;
    
    // Has street address
    if (address.streetAddress) score += 0.1;
    
    // Has postal code
    if (address.postalCode) score += 0.1;
    
    // Contains Middleburg
    if (address.city.toLowerCase().includes('middleburg')) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Manual address validation (fallback)
   */
  async validateManualAddress(address: BaseAddress): Promise<AddressValidationResult> {
    const warnings: string[] = [];

    // Basic validation
    if (!address.streetAddress || !address.city) {
      return {
        success: false,
        error: 'Street address and city are required',
        warnings
      };
    }

    // Check if city is Middleburg
    if (!address.city.toLowerCase().includes('middleburg')) {
      warnings.push('Manual entry: Please confirm this address is in Middleburg');
    }

    // Since we don't have coordinates for manual entry, assume it's in Middleburg zone
    // This is a limitation - we should encourage Google validation
    warnings.push('Manual entry: Address not verified with GPS coordinates');
    warnings.push('Delivery fee will be calculated as Middleburg (R30) for safety');

    const validatedAddress: ValidatedAddress = {
      ...address,
      fullAddress: this.combineAddress(address),
      deliveryZone: 'middleburg', // Conservative assumption
      deliveryFee: 30.00, // Safe default
      isDeliveryAvailable: true,
      isAddressVerified: false,
      confidenceScore: 0.3, // Low confidence for manual entry
      validationWarnings: warnings
    };

    return {
      success: true,
      address: validatedAddress,
      warnings
    };
  }

  /**
   * Combine address fields into full address string
   */
  private combineAddress(address: BaseAddress): string {
    const parts = [
      address.unitNumber ? `Unit ${address.unitNumber}` : '',
      address.streetAddress,
      address.suburb,
      address.postalCode,
      address.city,
      address.province
    ].filter(Boolean);
    
    return parts.join(', ');
  }
}

// Export singleton instance
export const addressValidation = new AddressValidationService();