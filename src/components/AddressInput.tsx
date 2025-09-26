'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Search, AlertTriangle, CheckCircle } from 'lucide-react';

// Extend Window interface to include Google Maps
declare global {
  interface Window {
    google?: typeof google;
  }
}

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

interface AddressInputProps {
  address: EnhancedAddress;
  onChange: (address: EnhancedAddress) => void;
  required?: boolean;
  showRobertsEstateVerification?: boolean;
  className?: string;
}

export default function AddressInput({
  address,
  onChange,
  required = false,
  showRobertsEstateVerification = true,
  className = ''
}: AddressInputProps) {
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Places API
  useEffect(() => {
    const loadGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleLoaded(true);
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
      if (!apiKey || apiKey === 'your_google_places_api_key_here') {
        console.warn('Google Places API key not configured, using manual entry only');
        setIsManualEntry(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Google Places API');
        setIsManualEntry(true);
      };
      document.head.appendChild(script);
    };

    loadGooglePlaces();
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!googleLoaded || !autocompleteRef.current || isManualEntry) return;

    // Focus on South African addresses, particularly Western Cape region
    autocompleteInstance.current = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'ZA' }, // Restrict to South Africa
        fields: ['formatted_address', 'address_components', 'place_id', 'geometry']
      }
    );

    const handlePlaceSelect = () => {
      const place = autocompleteInstance.current?.getPlace();
      if (!place || !place.address_components) return;

      const components = place.address_components;
      const newAddress: EnhancedAddress = {
        streetAddress: '',
        suburb: '',
        unitNumber: address.unitNumber || '',
        postalCode: '',
        city: 'George',
        province: 'Western Cape',
        country: 'South Africa',
        isRobertsEstateResident: address.isRobertsEstateResident || false,
        googlePlaceId: place.place_id,
        formattedAddress: place.formatted_address,
        fullAddress: ''
      };

      // Parse address components
      components.forEach((component: google.maps.GeocoderAddressComponent) => {
        const types = component.types;
        
        if (types.includes('street_number') || types.includes('route')) {
          newAddress.streetAddress += component.long_name + ' ';
        }
        if (types.includes('sublocality') || types.includes('neighborhood')) {
          newAddress.suburb = component.long_name;
        }
        if (types.includes('postal_code')) {
          newAddress.postalCode = component.long_name;
        }
        if (types.includes('locality')) {
          newAddress.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          newAddress.province = component.long_name;
        }
        if (types.includes('country')) {
          newAddress.country = component.long_name;
        }
      });

      newAddress.streetAddress = newAddress.streetAddress.trim();
      
      // Combine address for storage
      newAddress.fullAddress = combineAddress(newAddress);
      
      onChange(newAddress);
      setSearchValue(place.formatted_address || '');
    };

    autocompleteInstance.current.addListener('place_changed', handlePlaceSelect);

    return () => {
      if (autocompleteInstance.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance.current);
      }
    };
  }, [googleLoaded, isManualEntry, onChange, address.unitNumber, address.isRobertsEstateResident]);

  // Combine address fields into full address string
  const combineAddress = (addr: EnhancedAddress): string => {
    const parts = [
      addr.unitNumber ? `Unit ${addr.unitNumber}` : '',
      addr.streetAddress,
      addr.suburb,
      addr.postalCode,
      addr.city,
      addr.province
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  // Update full address when individual fields change
  const updateField = (field: keyof EnhancedAddress, value: string | boolean) => {
    const updated = { ...address, [field]: value };
    if (typeof value === 'string') {
      updated.fullAddress = combineAddress(updated);
    }
    onChange(updated);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-white font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neonCyan" />
              Address Information {required && <span className="text-red-400">*</span>}
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setIsManualEntry(false)}
                variant={!isManualEntry ? 'default' : 'outline'}
                size="sm"
                className={`text-xs ${!isManualEntry ? 'bg-neonCyan text-black' : 'text-gray-300 hover:bg-gray-700'}`}
                disabled={!googleLoaded}
              >
                <Search className="w-3 h-3 mr-1" />
                Auto-complete
              </Button>
              <Button
                type="button"
                onClick={() => setIsManualEntry(true)}
                variant={isManualEntry ? 'default' : 'outline'}
                size="sm"
                className={`text-xs ${isManualEntry ? 'bg-neonCyan text-black' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                Manual Entry
              </Button>
            </div>
          </div>

          {!isManualEntry && googleLoaded ? (
            // Google Places Autocomplete
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  Search for your address
                </Label>
                <Input
                  ref={autocompleteRef}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Start typing your address..."
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Powered by Google Places • Start typing to see suggestions
                </p>
              </div>

              {/* Unit Number for Google Places */}
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  Unit/Apartment Number (Optional)
                </Label>
                <Input
                  value={address.unitNumber}
                  onChange={(e) => updateField('unitNumber', e.target.value)}
                  placeholder="e.g., Unit 5, Apt 12A"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
          ) : (
            // Manual Entry Fields
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  Unit/Apartment Number
                </Label>
                <Input
                  value={address.unitNumber}
                  onChange={(e) => updateField('unitNumber', e.target.value)}
                  placeholder="e.g., Unit 5, Apt 12A"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  Street Address {required && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  value={address.streetAddress}
                  onChange={(e) => updateField('streetAddress', e.target.value)}
                  placeholder="e.g., 123 Main Street"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required={required}
                />
              </div>

              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  Suburb/Area {required && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  value={address.suburb}
                  onChange={(e) => updateField('suburb', e.target.value)}
                  placeholder="e.g., Blanco, Heatherlands"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required={required}
                />
              </div>

              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  Postal Code
                </Label>
                <Input
                  value={address.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="e.g., 6529"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  City
                </Label>
                <Input
                  value={address.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="George"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  Province
                </Label>
                <Input
                  value={address.province}
                  onChange={(e) => updateField('province', e.target.value)}
                  placeholder="Western Cape"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Roberts Estate Verification */}
          {showRobertsEstateVerification && (
            <div className="mt-6 p-4 border border-gray-600 rounded-lg bg-gray-900/50">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="roberts-estate"
                  checked={address.isRobertsEstateResident}
                  onCheckedChange={(checked: boolean) => updateField('isRobertsEstateResident', checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label 
                    htmlFor="roberts-estate" 
                    className="text-white cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-neonCyan" />
                    Roberts Estate Resident Verification {required && <span className="text-red-400">*</span>}
                  </Label>
                  <p className="text-sm text-gray-300 mt-1">
                    I confirm that I am a resident or authorized user within Roberts Estate, George. 
                    I understand that Little Latte Lane only provides delivery services within the estate.
                  </p>
                </div>
              </div>

              {!address.isRobertsEstateResident && (
                <Alert className="mt-3 border-yellow-600 bg-yellow-600/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200">
                    <strong>Important:</strong> Little Latte Lane only delivers within Roberts Estate. 
                    You must verify your residency to place delivery orders.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Address Preview */}
          {address.fullAddress && (
            <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-600">
              <Label className="text-gray-300 text-xs block mb-1">Address Preview:</Label>
              <p className="text-white text-sm">{address.fullAddress}</p>
              {address.formattedAddress && address.formattedAddress !== address.fullAddress && (
                <p className="text-gray-400 text-xs mt-1">
                  Google: {address.formattedAddress}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}