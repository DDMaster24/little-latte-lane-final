'use client'; // Client-side for forms

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import toast from 'react-hot-toast'; // For feedback
import { Input } from '@/components/ui/input'; // Shadcn UI for inputs
import { Button } from '@/components/ui/button'; // Shadcn UI for buttons
import { Label } from '@/components/ui/label'; // Shadcn UI for labels
import { Eye, EyeOff } from 'lucide-react'; // For show/hide icons
import { checkEmailExists } from '@/app/actions'; // For server action

interface LoginFormProps {
  setIsModalOpen: (open: boolean) => void; // Prop to close modal on success
}

export default function LoginForm({ setIsModalOpen }: LoginFormProps) {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Optional username for signup
  const [phone, setPhone] = useState(''); // Phone number for signup
  const [address, setAddress] = useState(''); // Optional address for signup
  const [isSignup, setIsSignup] = useState(false); // Toggle between login/signup
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false); // For toggle
  const [step, setStep] = useState('email'); // 'email' or 'password' for login; signup shows all
  const [emailError, setEmailError] = useState(''); // For email errors
  const [passwordError, setPasswordError] = useState(''); // For password errors
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blockedUntil > Date.now()) {
      toast.error(
        'Too many failed attempts. Please try again later or reset your password.'
      );
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
        
        // Step 1: Create the user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: username.trim() || null,
              phone: phone.trim() || null,
              address: address.trim() || null,
            },
          },
        });

        if (authError) {
          throw authError;
        }

        console.log('✅ User account created:', authData.user?.id);

        // Step 2: If user is created, manually create profile (in case trigger fails)
        if (authData.user && authData.user.id) {
          // Wait a moment for auth to settle
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: authData.user.email,
                full_name: username.trim() || null,
                phone: phone.trim() || null,
                address: address.trim() || null,
              });

            if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
              console.warn('⚠️ Profile creation warning:', profileError);
            } else {
              console.log('✅ Profile created successfully');
            }
          } catch (profileErr) {
            console.warn('⚠️ Profile creation failed, but signup succeeded:', profileErr);
          }
        }

        toast.success('Signup successful! Please check your email to confirm your account.');
        setIsSignup(false); // Switch to login mode
        setStep('email'); // Reset to email for login
        
        // Clear form fields
        setUsername('');
        setPhone('');
        setAddress('');
        
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
        isSignup
          ? handleSubmit
          : step === 'password'
            ? handleSubmit
            : (e) => {
                e.preventDefault();
                handleContinue();
              }
      }
      className="space-y-4"
      autoComplete="off"
    >
      {isSignup && (
        <>
          <div>
            <Label htmlFor="username">Full Name</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-neonCyan hover:shadow-[0_0_5px_rgba(255,165,0,0.5)]"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-neonCyan hover:shadow-[0_0_5px_rgba(255,165,0,0.5)]"
              placeholder="+27123456789"
            />
          </div>
          <div>
            <Label htmlFor="address">Address for Delivery</Label>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border-neonCyan hover:shadow-[0_0_5px_rgba(255,165,0,0.5)]"
              placeholder="Enter your delivery address"
              autoComplete="off"
            />
          </div>
        </>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-neonCyan hover:shadow-[0_0_5px_rgba(255,165,0,0.5)]"
        />
        {emailError && (
          <p className="text-sm text-red-500 mt-1 shadow-[0_0_5px_rgba(255,0,0,0.5)]">
            {emailError}
          </p>
        )}
      </div>
      {(step === 'password' || isSignup) && (
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-neonCyan hover:shadow-[0_0_5px_rgba(255,165,0,0.5)] pr-10"
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
              <Button
                type="button"
                onClick={handleForgotPassword}
                variant="link"
                className="text-neonText underline p-0"
              >
                Forgot Password?
              </Button>
            </div>
          )}
        </div>
      )}
      <Button type="submit" className="neon-button w-full" disabled={isLoading}>
        {isLoading
          ? 'Loading...'
          : isSignup
            ? 'Signup'
            : step === 'email'
              ? 'Continue'
              : 'Login'}
      </Button>
      <Button
        type="button"
        onClick={() => {
          setIsSignup(!isSignup);
          setStep('email'); // Reset step for toggle
          setEmailError('');
          setPasswordError('');
          // Clear signup form fields when switching modes
          setUsername('');
          setPhone('');
          setAddress('');
        }}
        variant="link"
        className="w-full text-neonText"
      >
        {isSignup ? 'Already have an account? Login' : 'No account? Signup'}
      </Button>
    </form>
  );
}
