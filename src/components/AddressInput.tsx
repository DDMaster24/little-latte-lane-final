'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { type ValidatedAddress, detectDeliveryZone, buildFullAddress, validateAddress } from '@/types/address';

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
  const [validationMessage, setValidationMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const [manualAddress, setManualAddress] = useState({
    streetAddress: address?.streetAddress || '',
    suburb: address?.suburb || '',
    unitNumber: address?.unitNumber || '',
    postalCode: address?.postalCode || '',
    city: address?.city || 'Middleburg',
    province: address?.province || 'Mpumalanga',
    country: address?.country || 'South Africa'
  });

  // Initialize address from props
  useEffect(() => {
    if (address) {
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
   * Handle manual address validation
   */
  const handleValidation = () => {
    setValidationMessage(null);
    
    // Validate required fields
    const validation = validateAddress(manualAddress);
    if (!validation.valid) {
      setValidationMessage({ 
        type: 'error', 
        message: validation.errors[0] 
      });
      return;
    }
    
    // Build full address and detect delivery zone
    const fullAddress = buildFullAddress(manualAddress);
    const { zone, fee, available } = detectDeliveryZone(manualAddress.suburb);
    
    // Create validated address object
    const validatedAddress: ValidatedAddress = {
      ...manualAddress,
      deliveryZone: zone,
      deliveryFee: fee,
      isDeliveryAvailable: available,
      fullAddress,
      coordinates: null,
      isAddressVerified: false,
      formattedAddress: fullAddress
    };
    
    // Notify parent component
    onChange(validatedAddress);
    setValidationMessage({ 
      type: 'success', 
      message: 'Address validated successfully!' 
    });
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
          </div>

          {/* Manual Entry Fields */}
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
                onClick={handleValidation}
                disabled={!manualAddress.streetAddress || !manualAddress.city}
                className="w-full bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Validate Address
              </Button>
            </div>

          {/* Validation Message */}
          {validationMessage && (
            <Alert className={validationMessage.type === 'success' ? 'border-green-600 bg-green-600/10' : 'border-red-600 bg-red-600/10'}>
              {validationMessage.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              )}
              <AlertDescription className={validationMessage.type === 'success' ? 'text-green-200' : 'text-red-200'}>
                {validationMessage.type === 'success' ? '✅' : '❌'} {validationMessage.message}
              </AlertDescription>
            </Alert>
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