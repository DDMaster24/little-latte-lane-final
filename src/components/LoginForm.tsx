'use client'; // Client-side for forms

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast'; // For feedback
import { Input } from '@/components/ui/input'; // Shadcn UI for inputs
import { Button } from '@/components/ui/button'; // Shadcn UI for buttons
import { Label } from '@/components/ui/label'; // Shadcn UI for labels
import { Eye, EyeOff, Loader2, Mail, RefreshCw } from 'lucide-react'; // For show/hide icons and loading
import { checkEmailExists } from '@/app/actions'; // For server action
import AddressInputSignup from '@/components/AddressInputSignup';
import OTPInput from '@/components/OTPInput';
import { type EnhancedAddress, validatedToEnhanced } from '@/lib/addressCompat';
import { type ValidatedAddress } from '@/types/address';
import { parseAddressString, serializeAddress } from '@/lib/addressUtils';

// Constants for security and timing
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MODAL_CLOSE_DELAY_MS = 500; // Delay before closing modal after login
const PASSWORD_MIN_LENGTH = 8;
const OTP_LENGTH = 6;
const OTP_RESEND_DELAY_MS = 60 * 1000; // 1 minute between resend attempts

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
  const [blockedUntil, setBlockedUntil] = useState(0); // Timestamp for block
  const [isCheckingEmail, setIsCheckingEmail] = useState(false); // Email verification loading state
  
  // OTP verification states
  const [isAwaitingOTP, setIsAwaitingOTP] = useState(false); // User needs to enter OTP
  const [otpCode, setOtpCode] = useState(''); // 6-digit OTP code
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false); // Verifying OTP loading state
  const [otpError, setOtpError] = useState(''); // OTP error message
  const [canResendOTP, setCanResendOTP] = useState(true); // Can user resend OTP
  const [resendCountdown, setResendCountdown] = useState(0); // Countdown timer for resend
  const [pendingEmail, setPendingEmail] = useState(''); // Store email for OTP verification

  async function handleContinue() {
    if (blockedUntil > Date.now()) {
      toast.error(
        'Too many failed attempts. Please try again later or reset your password.'
      );
      return;
    }
    
    setIsCheckingEmail(true);
    setEmailError('');
    
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const exists = await checkEmailExists(trimmedEmail);
      
      if (exists) {
        setStep('password');
      } else {
        setEmailError(
          'This email address is not registered. Please sign up for a new account.'
        );
      }
    } catch (error) {
      console.error('Error checking email:', error);
      toast.error('Failed to verify email. Please check your connection and try again.');
      setEmailError('Network error. Please try again.');
    } finally {
      setIsCheckingEmail(false);
    }
  }

  // Validate password strength (min 8 chars, 1 uppercase, 1 number, 1 special char)
  function validatePassword(pwd: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (pwd.length < PASSWORD_MIN_LENGTH) {
      errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
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
  
  // Validate email format (RFC 5322 compliant)
  function validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
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

  // Handle OTP verification
  async function handleVerifyOTP() {
    if (otpCode.length !== OTP_LENGTH) {
      setOtpError('Please enter the complete 6-digit code');
      toast.error('Please enter the complete verification code');
      return;
    }

    try {
      setIsVerifyingOTP(true);
      setOtpError('');

      // Verify the OTP code
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: otpCode,
        type: 'email'
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Email verified successfully! Logging you in...');
        
        // User is now logged in automatically after OTP verification
        // Wait a moment for auth state to update
        setTimeout(() => {
          setIsAwaitingOTP(false);
          setOtpCode('');
          setPendingEmail('');
          setIsModalOpen(false); // Close the modal
        }, MODAL_CLOSE_DELAY_MS);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid verification code';
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifyingOTP(false);
    }
  }

  // Handle resending OTP
  async function handleResendOTP() {
    if (!canResendOTP) {
      toast.error(`Please wait ${resendCountdown} seconds before requesting a new code`);
      return;
    }

    try {
      setIsLoading(true);
      setOtpError('');

      // Resend OTP using Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
      });

      if (error) throw error;

      toast.success('Verification code resent! Please check your email.');
      
      // Start resend cooldown
      setCanResendOTP(false);
      setResendCountdown(OTP_RESEND_DELAY_MS / 1000);
      
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResendOTP(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend code';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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
      try {
        setIsLoading(true);
        const trimmedEmail = email.trim().toLowerCase();
        const emailExists = await checkEmailExists(trimmedEmail);
        if (emailExists) {
          setEmailError('This email is already registered');
          toast.error('This email is already registered. Please login instead.');
          return;
        }
      } catch (error) {
        console.error('Error checking email:', error);
        toast.error('Failed to verify email. Please try again.');
        return;
      } finally {
        setIsLoading(false);
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
            emailRedirectTo: undefined, // Disable email redirect - we're using OTP
            data: signupMetadata,
          },
        });

        if (authError) {
          throw authError;
        }

        console.log('✅ User account created:', authData.user?.id);
        console.log('📋 User metadata saved:', authData.user?.user_metadata);

        // Database trigger 'handle_new_user()' automatically creates the profile
        // The AuthProvider will fetch it once the user verifies OTP and logs in
        // No manual profile creation needed here - prevents race conditions
        
        // Switch to OTP verification mode
        setPendingEmail(trimmedEmail);
        setIsAwaitingOTP(true);
        setOtpCode('');
        setCanResendOTP(true);
        setResendCountdown(0);
        
        toast.success('Verification code sent! Please check your email and enter the 6-digit code below.');
        
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
        }, MODAL_CLOSE_DELAY_MS);
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
        if (attempts + 1 >= MAX_LOGIN_ATTEMPTS) {
          setBlockedUntil(Date.now() + LOCKOUT_DURATION_MS);
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
        }, MODAL_CLOSE_DELAY_MS);
      }
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error('Please enter your email first.');
      return;
    }
    
    try {
      setIsLoading(true);
      const trimmedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
      
      if (error) {
        toast.error(error.message || 'Failed to send reset email.');
      } else {
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
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
      {/* OTP Verification Screen */}
      {isAwaitingOTP ? (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-neonCyan to-neonPink rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-400 mb-1">
              We sent a 6-digit verification code to:
            </p>
            <p className="text-white font-medium mb-4">{pendingEmail}</p>
            <p className="text-sm text-gray-500">
              Enter the code below to verify your email and complete signup
            </p>
          </div>

          <div>
            <Label htmlFor="otp" className="text-center block mb-3">
              Verification Code
            </Label>
            <OTPInput
              value={otpCode}
              onChange={setOtpCode}
              disabled={isVerifyingOTP}
              autoFocus
            />
            {otpError && (
              <p role="alert" className="text-sm text-red-500 mt-3 text-center">
                {otpError}
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={handleVerifyOTP}
            disabled={isVerifyingOTP || otpCode.length !== OTP_LENGTH}
            className="w-full neon-button"
          >
            {isVerifyingOTP ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Didn&apos;t receive the code?
            </p>
            <Button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResendOTP || isLoading}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              {!canResendOTP ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend in {resendCountdown}s
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsAwaitingOTP(false);
                setOtpCode('');
                setPendingEmail('');
                setOtpError('');
                toast('Verification cancelled. You can try signing up again.');
              }}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Cancel and go back
            </Button>
          </div>
        </div>
      ) : isSignup && signupStep === 1 && (
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
              disabled={isLoading}
              aria-invalid={!!usernameError}
              aria-describedby={usernameError ? 'username-error' : undefined}
              className={`hover:shadow-[0_0_5px_rgba(255,165,0,0.5)] ${usernameError ? 'border-red-500' : 'border-neonCyan'}`}
              required
            />
            {usernameError && (
              <p id="username-error" role="alert" className="text-sm text-red-500 mt-1 shadow-[0_0_5px_rgba(255,0,0,0.5)]">
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
              disabled={isLoading}
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? 'phone-error' : undefined}
              className={`hover:shadow-[0_0_5px_rgba(255,165,0,0.5)] ${phoneError ? 'border-red-500' : 'border-neonCyan'}`}
              required
            />
            {phoneError && (
              <p id="phone-error" role="alert" className="text-sm text-red-500 mt-1 shadow-[0_0_5px_rgba(255,0,0,0.5)]">
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
            disabled={isCheckingEmail || isLoading}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-error' : undefined}
            className={`hover:shadow-[0_0_5px_rgba(255,165,0,0.5)] ${emailError ? 'border-red-500' : 'border-neonCyan'}`}
          />
          {emailError && (
            <p id="email-error" role="alert" className="text-sm text-red-500 mt-1 shadow-[0_0_5px_rgba(255,0,0,0.5)]">
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
              disabled={isLoading}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className={`hover:shadow-[0_0_5px_rgba(255,165,0,0.5)] pr-10 ${passwordError ? 'border-red-500' : 'border-neonCyan'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neonText"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && (
            <div>
              <p id="password-error" role="alert" className="text-sm text-red-500 mt-1 shadow-[0_0_5px_rgba(255,0,0,0.5)]">
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
        <Button type="submit" className="neon-button w-full" disabled={isLoading || isCheckingEmail}>
          {(isLoading || isCheckingEmail) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCheckingEmail
            ? 'Checking email...'
            : isLoading
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
