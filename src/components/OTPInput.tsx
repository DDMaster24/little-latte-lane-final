'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = true,
  className
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Sync internal state with external value
  useEffect(() => {
    if (value.length <= length) {
      const newOtp = value.split('');
      while (newOtp.length < length) {
        newOtp.push('');
      }
      setOtp(newOtp);
    }
  }, [value, length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    const sanitizedDigit = digit.replace(/[^0-9]/g, '');
    
    if (sanitizedDigit.length > 1) {
      // Handle paste of multiple digits
      handlePaste(index, sanitizedDigit);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = sanitizedDigit;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Auto-focus next input
    if (sanitizedDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otp[index]) {
        // Clear current digit
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    // Handle delete key
    if (e.key === 'Delete') {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
    }
  };

  const handlePaste = (startIndex: number, pastedData: string) => {
    const digits = pastedData.replace(/[^0-9]/g, '').split('');
    const newOtp = [...otp];
    
    let currentIndex = startIndex;
    for (const digit of digits) {
      if (currentIndex >= length) break;
      newOtp[currentIndex] = digit;
      currentIndex++;
    }
    
    setOtp(newOtp);
    onChange(newOtp.join(''));
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newOtp.findIndex((d, i) => i >= startIndex && !d);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(currentIndex, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handlePasteEvent = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePaste(index, pastedData);
  };

  const handleFocus = (index: number) => {
    // Select text on focus for easier editing
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePasteEvent(index, e)}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-bold',
            'bg-gray-800/50 border-2 border-gray-700/50',
            'text-white placeholder:text-gray-500',
            'focus:border-neonCyan focus:ring-2 focus:ring-neonCyan/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            digit && 'border-neonCyan/50 bg-gray-800/70'
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
