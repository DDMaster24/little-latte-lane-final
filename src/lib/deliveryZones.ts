// Roberts Estate Delivery Zone Configuration
// Middleburg, Mpumalanga, South Africa

/**
 * Delivery zone types for type safety
 */
export type DeliveryZone = 'roberts_estate' | 'middleburg' | 'outside';

export const DELIVERY_ZONES = {
  // Roberts Estate - R10 delivery fee
  ROBERTS_ESTATE: {
    name: 'Roberts Estate',
    fee: 10.00,
    zone: 'roberts_estate',
    // Approximate boundaries - these need to be verified with actual estate boundaries
    boundaries: {
      // Central coordinates of Roberts Estate (approximate)
      center: { lat: -25.775, lng: 29.464 },
      
      // Radius in kilometers (approximate estate size)
      radiusKm: 2.5,
      
      // More precise boundary polygon points (to be refined)
      polygon: [
        { lat: -25.770, lng: 29.460 },
        { lat: -25.770, lng: 29.468 },
        { lat: -25.780, lng: 29.468 },
        { lat: -25.780, lng: 29.460 }
      ]
    }
  },

  // Middleburg (outside Roberts Estate) - R30 delivery fee  
  MIDDLEBURG: {
    name: 'Middleburg',
    fee: 30.00,
    zone: 'middleburg',
    boundaries: {
      // Middleburg town center
      center: { lat: -25.775, lng: 29.464 },
      
      // Delivery radius from town center (km)
      radiusKm: 15,
      
      // Approximate Middleburg municipal boundaries
      polygon: [
        { lat: -25.750, lng: 29.440 },
        { lat: -25.750, lng: 29.490 },
        { lat: -25.800, lng: 29.490 },
        { lat: -25.800, lng: 29.440 }
      ]
    }
  }
};

// Address validation configuration
export const ADDRESS_VALIDATION = {
  // Google Places API restrictions
  googlePlaces: {
    // Restrict searches to South Africa
    componentRestrictions: { country: 'ZA' },
    
    // Focus on Middleburg area
    bounds: {
      north: -25.750,
      south: -25.800,
      east: 29.490,
      west: 29.440
    },
    
    // Bias results towards Middleburg
    locationBias: {
      center: { lat: -25.775, lng: 29.464 },
      radius: 20000 // 20km radius
    }
  },

  // Validation rules
  rules: {
    // Must contain Middleburg in address
    mustContainMiddleburg: true,
    
    // Must be in Mpumalanga province
    mustBeInMpumalanga: true,
    
    // Minimum confidence score for Google Places results
    minConfidenceScore: 0.8,
    
    // Maximum distance from Middleburg center (km)
    maxDistanceFromCenter: 25
  }
};

// Utility functions for zone detection
export const ZoneDetection = {
  /**
   * Detect delivery zone based on GPS coordinates
   * @param lat - Latitude coordinate
   * @param lng - Longitude coordinate
   * @returns Delivery zone identifier
   * @throws Error if coordinates are invalid
   */
  detectZone(lat: number, lng: number): DeliveryZone {
    // Validate coordinates
    if (!this.isValidCoordinate(lat, lng)) {
      throw new Error('Invalid GPS coordinates provided');
    }
    // Check if coordinates are within Roberts Estate
    if (this.isWithinRobertsEstate(lat, lng)) {
      return 'roberts_estate';
    }
    
    // Check if coordinates are within Middleburg delivery area
    if (this.isWithinMiddleburg(lat, lng)) {
      return 'middleburg';
    }
    
    // Outside delivery area
    return 'outside';
  },

  /**
   * Validate GPS coordinates are within reasonable ranges
   * @param lat - Latitude (-90 to 90)
   * @param lng - Longitude (-180 to 180)
   */
  isValidCoordinate(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      !isNaN(lat) && 
      !isNaN(lng) &&
      lat >= -90 && 
      lat <= 90 && 
      lng >= -180 && 
      lng <= 180
    );
  },

  /**
   * Check if coordinates are within Roberts Estate
   */
  isWithinRobertsEstate(lat: number, lng: number): boolean {
    const estate = DELIVERY_ZONES.ROBERTS_ESTATE.boundaries;
    const distance = this.calculateDistance(
      lat, lng, 
      estate.center.lat, estate.center.lng
    );
    
    return distance <= estate.radiusKm;
  },

  /**
   * Check if coordinates are within Middleburg delivery area
   */
  isWithinMiddleburg(lat: number, lng: number): boolean {
    const middleburg = DELIVERY_ZONES.MIDDLEBURG.boundaries;
    const distance = this.calculateDistance(
      lat, lng,
      middleburg.center.lat, middleburg.center.lng
    );
    
    return distance <= middleburg.radiusKm;
  },

  /**
   * Calculate distance between two GPS coordinates (Haversine formula)
   * @param lat1 - First point latitude
   * @param lng1 - First point longitude
   * @param lat2 - Second point latitude
   * @param lng2 - Second point longitude
   * @returns Distance in kilometers
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Ensure non-negative distance
    return Math.max(0, distance);
  },

  /**
   * Convert degrees to radians
   */
  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  /**
   * Get delivery fee for coordinates
   * @param lat - Latitude coordinate
   * @param lng - Longitude coordinate
   * @returns Delivery fee in Rand (0 if outside delivery area)
   */
  getDeliveryFee(lat: number, lng: number): number {
    try {
      const zone = this.detectZone(lat, lng);
      
      switch (zone) {
        case 'roberts_estate':
          return DELIVERY_ZONES.ROBERTS_ESTATE.fee;
        case 'middleburg':
          return DELIVERY_ZONES.MIDDLEBURG.fee;
        default:
          return 0; // No delivery outside area
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      return 30; // Safe default: charge Middleburg rate if validation fails
    }
  },

  /**
   * Validate if delivery is available to coordinates
   * @param lat - Latitude coordinate
   * @param lng - Longitude coordinate
   * @returns True if delivery is available, false otherwise
   */
  isDeliveryAvailable(lat: number, lng: number): boolean {
    try {
      const zone = this.detectZone(lat, lng);
      return zone !== 'outside';
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      return false; // Safe default: no delivery if validation fails
    }
  }
};