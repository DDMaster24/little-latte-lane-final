'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { addressValidation, type ValidatedAddress, type AddressValidationResult } from '@/lib/addressValidation';

interface AddressInputProps {
  address: ValidatedAddress | null;
  onChange: (address: ValidatedAddress | null) => void;
  required?: boolean;
  className?: string;
  showDeliveryInfo?: boolean;
}

export default function AddressInput({
  address,
  onChange,
  required = false,
  className = '',
  showDeliveryInfo = true
}: AddressInputProps) {
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<AddressValidationResult | null>(null);
  const [manualAddress, setManualAddress] = useState({
    streetAddress: '',
    suburb: '',
    unitNumber: '',
    postalCode: '',
    city: 'Middleburg',
    province: 'Mpumalanga',
    country: 'South Africa'
  });

  const autocompleteRef = useRef<HTMLInputElement>(null);

  // Initialize address display
  useEffect(() => {
    if (address) {
      if (address.formattedAddress) {
        setSearchValue(address.formattedAddress);
      }
      setManualAddress({
        streetAddress: address.streetAddress,
        suburb: address.suburb,
        unitNumber: address.unitNumber,
        postalCode: address.postalCode,
        city: address.city,
        province: address.province,
        country: address.country
      });
    }
  }, [address]);

  /**
   * Handle Google Places search
   */
  const handleGoogleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await addressValidation.validateWithGooglePlaces(searchValue);
      setValidationResult(result);

      if (result.success && result.address) {
        onChange(result.address);
      } else {
        onChange(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Address validation error:', error);
      setValidationResult({
        success: false,
        error: `Validation failed: ${errorMessage}`,
        warnings: ['Please try manual entry or contact support if the issue persists']
      });
      onChange(null);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Handle manual address validation
   */
  const handleManualValidation = async () => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await addressValidation.validateManualAddress(manualAddress);
      setValidationResult(result);

      if (result.success && result.address) {
        onChange(result.address);
      } else {
        onChange(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Manual address validation error:', error);
      setValidationResult({
        success: false,
        error: `Manual validation failed: ${errorMessage}`,
        warnings: ['Please check your address details and try again']
      });
      onChange(null);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Update manual address field
   */
  const updateManualField = (field: keyof typeof manualAddress, value: string) => {
    setManualAddress(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Get delivery zone badge color
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

  /**
   * Get zone display name
   */
  const getZoneDisplayName = (zone: string) => {
    switch (zone) {
      case 'roberts_estate':
        return 'Roberts Estate';
      case 'middleburg':
        return 'Middleburg';
      case 'outside':
        return 'Outside Delivery Area';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-white font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neonCyan" />
              Delivery Address {required && <span className="text-red-400">*</span>}
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setIsManualEntry(false)}
                variant={!isManualEntry ? 'default' : 'outline'}
                size="sm"
                className={`text-xs ${!isManualEntry ? 'bg-neonCyan text-black' : 'text-gray-300 hover:bg-gray-700'}`}
                aria-label="Use Google address search"
                aria-pressed={!isManualEntry}
              >
                <Search className="w-3 h-3 mr-1" />
                Google Search
              </Button>
              <Button
                type="button"
                onClick={() => setIsManualEntry(true)}
                variant={isManualEntry ? 'default' : 'outline'}
                size="sm"
                className={`text-xs ${isManualEntry ? 'bg-neonCyan text-black' : 'text-gray-300 hover:bg-gray-700'}`}
                aria-label="Enter address manually"
                aria-pressed={isManualEntry}
              >
                Manual Entry
              </Button>
            </div>
          </div>

          {!isManualEntry ? (
            // Google Places Search
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  Search for your address in Middleburg
                </Label>
                <div className="flex gap-2">
                  <Input
                    ref={autocompleteRef}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Start typing your address in Middleburg..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && !isValidating && handleGoogleSearch()}
                    aria-label="Search for address using Google"
                    aria-describedby="google-search-help"
                  />
                  <Button
                    type="button"
                    onClick={handleGoogleSearch}
                    disabled={!searchValue.trim() || isValidating}
                    className="bg-neonCyan text-black hover:bg-neonCyan/80"
                    aria-label={isValidating ? 'Validating address...' : 'Search address'}
                  >
                    {isValidating ? (
                      <Clock className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Search className="w-4 h-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                <p id="google-search-help" className="text-xs text-gray-400 mt-1">
                  🎯 Powered by Google Maps • Searching in Middleburg, Mpumalanga
                </p>
              </div>

              {/* Unit Number for Google Search */}
              {address && (
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">
                    Unit/Apartment Number (Optional)
                  </Label>
                  <Input
                    value={address.unitNumber}
                    onChange={(e) => {
                      if (address) {
                        const updated = { ...address, unitNumber: e.target.value };
                        onChange(updated);
                      }
                    }}
                    placeholder="e.g., Unit 5, Apt 12A"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              )}
            </div>
          ) : (
            // Manual Entry Fields
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">
                    Unit/Apartment Number
                  </Label>
                  <Input
                    value={manualAddress.unitNumber}
                    onChange={(e) => updateManualField('unitNumber', e.target.value)}
                    placeholder="e.g., Unit 5, Apt 12A"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">
                    Street Address {required && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    value={manualAddress.streetAddress}
                    onChange={(e) => updateManualField('streetAddress', e.target.value)}
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
                    value={manualAddress.suburb}
                    onChange={(e) => updateManualField('suburb', e.target.value)}
                    placeholder="e.g., Roberts Estate, Central"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required={required}
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">
                    Postal Code
                  </Label>
                  <Input
                    value={manualAddress.postalCode}
                    onChange={(e) => updateManualField('postalCode', e.target.value)}
                    placeholder="e.g., 1055"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">
                    City
                  </Label>
                  <Input
                    value={manualAddress.city}
                    onChange={(e) => updateManualField('city', e.target.value)}
                    placeholder="Middleburg"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">
                    Province
                  </Label>
                  <Input
                    value={manualAddress.province}
                    onChange={(e) => updateManualField('province', e.target.value)}
                    placeholder="Mpumalanga"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleManualValidation}
                disabled={!manualAddress.streetAddress || !manualAddress.city || isValidating}
                className="w-full bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                {isValidating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Validating Address...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validate Address
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Validation Results */}
          {validationResult && (
            <div className="mt-4 space-y-2">
              {validationResult.success ? (
                <Alert className="border-green-600 bg-green-600/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-200">
                    ✅ Address validated successfully!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-600 bg-red-600/10">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    ❌ {validationResult.error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <Alert key={index} className="border-yellow-600 bg-yellow-600/10">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <AlertDescription className="text-yellow-200">
                        ⚠️ {warning}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delivery Zone Information */}
          {address && showDeliveryInfo && (
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white font-medium">Delivery Information</Label>
                <Badge className={getZoneBadgeColor(address.deliveryZone)}>
                  {getZoneDisplayName(address.deliveryZone)}
                </Badge>
              </div>

              {address.isDeliveryAvailable ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Delivery Fee:</span>
                    <span className="text-neonCyan font-semibold">R{address.deliveryFee.toFixed(2)}</span>
                  </div>
                  
                  {address.deliveryZone === 'roberts_estate' && (
                    <p className="text-green-400 text-sm">
                      🏡 Roberts Estate - Special resident rate!
                    </p>
                  )}
                  
                  {address.deliveryZone === 'middleburg' && (
                    <p className="text-blue-400 text-sm">
                      🏘️ Middleburg delivery - Standard rate
                    </p>
                  )}

                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Verification:</span>
                    <span>{address.isAddressVerified ? '✅ GPS Verified' : '⚠️ Manual Entry'}</span>
                  </div>
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
          )}

          {/* Address Preview */}
          {address && (
            <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-600">
              <Label className="text-gray-300 text-xs block mb-1">Final Address:</Label>
              <p className="text-white text-sm">{address.fullAddress}</p>
              {address.formattedAddress && address.formattedAddress !== address.fullAddress && (
                <p className="text-gray-400 text-xs mt-1">
                  Google: {address.formattedAddress}
                </p>
              )}
              {address.coordinates && (
                <p className="text-gray-500 text-xs mt-1">
                  📍 {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}