'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, AlertCircle } from 'lucide-react';
import { addressValidation, type ValidatedAddress } from '@/lib/addressValidation';

interface AddressInputSignupProps {
  address: ValidatedAddress | null;
  onChange: (address: ValidatedAddress | null) => void;
  required?: boolean;
}

/**
 * Simple manual address entry for signup
 * User declares if they're in Roberts Estate or not
 * No Google Maps, no GPS, no complications
 */
export default function AddressInputSignup({
  address: _address,
  onChange,
  required = false
}: AddressInputSignupProps) {
  const [streetAddress, setStreetAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('Middleburg');
  const [province, setProvince] = useState('Mpumalanga');
  const [isRobertsEstate, setIsRobertsEstate] = useState(false);

  // Update validated address whenever fields change
  useEffect(() => {
    if (streetAddress && city) {
      const validateAddress = async () => {
        const result = await addressValidation.validateManualAddress({
          streetAddress,
          suburb,
          unitNumber: '',
          postalCode,
          city,
          province,
          country: 'South Africa'
        });

        if (result.success && result.address) {
          // Override delivery zone based on user's declaration
          const updatedAddress: ValidatedAddress = {
            ...result.address,
            deliveryZone: isRobertsEstate ? 'roberts_estate' : 'middleburg',
            deliveryFee: isRobertsEstate ? 10 : 30,
            isDeliveryAvailable: true,
            isAddressVerified: false, // Manual entry is not GPS verified
            confidenceScore: 0.5,
            validationWarnings: [
              `Manual entry: ${isRobertsEstate ? 'R10' : 'R30'} delivery fee will apply`
            ]
          };
          onChange(updatedAddress);
        }
      };
      validateAddress();
    } else {
      onChange(null);
    }
  }, [streetAddress, suburb, postalCode, city, province, isRobertsEstate, onChange]);

  return (
    <div className="space-y-4">
      {/* Street Address */}
      <div>
        <Label htmlFor="street-address" className="text-white mb-2 block">
          Street Address {required && <span className="text-red-400">*</span>}
        </Label>
        <Input
          id="street-address"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          placeholder="e.g., 123 Main Street"
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          required={required}
        />
      </div>

      {/* Suburb and Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="suburb" className="text-white mb-2 block">
            Suburb / Area
          </Label>
          <Input
            id="suburb"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            placeholder="e.g., Roberts Estate, Central"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="postal-code" className="text-white mb-2 block">
            Postal Code
          </Label>
          <Input
            id="postal-code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="e.g., 1050, 1055"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* City and Province */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-white mb-2 block">
            City
          </Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Middleburg"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="province" className="text-white mb-2 block">
            Province
          </Label>
          <Input
            id="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="Mpumalanga"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Roberts Estate Checkbox */}
      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
        <Label className="text-white font-medium flex items-center gap-2 mb-3">
          <Home className="h-4 w-4 text-neonCyan" />
          Delivery Location
        </Label>

        <div className="flex items-start gap-3">
          <Checkbox
            id="roberts-estate"
            checked={isRobertsEstate}
            onCheckedChange={(checked) => setIsRobertsEstate(checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1">
            <label
              htmlFor="roberts-estate"
              className="text-sm text-gray-200 font-medium cursor-pointer"
            >
              🏡 I am a Roberts Estate resident
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Check this if you live inside Roberts Estate
            </p>
          </div>
        </div>

        {/* Delivery Fee Info */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Delivery Fee:</span>
            <span className="text-lg font-semibold text-neonCyan">
              {isRobertsEstate ? 'R10.00' : 'R30.00'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isRobertsEstate 
              ? '🏡 Roberts Estate resident rate' 
              : '🏘️ Standard Middleburg delivery rate'}
          </p>
        </div>

        {/* Important Notice */}
        <Alert className="mt-4 border-yellow-600 bg-yellow-600/10">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200 text-xs">
            ⚠️ Please ensure your address is accurate. Incorrect addresses may result in delivery delays or additional charges.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
