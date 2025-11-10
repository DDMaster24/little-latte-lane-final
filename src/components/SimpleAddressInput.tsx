'use client';

import { Input } from '@/components/ui/input';

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
}: SimpleAddressInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Always return true - no validation, trust the user
    onChange(newValue, true);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        required={required}
        className="bg-gray-700/80 text-white focus:border-neonCyan [color-scheme:dark] border-gray-600"
      />
      <p className="text-xs mt-1 text-gray-400">
        Enter your unit number and street name in Roberts Estate
      </p>
    </div>
  );
}
