'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PayFastPaymentData } from '@/lib/payfast';
import { toast } from 'react-hot-toast';

interface PayFastPaymentProps {
  orderId: number;
  userId: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  userDetails?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    deliveryType?: string;
    deliveryAddress?: string;
  };
  onPaymentInitiated?: () => void;
  className?: string;
}

export default function PayFastPayment({
  orderId,
  userId,
  amount,
  itemName,
  itemDescription,
  userDetails,
  onPaymentInitiated,
  className = '',
}: PayFastPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const initiatePayment = async () => {
    setIsLoading(true);

    try {
      // Create payment with our API
      const response = await fetch('/api/payfast/create-payment', {
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

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const {
        paymentUrl,
        paymentData,
      }: {
        paymentUrl: string;
        paymentData: PayFastPaymentData;
      } = await response.json();

      // Create and submit form to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;
      form.style.display = 'none';

      // Add all payment data as hidden inputs
      Object.entries(paymentData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);

      // Call callback before redirecting
      onPaymentInitiated?.();

      // Submit form to PayFast
      form.submit();

      // Clean up
      document.body.removeChild(form);
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={initiatePayment}
      disabled={isLoading}
      className={`${className} bg-neon-green text-black hover:bg-neon-green/80 disabled:opacity-50`}
    >
      {isLoading ? 'Processing...' : `Pay R${amount.toFixed(2)} with PayFast`}
    </Button>
  );
}
