'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Search, CheckCircle, AlertTriangle, Home } from 'lucide-react';
import { addressValidation, type ValidatedAddress } from '@/lib/addressValidation';

interface AddressInputSignupProps {
  address: ValidatedAddress | null;
  onChange: (address: ValidatedAddress | null) => void;
  required?: boolean;
}

/**
 * Signup-specific address input with Google Places autocomplete
 * Focus on accuracy with location confirmation checkboxes
 * No delivery fee shown - just location verification
 */
export default function AddressInputSignup({
  address,
  onChange,
  required = false
}: AddressInputSignupProps) {
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [isRobertsEstate, setIsRobertsEstate] = useState(false);
  const [isMiddleburgArea, setIsMiddleburgArea] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize Google Maps API
  useEffect(() => {
    const initGoogle = async () => {
      try {
        const loaded = await addressValidation.initializeGoogleMaps();
        setGoogleApiLoaded(loaded);
        if (!loaded) {
          console.error('Google Places API failed to load - check API key configuration');
        } else {
          console.log('✅ Google Places API loaded successfully');
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setGoogleApiLoaded(false);
      }
    };
    initGoogle();
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
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Check if Google API is available
      if (!googleApiLoaded || !window.google?.maps?.places) {
        console.warn('Google Places API not available');
        setIsSearching(false);
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      const autocompleteService = new google.maps.places.AutocompleteService();
      
      const request: google.maps.places.AutocompletionRequest = {
        input: query + ', Middleburg, Mpumalanga', // Add location context
        componentRestrictions: { country: 'ZA' },
        types: ['address'],
      };

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        console.log('🔍 Google Places predictions:', predictions, 'Status:', status);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
          setSearchResults(predictions);
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
          if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.warn('Places API status:', status);
          }
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error('Address search error:', error);
      setIsSearching(false);
      setSearchResults([]);
      setShowResults(false);
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
        
        // Auto-check location confirmation based on detected zone
        if (result.address.deliveryZone === 'roberts_estate') {
          setIsRobertsEstate(true);
          setIsMiddleburgArea(true); // Roberts Estate is within Middleburg
        } else if (result.address.deliveryZone === 'middleburg') {
          setIsRobertsEstate(false);
          setIsMiddleburgArea(true);
        } else {
          setIsRobertsEstate(false);
          setIsMiddleburgArea(false);
        }
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

  return (
    <div className="space-y-4">
      {/* Google Places Search */}
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
            placeholder="Start typing your street address in Middleburg..."
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
            autoComplete="off"
            disabled={!googleApiLoaded}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="animate-spin h-4 w-4 border-2 border-neonCyan border-t-transparent rounded-full" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Google API Status */}
        {!googleApiLoaded && (
          <Alert className="mt-2 border-yellow-600 bg-yellow-600/10">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200 text-sm">
              ⚠️ Google Maps is loading... If this persists, please check your API key configuration.
            </AlertDescription>
          </Alert>
        )}
        
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

      {/* Auto-filled address fields - shown after selection */}
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
              ✅ Address validated successfully with GPS coordinates!
            </AlertDescription>
          </Alert>

          {/* Location Confirmation Checkboxes */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600 space-y-3">
            <Label className="text-white font-medium flex items-center gap-2 mb-3">
              <Home className="h-4 w-4 text-neonCyan" />
              Please Confirm Your Location
            </Label>

            {/* Middleburg Area Confirmation */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="middleburg-confirm"
                checked={isMiddleburgArea}
                onCheckedChange={(checked) => setIsMiddleburgArea(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="middleburg-confirm"
                  className="text-sm text-gray-200 font-medium cursor-pointer"
                >
                  ✓ I confirm this address is within Middleburg area
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Required for delivery service availability
                </p>
              </div>
            </div>

            {/* Roberts Estate Confirmation */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="roberts-confirm"
                checked={isRobertsEstate}
                onCheckedChange={(checked) => setIsRobertsEstate(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="roberts-confirm"
                  className="text-sm text-gray-200 font-medium cursor-pointer"
                >
                  🏡 I am a Roberts Estate resident
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Optional - Check this if you live in Roberts Estate (special delivery rate applies)
                </p>
              </div>
            </div>

            {/* Detected Zone Info (for transparency) */}
            {address.deliveryZone && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  <strong>GPS Detected Zone:</strong>{' '}
                  {address.deliveryZone === 'roberts_estate' && '🏡 Roberts Estate'}
                  {address.deliveryZone === 'middleburg' && '🏘️ Middleburg Area'}
                  {address.deliveryZone === 'outside' && '❌ Outside Delivery Area'}
                </p>
                {address.coordinates && (
                  <p className="text-xs text-gray-500 mt-1">
                    GPS: {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>
            )}

            {/* Warning if outside delivery area */}
            {address.deliveryZone === 'outside' && (
              <Alert className="border-red-600 bg-red-600/10 mt-3">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200 text-sm">
                  ⚠️ This address appears to be outside our delivery area. You can still sign up, but delivery may not be available for this location.
                </AlertDescription>
              </Alert>
            )}

            {/* Postal Code Verification */}
            {(address.postalCode === '1050' || address.postalCode === '1055') && (
              <div className="flex items-center gap-2 text-xs text-green-400 mt-2">
                <CheckCircle className="h-3 w-3" />
                Postal code confirmed: Middleburg area (1050/1055)
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
