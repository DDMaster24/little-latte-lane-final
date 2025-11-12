'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, Receipt, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (orderId) {
      // Generate a shorter order number for display
      setOrderNumber(orderId.slice(-8).toUpperCase());
    }
    
    // Simulate loading and show celebration animation
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setShowCelebration(true);
      
      // Hide celebration after 2 seconds
      const celebrationTimer = setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
      
      return () => clearTimeout(celebrationTimer);
    }, 1500);

    return () => clearTimeout(loadingTimer);
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-darkBg/80 border-neonCyan/30 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-neonCyan/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-neonCyan animate-spin" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Processing Payment...
                </h1>
                <p className="text-gray-300 text-sm">
                  Please wait while we confirm your payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Celebration particles */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className={`absolute w-4 h-4 text-neonCyan animate-bounce opacity-70`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}
      
      <Card className={`w-full max-w-md bg-darkBg/80 border-neonCyan/30 backdrop-blur-md transition-all duration-1000 ${
        showCelebration ? 'scale-105 border-green-400/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : ''
      }`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className={`w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center transition-all duration-1000 ${
                showCelebration ? 'bg-green-500/40 scale-110' : ''
              }`}>
                <CheckCircle className={`w-10 h-10 text-green-400 transition-all duration-1000 ${
                  showCelebration ? 'scale-125' : ''
                }`} />
              </div>
            </div>

            {/* Success Message */}
            <div className="animate-slide-up">
              <h1 className="text-2xl font-bold text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-300 text-sm">
                Your order has been confirmed and payment processed successfully.
              </p>
            </div>

            {/* Order Details */}
            {orderNumber && (
              <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-4 animate-slide-up">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Receipt className="w-5 h-5 text-neonCyan" />
                  <span className="text-white font-semibold">Order Number</span>
                </div>
                <div className="text-neonCyan text-xl font-mono font-bold">
                  #{orderNumber}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-neonPink/10 border border-neonPink/30 rounded-lg p-4 animate-slide-up">
              <h3 className="text-white font-semibold mb-2">What&apos;s Next?</h3>
              <div className="text-gray-300 text-sm space-y-1">
                <p>• You&apos;ll receive an email confirmation shortly</p>
                <p>• We&apos;ll notify you when your order is ready</p>
                <p>• Estimated preparation time: 15-20 minutes</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 animate-slide-up">
              <Button
                onClick={() => router.push('/')}
                className="w-full btn-primary"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
              
              <Button
                onClick={() => router.push('/account')}
                variant="outline"
                className="w-full btn-secondary"
              >
                View Order History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
