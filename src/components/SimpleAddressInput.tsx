'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle } from 'lucide-react';

// Roberts Estate street names for validation
const ROBERTS_ESTATE_STREETS = [
  'Boekenhout Street',
  'Camelthorn Street',
  'Fever Tree Street',
  'Jackalberry Street',
  'Marula Street',
  'Tamboti Street',
  'Weeping Boer Bean Street',
  'Wild Olive Street',
  'Boekenhout',
  'Camelthorn',
  'Fever Tree',
  'Jackalberry',
  'Marula',
  'Tamboti',
  'Weeping Boer Bean',
  'Wild Olive',
];

interface SimpleAddressInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  onBlur?: () => void;
  required?: boolean;
  touched?: boolean;
}

export default function SimpleAddressInput({
  value,
  onChange,
  onBlur,
  required = false,
  touched = false,
}: SimpleAddressInputProps) {
  const [isValidating, setIsValidating] = useState(false);

  const validateRobertsEstate = (address: string): boolean => {
    if (!address || address.trim().length === 0) return false;

    const lowerAddress = address.toLowerCase();

    // Check if any Roberts Estate street name is mentioned
    return ROBERTS_ESTATE_STREETS.some(street =>
      lowerAddress.includes(street.toLowerCase())
    );
  };

  const isValid = validateRobertsEstate(value);
  const showValidation = touched && value.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const valid = validateRobertsEstate(newValue);
    onChange(newValue, valid);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        required={required}
        placeholder="e.g., 123 Marula Street"
        className={`bg-gray-700/80 text-white focus:border-neonCyan [color-scheme:dark] pr-10 ${
          showValidation
            ? isValid
              ? 'border-green-500'
              : 'border-red-500'
            : 'border-gray-600'
        }`}
      />
      {showValidation && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      )}
      <p className={`text-xs mt-1 ${
        showValidation
          ? isValid
            ? 'text-green-400'
            : 'text-red-400'
          : 'text-gray-400'
      }`}>
        {showValidation && !isValid
          ? 'Address must be in Roberts Estate (e.g., 123 Marula Street)'
          : 'Enter your unit number and street name in Roberts Estate'}
      </p>
    </div>
  );
}
