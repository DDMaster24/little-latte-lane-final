'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';

export default function ConfirmSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    // Get email from URL params if available
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-center">
            <div className="text-3xl mb-2">☕</div>
            <div className="bg-neon-gradient bg-clip-text text-transparent text-2xl">
              Little Latte Lane
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="relative mb-6">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <Mail className="h-8 w-8 text-neonCyan absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-1" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              🎉 Check Your Email!
            </h2>
            
            <div className="bg-gray-700/50 border border-neonCyan/30 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                We&apos;ve sent a <strong className="text-neonCyan">gorgeous welcome email</strong> to:
              </p>
              {email && (
                <p className="text-white font-semibold mt-2 break-all">
                  {email}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-3">
                Click the confirmation link in the email to activate your account and start ordering!
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/ordering')}
                className="w-full bg-neonCyan text-black hover:bg-neonCyan/80 font-semibold"
              >
                Browse Menu While You Wait
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-gray-400 text-gray-400 hover:bg-gray-400/10"
              >
                Back to Home
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-600">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong>Didn&apos;t get the email?</strong><br/>
                Check your spam folder or contact us at{' '}
                <span className="text-neonPink">admin@littlelattelane.co.za</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
