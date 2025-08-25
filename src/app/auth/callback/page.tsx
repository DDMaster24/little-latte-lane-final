'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type ConfirmationState = 'loading' | 'success' | 'error' | 'expired';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ConfirmationState>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Handle auth callback from email link
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setState('error');
          setMessage(error.message || 'Authentication failed');
          return;
        }

        if (data.session) {
          setState('success');
          setMessage('Your email has been confirmed successfully!');
          
          // Redirect to account page after a short delay
          setTimeout(() => {
            router.push('/account?welcome=true');
          }, 2000);
        } else {
          // Check for specific error codes in URL
          const errorCode = searchParams.get('error_code');
          const errorDescription = searchParams.get('error_description');
          
          if (errorCode === 'email_not_confirmed') {
            setState('error');
            setMessage('Email confirmation failed. The link may have expired.');
          } else if (errorDescription) {
            setState('error');
            setMessage(errorDescription);
          } else {
            setState('expired');
            setMessage('The confirmation link has expired or is invalid.');
          }
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        setState('error');
        setMessage('An unexpected error occurred');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-neonCyan mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Confirming Your Email...
            </h2>
            <p className="text-gray-400">
              Please wait while we verify your account
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              🎉 Welcome to Little Latte Lane!
            </h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <p className="text-sm text-gray-400">
              Redirecting you to your account...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Confirmation Failed
            </h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                Return to Home
              </Button>
              <Button
                onClick={() => router.push('/auth/resend-confirmation')}
                variant="outline"
                className="w-full border-neonPink text-neonPink hover:bg-neonPink/10"
              >
                Resend Confirmation Email
              </Button>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Link Expired
            </h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/auth/resend-confirmation')}
                className="w-full bg-neonPink text-white hover:bg-neonPink/80"
              >
                Request New Confirmation Link
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-gray-400 text-gray-400 hover:bg-gray-400/10"
              >
                Back to Home
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-center">
            <div className="text-2xl mb-2">☕</div>
            <div className="bg-neon-gradient bg-clip-text text-transparent">
              Little Latte Lane
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
