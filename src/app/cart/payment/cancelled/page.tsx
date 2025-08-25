'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { MinusCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-darkBg/80 border-yellow-500/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Cancelled Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <MinusCircle className="w-10 h-10 text-yellow-400" />
              </div>
            </div>

            {/* Cancelled Message */}
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Payment Cancelled
              </h1>
              <p className="text-gray-300 text-sm">
                You cancelled the payment process. Your order is still waiting for payment.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Your Order</h3>
              <div className="text-gray-300 text-sm">
                <p>Your order has been saved and is waiting for payment.</p>
                <p className="mt-1">You can complete the payment anytime.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/cart')}
                className="w-full bg-gradient-to-r from-neonCyan to-neonPink hover:from-neonCyan/80 hover:to-neonPink/80 text-darkBg font-semibold"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Complete Payment
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-gray-500/50 text-gray-300 hover:bg-gray-500/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>

            {/* Order ID for reference */}
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
