'use client'; // Client-side for forms

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast'; // For feedback
import { Input } from '@/components/ui/input'; // Shadcn UI for inputs
import { Button } from '@/components/ui/button'; // Shadcn UI for buttons
import { Label } from '@/components/ui/label'; // Shadcn UI for labels
import { Eye, EyeOff } from 'lucide-react'; // For show/hide icons
import { checkEmailExists } from '@/app/actions'; // For server action
import AddressInputSignup from '@/components/AddressInputSignup';
import { type EnhancedAddress, validatedToEnhanced } from '@/lib/addressCompat';
import { type ValidatedAddress } from '@/types/address';
import { parseAddressString, serializeAddress } from '@/lib/addressUtils';

interface LoginFormProps {
  setIsModalOpen: (open: boolean) => void; // Prop to close modal on success
}

export default function LoginForm({ setIsModalOpen }: LoginFormProps) {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Optional username for signup
  const [phone, setPhone] = useState(''); // Phone number for signup
  const [address, setAddress] = useState<EnhancedAddress>(parseAddressString(null)); // Enhanced address for signup
  const [validatedAddress, setValidatedAddress] = useState<ValidatedAddress | null>(null); // New validated address system
  const [isSignup, setIsSignup] = useState(false); // Toggle between login/signup
  const [signupStep, setSignupStep] = useState<1 | 2>(1); // Two-step signup: 1=personal details, 2=address
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false); // For toggle
  const [step, setStep] = useState('email'); // 'email' or 'password' for login; signup shows all
  const [emailError, setEmailError] = useState(''); // For email errors
  const [passwordError, setPasswordError] = useState(''); // For password errors
  const [usernameError, setUsernameError] = useState(''); // For username errors
  const [phoneError, setPhoneError] = useState(''); // For phone errors
  const [attempts, setAttempts] = useState(0); // Track attempts
  const maxAttempts = 5;
  const blockTime = 5 * 60 * 1000; // 5 min in ms
  const [blockedUntil, setBlockedUntil] = useState(0); // Timestamp for block

  async function handleContinue() {
    if (blockedUntil > Date.now()) {
      toast.error(
        'Too many failed attempts. Please try again later or reset your password.'
      );
      return;
    }
    setIsLoading(true);
    setEmailError('');
    const trimmedEmail = email.trim().toLowerCase();
    const exists = await checkEmailExists(trimmedEmail);
    setIsLoading(false);
    if (exists) {
      setStep('password');
    } else {
      setEmailError(
        'This email address is not registered. Please sign up for a new account.'
      );
    }
  }

  // Validate password strength (min 8 chars, 1 uppercase, 1 number, 1 special char)
  function validatePassword(pwd: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('One uppercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('One number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('One special character (!@#$%^&*)');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  // Validate email format
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Validate South African phone number (10 digits starting with 0)
  function validatePhoneNumber(phoneNum: string): boolean {
    const cleaned = phoneNum.replace(/\s+/g, '').replace(/^\+27/, '0');
    const phoneRegex = /^0\d{9}$/; // 0 followed by 9 digits
    return phoneRegex.test(cleaned);
  }
  
  // Real-time validation on blur
  function handlePasswordBlur() {
    if (password) {
      const validation = validatePassword(password);
      if (!validation.valid) {
        setPasswordError(validation.errors.join(', '));
      } else {
        setPasswordError('');
      }
    }
  }
  
  function handleEmailBlur() {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }
  
  function handleUsernameBlur() {
    if (!username.trim()) {
      setUsernameError('Full name is required');
    } else {
      setUsernameError('');
    }
  }
  
  function handlePhoneBlur() {
    if (phone && !validatePhoneNumber(phone)) {
      setPhoneError('Enter valid SA number (e.g., 0123456789)');
    } else if (!phone.trim()) {
      setPhoneError('Phone number is required');
    } else {
      setPhoneError('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blockedUntil > Date.now()) {
      toast.error(
        'Too many failed attempts. Please try again later or reset your password.'
      );
      return;
    }
    
    // Comprehensive validation for signup Step 1
    if (isSignup && signupStep === 1) {
      // Validate all required fields
      if (!username.trim()) {
        setUsernameError('Full name is required');
        toast.error('Please enter your full name');
        return;
      }
      
      if (!phone.trim()) {
        setPhoneError('Phone number is required');
        toast.error('Please enter your phone number');
        return;
      }
      
      if (!validatePhoneNumber(phone)) {
        setPhoneError('Enter valid SA number (e.g., 0123456789)');
        toast.error('Please enter a valid South African phone number');
        return;
      }
      
      if (!email.trim()) {
        setEmailError('Email is required');
        toast.error('Please enter your email address');
        return;
      }
      
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        toast.error('Please enter a valid email address');
        return;
      }
      
      if (!password) {
        setPasswordError('Password is required');
        toast.error('Please enter a password');
        return;
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setPasswordError(passwordValidation.errors.join(', '));
        toast.error('Password must be stronger: ' + passwordValidation.errors.join(', '));
        return;
      }
      
      // Check if email already exists
      const trimmedEmail = email.trim().toLowerCase();
      const emailExists = await checkEmailExists(trimmedEmail);
      if (emailExists) {
        setEmailError('This email is already registered');
        toast.error('This email is already registered. Please login instead.');
        return;
      }
      
      // All validation passed - proceed to step 2
      setSignupStep(2);
      return;
    }
    
    setIsLoading(true);
    setPasswordError('');
    const trimmedEmail = email.trim().toLowerCase();
    let error;
    
    if (isSignup) {
      // Enhanced signup with profile creation
      try {
        console.log('🔄 Starting signup process...');
        
        // Step 1: Create the user account with enhanced metadata
        const signupMetadata = {
          full_name: username.trim() || null,
          phone: phone.trim() || null,
          address: serializeAddress(address) || null,
        };
        
        console.log('📋 Signup metadata being sent:', signupMetadata);
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: signupMetadata,
          },
        });

        if (authError) {
          throw authError;
        }

        console.log('✅ User account created:', authData.user?.id);
        console.log('📋 User metadata saved:', authData.user?.user_metadata);

        // Database trigger 'handle_new_user()' automatically creates the profile
        // The AuthProvider will fetch it once the user confirms their email and logs in
        // No manual profile creation needed here - prevents race conditions
        
        toast.success('Signup successful! Please check your email to confirm your account.');
        setIsSignup(false); // Switch to login mode
        setSignupStep(1); // Reset to step 1
        setStep('email'); // Reset to email for login
        
        // Clear form fields
        setUsername('');
        setPhone('');
        setAddress(parseAddressString(null));
        setValidatedAddress(null);
        
      } catch (signupError) {
        console.error('❌ Signup failed:', signupError);
        error = signupError;
      }
    } else {
      ({ error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      }));
      if (!error) {
        toast.success('Login successful!');
        // Add a small delay to allow auth state to update
        setTimeout(() => {
          setIsModalOpen(false); // Close modal
        }, 500);
      }
    }
    setIsLoading(false);
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Invalid login credentials')) {
        setPasswordError(
          'Incorrect password. Please try again or reset your password.'
        );
        setAttempts(attempts + 1);
        if (attempts + 1 >= maxAttempts) {
          setBlockedUntil(Date.now() + blockTime);
          toast.error(
            'Too many failed attempts. Please try again later or reset your password.'
          );
        }
      } else {
        toast.error(errorMessage || 'An error occurred. Please try again.');
      }
    } else {
      setAttempts(0); // Reset on success
      if (!isSignup) {
        // Add a small delay to allow auth state to update before closing modal
        setTimeout(() => {
          setIsModalOpen(false);
        }, 500);
      }
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error('Please enter your email first.');
      return;
    }
    const trimmedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
    if (error) {
      toast.error(error.message || 'Failed to send reset email.');
    } else {
      toast.success('Password reset email sent! Check your inbox.');
    }
  }

  return (
    <form
      onSubmit={
        isSignup && signupStep === 1
          ? (e) => {
              e.preventDefault();
              // Validate step 1 fields
              if (!username.trim() || !phone.trim() || !email.trim() || !password.trim()) {
                toast.error('Please fill in all required fields');
                return;
              }
              setSignupStep(2); // Move to address step
            }
          : isSignup && signupStep === 2
            ? handleSubmit // Complete signup
            : step === 'password'
              ? handleSubmit // Login with password
              : (e) => {
                  e.preventDefault();
                  handleContinue(); // Check email exists
                }
      }
      className="space-y-4"
      autoComplete="off"
    >
      {isSignup && signupStep === 1 && (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-4">
              📝 Step 1 of 2: Personal Details
            </p>
          </div>
          <div>
            <Label htmlFor="username">Full Name</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={handleUsernameBlur}
              className={`hover:shadow-[0_0_5px_rgba(255,165,0,0.5)] ${usernameError ? 'border-red-500' : 'border-neonCyan'}`}
              required
            />
            {usernameError && (
              <p className="text-sm text-red-500 mt-1 shadow-[0_0_5px_rgba(255,0,0,0.5)]">
                {usernameError}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={handlePhoneBlur}
              className={`hover:shadow-[0_0_5px_rgba(255,165,0,0.5)] ${phoneError ? 'border-red-500' : 'border-neonCyan'}`}
              required
            />
            {phoneError && (
              <p className="text-sm text-red-500 mt-1 shadow-[0_0_5px_rgba(255,0,0,0.5)]">
                {phoneError}
              </p>
            )}
          </div>
        </>
      )}
      {isSignup && signupStep === 2 && (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-200 font-medium mb-2">
              📍 Step 2 of 2: Delivery Address (Optional)
            </p>
            <p className="text-xs text-gray-400">
              You can skip this and add your address later in your profile
            </p>
          </div>
          <div>
            <AddressInputSignup
              address={validatedAddress}
              onChange={(newValidatedAddress) => {
                setValidatedAddress(newValidatedAddress);
                if (newValidatedAddress) {
                  setAddress(validatedToEnhanced(newValidatedAddress));
                }
              }}
              required={false}
            />
          </div>
        </>
      )}
      {(!isSignup || signupStep === 1) && (
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            required
            className={`hover:shadow-[0_0_5px_rgba(255,165,0,0.5)] ${emailError ? 'border-red-500' : 'border-neonCyan'}`}
          />
          {emailError && (
            <p className="text-sm text-red-500 mt-1 shadow-[0_0_5px_rgba(255,0,0,0.5)]">
              {emailError}
            </p>
          )}
        </div>
      )}
      {(step === 'password' || (isSignup && signupStep === 1)) && (
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              required
              className={`hover:shadow-[0_0_5px_rgba(255,165,0,0.5)] pr-10 ${passwordError ? 'border-red-500' : 'border-neonCyan'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neonText"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && (
            <div>
              <p className="text-sm text-red-500 mt-1 shadow-[0_0_5px_rgba(255,0,0,0.5)]">
                {passwordError}
              </p>
              {isSignup && passwordError.includes('requirement') && (
                <ul className="text-xs text-gray-400 mt-2 ml-4 list-disc">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter (A-Z)</li>
                  <li>One number (0-9)</li>
                  <li>One special character (!@#$%^&*)</li>
                </ul>
              )}
              {!isSignup && (
                <Button
                  type="button"
                  onClick={handleForgotPassword}
                  variant="link"
                  className="text-neonText underline p-0"
                >
                  Forgot Password?
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      {/* Step navigation buttons for signup */}
      {isSignup && signupStep === 2 && (
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleSubmit}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={isLoading}
          >
            Skip for Now
          </Button>
          <Button
            type="submit"
            className="neon-button flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Complete Signup'}
          </Button>
        </div>
      )}
      
      {/* Primary button for step 1 and login */}
      {(!isSignup || signupStep === 1) && (
        <Button type="submit" className="neon-button w-full" disabled={isLoading}>
          {isLoading
            ? 'Loading...'
            : isSignup && signupStep === 1
              ? 'Continue to Address'
              : step === 'email'
                ? 'Continue'
                : 'Login'}
        </Button>
      )}
      
      {/* Back button for step 2 */}
      {isSignup && signupStep === 2 && (
        <Button
          type="button"
          onClick={() => setSignupStep(1)}
          variant="link"
          className="w-full text-gray-400 hover:text-neonCyan"
        >
          ← Back to Personal Details
        </Button>
      )}
      
      {/* Toggle between login and signup - only show on step 1 */}
      {(!isSignup || signupStep === 1) && (
        <Button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setSignupStep(1); // Reset to step 1 when toggling
            setStep('email');
            setEmailError('');
            setPasswordError('');
          }}
          variant="outline"
          className="w-full border-neonText text-neonText"
        >
          {isSignup ? 'Already have an account? Login' : 'Don\'t have an account? Signup'}
        </Button>
      )}
    </form>
  );
}
