'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-darkBg/80 border-red-500/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-300 text-sm">
                We were unable to process your payment. Please try again or use a different payment method.
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Common Issues</h3>
              <div className="text-gray-300 text-sm space-y-1 text-left">
                <p>• Insufficient funds</p>
                <p>• Card expired or blocked</p>
                <p>• Network connection issues</p>
                <p>• Bank security restrictions</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/cart')}
                className="w-full bg-gradient-to-r from-neonCyan to-neonPink hover:from-neonCyan/80 hover:to-neonPink/80 text-darkBg font-semibold"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Try Payment Again
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-gray-500/50 text-gray-300 hover:bg-gray-500/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </div>

            {/* Order ID for support */}
            {orderId && (
              <div className="text-xs text-gray-500">
                Order ID: {orderId.slice(-8).toUpperCase()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
