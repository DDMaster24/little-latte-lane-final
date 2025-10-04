'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Search, CheckCircle, AlertTriangle, AlertCircle, Home } from 'lucide-react';
import { addressValidation, type ValidatedAddress } from '@/lib/addressValidation';

interface AddressInputSimpleProps {
  address: ValidatedAddress | null;
  onChange: (address: ValidatedAddress | null) => void;
  required?: boolean;
}

/**
 * Simplified address input for signup flow - Step 2
 * Natural, expanded form with Google Places autocomplete
 * Auto-fills all fields when address is selected
 */
export default function AddressInputSimple({
  address,
  onChange,
  required = false
}: AddressInputSimpleProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize Google Maps API
  useEffect(() => {
    addressValidation.initializeGoogleMaps();
  }, []);

  // Click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Search for addresses as user types
   */
  const handleSearch = async (query: string) => {
    setSearchValue(query);
    
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      if (!window.google?.maps?.places) {
        console.warn('Google Places API not loaded');
        return;
      }

      const autocompleteService = new google.maps.places.AutocompleteService();
      
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        componentRestrictions: { country: 'ZA' },
        types: ['address'],
        locationBias: {
          center: { lat: -25.775, lng: 29.464 }, // Middleburg center
          radius: 20000 // 20km radius
        } as google.maps.places.LocationBias
      };

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Filter for Middleburg addresses
          const middleburgResults = predictions.filter(p => 
            p.description.toLowerCase().includes('middleburg') || 
            p.description.toLowerCase().includes('middelburg')
          );
          setSearchResults(middleburgResults);
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error('Address search error:', error);
      setIsSearching(false);
    }
  };

  /**
   * Handle address selection from dropdown
   */
  const handleSelectAddress = async (placeId: string, description: string) => {
    setSearchValue(description);
    setShowResults(false);
    setIsSearching(true);

    try {
      const result = await addressValidation.validateWithGooglePlaces(description);
      
      if (result.success && result.address) {
        onChange(result.address);
      } else {
        onChange(null);
      }
    } catch (error) {
      console.error('Address validation error:', error);
      onChange(null);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Get zone badge color
   */
  const getZoneBadgeColor = (zone: string) => {
    switch (zone) {
      case 'roberts_estate':
        return 'bg-green-600 text-white';
      case 'middleburg':
        return 'bg-blue-600 text-white';
      case 'outside':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-4">
      {/* Street Address Search */}
      <div className="relative">
        <Label htmlFor="street-search" className="text-white mb-2 block">
          Street Address {required && <span className="text-red-400">*</span>}
        </Label>
        <div className="relative">
          <Input
            id="street-search"
            ref={searchInputRef}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Start typing your street address..."
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="animate-spin h-4 w-4 border-2 border-neonCyan border-t-transparent rounded-full" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div
            ref={resultsRef}
            className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelectAddress(result.place_id, result.description)}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-neonCyan mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white text-sm">{result.structured_formatting.main_text}</p>
                    <p className="text-gray-400 text-xs">{result.structured_formatting.secondary_text}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Powered by Google Maps • Searching in Middleburg, Mpumalanga
        </p>
      </div>

      {/* Auto-filled fields - only show when address is validated */}
      {address && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Suburb / Area</Label>
              <Input
                value={address.suburb}
                readOnly
                className="bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed"
              />
            </div>
            
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Postal Code</Label>
              <Input
                value={address.postalCode}
                readOnly
                className="bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <Label className="text-gray-300 text-sm mb-2 block">City</Label>
              <Input
                value={address.city}
                readOnly
                className="bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <Label className="text-gray-300 text-sm mb-2 block">Province</Label>
              <Input
                value={address.province}
                readOnly
                className="bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Validation Success */}
          <Alert className="border-green-600 bg-green-600/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              ✅ Address validated successfully!
            </AlertDescription>
          </Alert>

          {/* Delivery Zone Information */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-white font-medium flex items-center gap-2">
                <Home className="h-4 w-4 text-neonCyan" />
                Delivery Information
              </Label>
              <Badge className={getZoneBadgeColor(address.deliveryZone)}>
                {address.deliveryZone === 'roberts_estate' && 'Roberts Estate'}
                {address.deliveryZone === 'middleburg' && 'Middleburg'}
                {address.deliveryZone === 'outside' && 'Outside Delivery Area'}
              </Badge>
            </div>

            {address.isDeliveryAvailable ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Delivery Fee:</span>
                  <span className="text-neonCyan font-semibold text-lg">R{address.deliveryFee.toFixed(2)}</span>
                </div>
                
                {address.deliveryZone === 'roberts_estate' && (
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    🏡 Roberts Estate resident rate - Save R20!
                  </p>
                )}
                
                {address.deliveryZone === 'middleburg' && (
                  <p className="text-blue-400 text-sm flex items-center gap-1">
                    🏘️ Standard Middleburg delivery rate
                  </p>
                )}

                <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                  <span>Address Verification:</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {address.isAddressVerified ? 'GPS Verified' : 'Manual Entry'}
                  </span>
                </div>

                {/* Postal Code Verification */}
                {(address.postalCode === '1050' || address.postalCode === '1055') && (
                  <div className="flex items-center gap-1 text-xs text-green-400 pt-1">
                    <CheckCircle className="h-3 w-3" />
                    Postal code confirmed: Middleburg area
                  </div>
                )}
              </div>
            ) : (
              <Alert className="border-red-600 bg-red-600/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  ❌ Sorry, we don&apos;t deliver to this area. Delivery is only available within Middleburg.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Warnings */}
          {address.validationWarnings.length > 0 && (
            <div className="space-y-1">
              {address.validationWarnings.map((warning, index) => (
                <Alert key={index} className="border-yellow-600 bg-yellow-600/10">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200 text-sm">
                    ⚠️ {warning}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
