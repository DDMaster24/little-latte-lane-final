'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    if (orderId) {
      // Generate a shorter order number for display
      setOrderNumber(orderId.slice(-8).toUpperCase());
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-darkBg/80 border-neonCyan/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>

            {/* Success Message */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-300 text-sm">
                Your order has been confirmed and payment processed successfully.
              </p>
            </div>

            {/* Order Details */}
            {orderNumber && (
              <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-4">
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
            <div className="bg-neonPink/10 border border-neonPink/30 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">What&apos;s Next?</h3>
              <div className="text-gray-300 text-sm space-y-1">
                <p>• You&apos;ll receive an email confirmation shortly</p>
                <p>• We&apos;ll notify you when your order is ready</p>
                <p>• Estimated preparation time: 15-20 minutes</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-neonCyan to-neonPink hover:from-neonCyan/80 hover:to-neonPink/80 text-darkBg font-semibold"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
              
              <Button
                onClick={() => router.push('/account')}
                variant="outline"
                className="w-full border-neonCyan/50 text-neonCyan hover:bg-neonCyan/10"
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
