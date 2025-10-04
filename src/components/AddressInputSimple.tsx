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
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    streetAddress: '',
    suburb: '',
    postalCode: '',
    city: 'Middleburg',
    province: 'Mpumalanga'
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize Google Maps API with proper loading check
  useEffect(() => {
    const initGoogle = async () => {
      try {
        const loaded = await addressValidation.initializeGoogleMaps();
        setGoogleApiLoaded(loaded);
        if (!loaded) {
          console.warn('Google Places API failed to load - manual entry available');
          setIsManualEntry(true); // Fallback to manual if API fails
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setGoogleApiLoaded(false);
        setIsManualEntry(true);
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
        console.log('Google Places predictions:', predictions, 'Status:', status);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
          // Show all results, user can filter
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
   * Handle manual address entry validation
   */
  const handleManualValidation = async () => {
    if (!manualAddress.streetAddress || !manualAddress.city) {
      return;
    }

    setIsSearching(true);
    try {
      const result = await addressValidation.validateManualAddress({
        streetAddress: manualAddress.streetAddress,
        suburb: manualAddress.suburb,
        unitNumber: '',
        postalCode: manualAddress.postalCode,
        city: manualAddress.city,
        province: manualAddress.province,
        country: 'South Africa'
      });
      
      if (result.success && result.address) {
        onChange(result.address);
      }
    } catch (error) {
      console.error('Manual validation error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Update manual address field
   */
  const updateManualField = (field: keyof typeof manualAddress, value: string) => {
    setManualAddress(prev => ({ ...prev, [field]: value }));
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
      {/* Toggle between Google Search and Manual Entry */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setIsManualEntry(false)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            !isManualEntry
              ? 'bg-neonCyan text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Search className="inline-block w-4 h-4 mr-1" />
          Google Search
        </button>
        <button
          type="button"
          onClick={() => setIsManualEntry(true)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isManualEntry
              ? 'bg-neonCyan text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {!isManualEntry ? (
        <>
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
              <p className="text-xs text-yellow-400 mt-1">
                ⚠️ Google Maps loading... Please try manual entry if this persists.
              </p>
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
        </>
      ) : (
        <>
          {/* Manual Entry Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="manual-street" className="text-white mb-2 block">
                Street Address {required && <span className="text-red-400">*</span>}
              </Label>
              <Input
                id="manual-street"
                value={manualAddress.streetAddress}
                onChange={(e) => updateManualField('streetAddress', e.target.value)}
                onBlur={handleManualValidation}
                placeholder="e.g., 123 Main Street"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required={required}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manual-suburb" className="text-white mb-2 block">
                  Suburb / Area
                </Label>
                <Input
                  id="manual-suburb"
                  value={manualAddress.suburb}
                  onChange={(e) => updateManualField('suburb', e.target.value)}
                  onBlur={handleManualValidation}
                  placeholder="e.g., Roberts Estate"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="manual-postal" className="text-white mb-2 block">
                  Postal Code
                </Label>
                <Input
                  id="manual-postal"
                  value={manualAddress.postalCode}
                  onChange={(e) => updateManualField('postalCode', e.target.value)}
                  onBlur={handleManualValidation}
                  placeholder="1050 or 1055"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="manual-city" className="text-white mb-2 block">
                  City
                </Label>
                <Input
                  id="manual-city"
                  value={manualAddress.city}
                  onChange={(e) => updateManualField('city', e.target.value)}
                  onBlur={handleManualValidation}
                  placeholder="Middleburg"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="manual-province" className="text-white mb-2 block">
                  Province
                </Label>
                <Input
                  id="manual-province"
                  value={manualAddress.province}
                  onChange={(e) => updateManualField('province', e.target.value)}
                  onBlur={handleManualValidation}
                  placeholder="Mpumalanga"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Auto-filled fields preview - always visible when using Google search */}
      {!isManualEntry && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Suburb / Area</Label>
            <Input
              value={address?.suburb || ''}
              readOnly
              placeholder="Will be filled automatically"
              className="bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed"
            />
          </div>
          
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Postal Code</Label>
            <Input
              value={address?.postalCode || ''}
              readOnly
              placeholder="Will be filled automatically"
              className="bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="text-gray-300 text-sm mb-2 block">City</Label>
            <Input
              value={address?.city || ''}
              readOnly
              placeholder="Will be filled automatically"
              className="bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Province</Label>
            <Input
              value={address?.province || ''}
              readOnly
              placeholder="Will be filled automatically"
              className="bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* Validation success and delivery info - only show when address is validated */}
      {address && (
        <>

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
