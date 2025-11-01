'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { openPaymentUrl, isNativeApp } from '@/lib/capacitor-browser';

interface YocoPaymentProps {
  orderId: string;
  userId: string;
  amount: number;
  itemName: string;
  itemDescription: string;
  userDetails: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    deliveryType: string;
    deliveryAddress?: string;
  };
  onPaymentInitiated: () => void;
}

export default function YocoPayment({
  orderId,
  userId,
  amount,
  itemName,
  itemDescription,
  userDetails,
  onPaymentInitiated,
}: YocoPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setLoadingStep('Creating secure payment session...');

      // Create checkout session with Yoco
      const response = await fetch('/api/yoco/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          userId,
          amount,
          itemName,
          itemDescription,
          userDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      if (!data.redirectUrl) {
        throw new Error('No redirect URL received from payment gateway');
      }

      setLoadingStep('Preparing payment gateway...');
      
      // Call the callback to clear cart and close sidebar
      onPaymentInitiated();

      // Set loading step based on device type (no toast - handled by onPaymentInitiated)
      if (isNativeApp()) {
        setLoadingStep('Opening secure payment window...');
      } else {
        setLoadingStep('Redirecting to payment gateway...');
      }

      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Open payment URL (uses Capacitor Browser plugin in native apps)
      await openPaymentUrl(data.redirectUrl);

    } catch (error) {
      console.error('Payment initiation failed:', error);
      setLoadingStep('');
      toast.error('Payment initialization failed', {
        description: error instanceof Error ? error.message : 'Failed to start payment process',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-neonCyan/20 to-neonPink/20 border border-neonCyan/40 rounded-lg p-4 backdrop-blur-md">
      <div className="space-y-4">
        {/* Payment Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-neonCyan/20 rounded-lg">
            <CreditCard className="w-5 h-5 text-neonCyan" />
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">
              Secure Payment
            </h3>
            <p className="text-gray-300 text-sm">
              Powered by Yoco
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-darkBg/30 border border-neonPink/30 rounded p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Total Amount</span>
            <span className="text-neonCyan text-xl font-bold">
              R{amount.toFixed(2)}
            </span>
          </div>
          <p className="text-gray-300 text-sm">
            {itemDescription}
          </p>
        </div>

        {/* Security Info */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Shield className="w-4 h-4 text-neonCyan" />
          <span>Secure 256-bit SSL encryption</span>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full btn-primary py-3 h-auto"
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Processing...</span>
              </div>
              {loadingStep && (
                <span className="text-xs opacity-80">{loadingStep}</span>
              )}
            </div>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay R{amount.toFixed(2)} with Card
            </>
          )}
        </Button>

        {/* Payment Methods Info */}
        <div className="text-center">
          <p className="text-gray-400 text-xs">
            We accept Visa, Mastercard, and other major cards
          </p>
        </div>
      </div>
    </div>
  );
}
