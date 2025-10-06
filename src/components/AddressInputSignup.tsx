'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { type ValidatedAddress, detectDeliveryZone, buildFullAddress, validateAddress } from '@/types/address';
import { searchRobertsEstateStreets } from '@/lib/robertsEstateStreets';

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
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isRobertsEstate, setIsRobertsEstate] = useState(false);
  const [confirmMiddleburgDelivery, setConfirmMiddleburgDelivery] = useState(false);
  const [confirmDetection, setConfirmDetection] = useState(false);
  
  // Validation states
  const [cityValid, setCityValid] = useState<boolean | null>(null);
  const [postalCodeValid, setPostalCodeValid] = useState<boolean | null>(null);
  
  // Auto-detection state
  const [autoDetectedRobertsEstate, setAutoDetectedRobertsEstate] = useState<boolean | null>(null);
  
  // Autocomplete state
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const streetInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Fixed value
  const province = 'Mpumalanga';
  
  // Valid postal codes for Middleburg
  const VALID_POSTAL_CODES = ['1050', '1055', '1079', '1054'];

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

  // Validate city input
  const handleCityChange = (value: string) => {
    setCity(value);
    const normalized = value.trim().toLowerCase();
    // Accept both "Middleburg" and "Middelburg" (South African spelling)
    const isMiddleburg = normalized === 'middleburg' || normalized === 'middelburg';
    setCityValid(value.trim() === '' ? null : isMiddleburg);
  };

  // Validate postal code input
  const handlePostalCodeChange = (value: string) => {
    setPostalCode(value);
    const isValid = VALID_POSTAL_CODES.includes(value.trim());
    setPostalCodeValid(value.trim() === '' ? null : isValid);
  };

  // Extract potential unit number from street input (e.g., "11 Aristea Street" -> unit: "11", street: "Aristea Street")
  const parseStreetInput = (input: string): { unitNum: string; streetOnly: string } => {
    const trimmed = input.trim();
    // Match leading numbers/letters followed by space (e.g., "11 ", "45A ", "Unit 12 ")
    const match = trimmed.match(/^([\dA-Za-z]+)\s+(.+)$/);
    if (match) {
      return { unitNum: match[1], streetOnly: match[2] };
    }
    return { unitNum: '', streetOnly: trimmed };
  };

  // Handle street name input and show autocomplete
  const handleStreetNameChange = (value: string) => {
    setStreetName(value);
    
    // Parse input to extract potential unit number
    const { streetOnly } = parseStreetInput(value);
    
    // Search for matching streets using ONLY the street name part (ignore unit number)
    const matches = searchRobertsEstateStreets(streetOnly);
    setStreetSuggestions(matches);
    setShowSuggestions(matches.length > 0 && streetOnly.length >= 2);
    setSelectedIndex(-1);
    
    // Auto-detect ONLY if EXACT full street name matches (case-insensitive)
    // This prevents false positives like "Johannes Street" being detected as Roberts Estate
    const ROBERTS_ESTATE_STREETS = [
      'Sparaxis St', 'Aristea Cres', 'Clivia Cres', 'Amaryllis St',
      'Freesia Street', 'Hypoxis Street', 'Ixia Street', 'Lillium St',
      'Begonia St', 'Nerine Cres'
    ];
    
    const normalizedInput = streetOnly.trim().toLowerCase();
    const exactMatch = ROBERTS_ESTATE_STREETS.some(
      street => street.toLowerCase() === normalizedInput
    );
    
    if (normalizedInput.length >= 3) {
      setAutoDetectedRobertsEstate(exactMatch);
      if (exactMatch) {
        setIsRobertsEstate(true);
      } else {
        setIsRobertsEstate(false);
      }
    }
  };

  // Handle suggestion selection - auto-fill unit number if present
  const handleSelectStreet = (street: string) => {
    // Parse current input to extract unit number
    const { unitNum } = parseStreetInput(streetName);
    
    // If unit number was typed in street field, move it to unit field
    if (unitNum && !unitNumber) {
      setUnitNumber(unitNum);
    }
    
    // Set clean street name
    setStreetName(street);
    setShowSuggestions(false);
    setStreetSuggestions([]);
    
    // AUTO-FILL City and Postal Code for Roberts Estate
    setCity('Middelburg');
    setPostalCode('1050');
    setCityValid(true);
    setPostalCodeValid(true);
    
    // Confirm Roberts Estate detection
    setAutoDetectedRobertsEstate(true);
    setIsRobertsEstate(true);
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

  // No auto-detection - user must manually confirm Roberts Estate

  // Update validated address whenever fields change
  useEffect(() => {
    // Don't validate until all required fields are filled
    if (!streetName || !unitNumber || !city || !postalCode) {
      onChange(null);
      return;
    }

    // Only validate if city is Middleburg and postal code is valid
    if (!cityValid || !postalCodeValid) {
      onChange(null);
      return;
    }

    // Debounce to avoid excessive validation calls
    const timeoutId = setTimeout(() => {
      try {
        const fullAddress = `${unitNumber} ${streetName}`;
        const addressData = {
          streetAddress: fullAddress,
          suburb: isRobertsEstate ? 'Roberts Estate' : 'Middleburg',
          unitNumber,
          postalCode,
          city,
          province,
          country: 'South Africa'
        };

        // Validate required fields
        const validation = validateAddress(addressData);
        if (!validation.valid) {
          onChange(null);
          return;
        }

        // Build full address and detect delivery zone
        const fullAddressString = buildFullAddress(addressData);
        const { zone, fee, available } = detectDeliveryZone(addressData.suburb);

        const updatedAddress: ValidatedAddress = {
          ...addressData,
          deliveryZone: zone,
          deliveryFee: fee,
          isDeliveryAvailable: available,
          fullAddress: fullAddressString,
          coordinates: null,
          isAddressVerified: false,
          formattedAddress: fullAddressString
        };
        onChange(updatedAddress);
      } catch (error) {
        console.error('Address validation error:', error);
        onChange(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [unitNumber, streetName, postalCode, isRobertsEstate, city, province, onChange, cityValid, postalCodeValid]);

  return (
    <div className="space-y-4">
      {/* Unit/House Number */}
      <div className="max-w-[200px]">
        <Label htmlFor="unit-number" className="text-white mb-2 block">
          Unit / House Number {required && <span className="text-red-400">*</span>}
        </Label>
        <Input
          id="unit-number"
          value={unitNumber}
          onChange={(e) => setUnitNumber(e.target.value)}
          maxLength={6}
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
      </div>

      {/* City and Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Label htmlFor="city" className="text-white mb-2 block">
            City {required && <span className="text-red-400">*</span>}
          </Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            required={required}
          />
          {cityValid === true && (
            <CheckCircle className="absolute right-3 top-10 h-5 w-5 text-green-400" />
          )}
          {cityValid === false && (
            <div className="mt-1">
              <Alert className="border-red-600 bg-red-600/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200 text-xs">
                  Unfortunately we do not deliver outside of Middleburg
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="postal-code" className="text-white mb-2 block">
            Postal Code {required && <span className="text-red-400">*</span>}
          </Label>
          <Input
            id="postal-code"
            value={postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            required={required}
          />
          {postalCodeValid === true && (
            <CheckCircle className="absolute right-3 top-10 h-5 w-5 text-green-400" />
          )}
          {postalCodeValid === false && (
            <p className="text-xs text-red-400 mt-1">
              Invalid postal code. Valid codes: 1050, 1055, 1079, 1054
            </p>
          )}
        </div>
      </div>

      {/* Auto-Detection Panel */}
      {autoDetectedRobertsEstate !== null && streetName && (
        <Alert className={autoDetectedRobertsEstate ? "border-green-600 bg-green-600/10" : "border-orange-600 bg-orange-600/10"}>
          <CheckCircle className={`h-4 w-4 ${autoDetectedRobertsEstate ? 'text-green-400' : 'text-orange-400'}`} />
          <AlertDescription className={`${autoDetectedRobertsEstate ? 'text-green-200' : 'text-orange-200'} text-sm`}>
            {autoDetectedRobertsEstate 
              ? '✓ We have detected that you are a resident of Roberts Estate' 
              : '⚠ We have detected that you are not a resident of Roberts Estate'}
          </AlertDescription>
        </Alert>
      )}

      {/* Confirmation Checkboxes - Dynamic based on detection */}
      <div className="space-y-3 p-4 bg-gray-900/30 rounded-lg border border-gray-600">
        {autoDetectedRobertsEstate === true && (
          <>
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirm-detection"
                checked={confirmDetection}
                onCheckedChange={(checked) => setConfirmDetection(checked as boolean)}
                className="mt-1"
                required={required}
              />
              <label
                htmlFor="confirm-detection"
                className="text-sm text-gray-200 cursor-pointer flex-1"
              >
                I confirm the above information is correct {required && <span className="text-red-400">*</span>}
              </label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="roberts-estate-confirm"
                checked={isRobertsEstate}
                onCheckedChange={(checked) => setIsRobertsEstate(checked as boolean)}
                className="mt-1"
                required={required}
              />
              <label
                htmlFor="roberts-estate-confirm"
                className="text-sm text-gray-200 cursor-pointer flex-1"
              >
                My delivery address is inside Roberts Estate {required && <span className="text-red-400">*</span>}
              </label>
            </div>
          </>
        )}
        
        {autoDetectedRobertsEstate === false && (
          <>
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirm-detection"
                checked={confirmDetection}
                onCheckedChange={(checked) => setConfirmDetection(checked as boolean)}
                className="mt-1"
                required={required}
              />
              <label
                htmlFor="confirm-detection"
                className="text-sm text-gray-200 cursor-pointer flex-1"
              >
                I confirm the above information is correct {required && <span className="text-red-400">*</span>}
              </label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="middleburg-delivery"
                checked={confirmMiddleburgDelivery}
                onCheckedChange={(checked) => setConfirmMiddleburgDelivery(checked as boolean)}
                className="mt-1"
                required={required}
              />
              <label
                htmlFor="middleburg-delivery"
                className="text-sm text-gray-200 cursor-pointer flex-1"
              >
                I understand that Little Latte Lane only delivers inside of Middleburg {required && <span className="text-red-400">*</span>}
              </label>
            </div>
          </>
        )}
        
        {/* Fallback if no detection yet */}
        {autoDetectedRobertsEstate === null && (
          <div className="flex items-start gap-3">
            <Checkbox
              id="middleburg-delivery"
              checked={confirmMiddleburgDelivery}
              onCheckedChange={(checked) => setConfirmMiddleburgDelivery(checked as boolean)}
              className="mt-1"
              required={required}
            />
            <label
              htmlFor="middleburg-delivery"
              className="text-sm text-gray-200 cursor-pointer flex-1"
            >
              I understand that Little Latte Lane only delivers inside of Middleburg {required && <span className="text-red-400">*</span>}
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
