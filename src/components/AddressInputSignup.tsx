'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { addressValidation, type ValidatedAddress } from '@/lib/addressValidation';
import { validateAddressForRobertsEstate, searchRobertsEstateStreets } from '@/lib/robertsEstateStreets';

interface AddressInputSignupProps {
  address: ValidatedAddress | null;
  onChange: (address: ValidatedAddress | null) => void;
  required?: boolean;
}

/**
 * Smart address entry with autocomplete for Roberts Estate streets
 * Separate fields: Unit Number, Street Name (with autocomplete), City, Postal Code
 * Auto-detects Roberts Estate and adjusts delivery fee accordingly
 */
export default function AddressInputSignup({
  address: _address,
  onChange,
  required = false
}: AddressInputSignupProps) {
  const [unitNumber, setUnitNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isRobertsEstate, setIsRobertsEstate] = useState(false);
  const [autoDetectedRoberts, setAutoDetectedRoberts] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  
  // Autocomplete state
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Fixed values
  const city = 'Middleburg';
  const province = 'Mpumalanga';

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        streetInputRef.current &&
        !streetInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle street name input and show autocomplete
  const handleStreetNameChange = (value: string) => {
    setStreetName(value);
    
    // Search for matching streets
    const matches = searchRobertsEstateStreets(value);
    setStreetSuggestions(matches);
    setShowSuggestions(matches.length > 0 && value.length >= 2);
    setSelectedIndex(-1);
  };

  // Handle suggestion selection
  const handleSelectStreet = (street: string) => {
    setStreetName(street);
    setShowSuggestions(false);
    setStreetSuggestions([]);
    
    // Auto-check Roberts Estate checkbox
    setIsRobertsEstate(true);
    setAutoDetectedRoberts(true);
    setValidationMessage(`✓ Roberts Estate detected: ${street}`);
  };

  // Keyboard navigation for autocomplete
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || streetSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < streetSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectStreet(streetSuggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Auto-detect Roberts Estate when street name changes
  useEffect(() => {
    if (streetName) {
      const validation = validateAddressForRobertsEstate(streetName);
      
      if (validation.isRobertsEstate) {
        setIsRobertsEstate(true);
        setAutoDetectedRoberts(true);
        setValidationMessage(`✓ Roberts Estate detected: ${validation.matchedStreet || streetName}`);
      } else {
        // Only reset if it was auto-detected (don't override manual selection)
        setAutoDetectedRoberts(false);
        setValidationMessage(null);
      }
    } else {
      // Clear when street name is empty
      setValidationMessage(null);
    }
    // Only depend on streetName - don't include state we're updating!
  }, [streetName]);

  // Update validated address whenever fields change
  useEffect(() => {
    if (streetName && unitNumber) {
      const validateAddress = async () => {
        const fullAddress = `${unitNumber} ${streetName}`;
        const result = await addressValidation.validateManualAddress({
          streetAddress: fullAddress,
          suburb: 'Roberts Estate',
          unitNumber,
          postalCode,
          city,
          province,
          country: 'South Africa'
        });

        if (result.success && result.address) {
          const updatedAddress: ValidatedAddress = {
            ...result.address,
            streetAddress: fullAddress,
            deliveryZone: isRobertsEstate ? 'roberts_estate' : 'middleburg',
            deliveryFee: isRobertsEstate ? 10 : 30,
            isDeliveryAvailable: true,
            isAddressVerified: false,
            confidenceScore: isRobertsEstate ? 0.9 : 0.5,
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
  }, [unitNumber, streetName, postalCode, city, province, isRobertsEstate, onChange]);

  return (
    <div className="space-y-4">
      {/* Unit/House Number */}
      <div>
        <Label htmlFor="unit-number" className="text-white mb-2 block">
          Unit / House Number {required && <span className="text-red-400">*</span>}
        </Label>
        <Input
          id="unit-number"
          value={unitNumber}
          onChange={(e) => setUnitNumber(e.target.value)}
          placeholder="e.g., 123, 45A, Unit 12"
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          required={required}
        />
      </div>

      {/* Street Name with Autocomplete */}
      <div className="relative">
        <Label htmlFor="street-name" className="text-white mb-2 block">
          Street Name {required && <span className="text-red-400">*</span>}
        </Label>
        <Input
          id="street-name"
          ref={streetInputRef}
          value={streetName}
          onChange={(e) => handleStreetNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing street name..."
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          required={required}
          autoComplete="off"
        />
        
        {/* Autocomplete Dropdown */}
        {showSuggestions && streetSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-gray-800 border border-neonCyan/30 rounded-lg shadow-xl max-h-60 overflow-y-auto"
          >
            {streetSuggestions.map((street, index) => (
              <button
                key={street}
                type="button"
                onClick={() => handleSelectStreet(street)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 flex items-center gap-2 ${
                  index === selectedIndex ? 'bg-gray-700' : ''
                }`}
              >
                <MapPin className="h-4 w-4 text-neonCyan flex-shrink-0" />
                <span className="text-white text-sm">{street}</span>
              </button>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-400 mt-1">
          💡 Type to see Roberts Estate streets
        </p>
      </div>

      {/* City and Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-white mb-2 block">
            City
          </Label>
          <Input
            id="city"
            value={city}
            readOnly
            className="bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed"
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

      {/* Auto-detection Message */}
      {validationMessage && (
        <Alert className="border-green-600 bg-green-600/10">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200 text-sm">
            {validationMessage}
          </AlertDescription>
        </Alert>
      )}

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
            onCheckedChange={(checked) => {
              setIsRobertsEstate(checked as boolean);
              setAutoDetectedRoberts(false);
              setValidationMessage(null);
            }}
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
              {autoDetectedRoberts 
                ? 'Auto-detected based on your street name' 
                : 'Select your street from the dropdown above'}
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
