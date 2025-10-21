'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

type ConfirmationState = 'loading' | 'success' | 'error';

export default function ConfirmEmailPage() {
  const [state, setState] = useState<ConfirmationState>('loading');
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const confirmEmail = async () => {
      const userId = searchParams.get('token');
      const email = searchParams.get('email');

      if (!userId || !email) {
        setState('error');
        setError('Invalid confirmation link. Please check your email for the correct link.');
        return;
      }

      try {
        const response = await fetch('/api/auth/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, email }),
        });

        const result = await response.json();
        
        if (result.success) {
          setState('success');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth/login?confirmed=true');
          }, 3000);
        } else {
          setState('error');
          setError(result.error || 'Failed to confirm email');
        }
      } catch (err) {
        setState('error');
        setError('An unexpected error occurred. Please try again.');
        console.error('Confirmation error:', err);
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkBg via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/50 backdrop-blur-sm border border-neonCyan/20 rounded-2xl p-8 text-center">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent mb-2">
            ☕ Little Latte Lane
          </h1>
          <p className="text-gray-400 text-sm">EMAIL CONFIRMATION</p>
        </div>

        {/* Loading State */}
        {state === 'loading' && (
          <div className="space-y-6">
            <Loader2 className="w-16 h-16 text-neonCyan animate-spin mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Confirming Your Email...
              </h2>
              <p className="text-gray-400">
                Please wait while we verify your account.
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">
                🎉 Email Confirmed!
              </h2>
              <p className="text-gray-400 mb-4">
                Welcome to Little Latte Lane! Your account has been successfully verified.
              </p>
              <p className="text-sm text-neonCyan">
                Redirecting you to login in 3 seconds...
              </p>
            </div>
            <Button 
              onClick={() => router.push('/auth/login?confirmed=true')}
              className="w-full bg-gradient-to-r from-neonCyan to-neonPink text-black font-semibold hover:opacity-90 transition-opacity"
            >
              Continue to Login
            </Button>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="space-y-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Confirmation Failed
              </h2>
              <p className="text-gray-400 mb-4">
                {error}
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/auth/signup')}
                className="w-full bg-gradient-to-r from-neonCyan to-neonPink text-black font-semibold hover:opacity-90 transition-opacity"
              >
                Back to Sign Up
              </Button>
              <Button 
                onClick={() => router.push('/auth/login')}
                variant="outline"
                className="w-full border-neonCyan/50 text-neonCyan hover:bg-neonCyan/10"
              >
                Go to Login
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-gray-500 text-sm">
            Need help? Contact us at{' '}
            <a 
              href="mailto:admin@littlelattelane.co.za" 
              className="text-neonCyan hover:underline"
            >
              admin@littlelattelane.co.za
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
