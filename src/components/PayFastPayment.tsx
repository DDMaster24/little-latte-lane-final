'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PayFastPaymentData } from '@/lib/payfast';
import { toast } from 'sonner';

interface PayFastPaymentProps {
  orderId: string;
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

  // Optimized form submission function
  const submitToPayFast = useCallback((paymentUrl: string, paymentData: PayFastPaymentData) => {
    // Create form elements more efficiently
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;
    form.style.display = 'none';
    
    // Use DocumentFragment for better performance when adding multiple elements
    const fragment = document.createDocumentFragment();
    
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        fragment.appendChild(input);
      }
    });
    
    form.appendChild(fragment);
    document.body.appendChild(form);
    
    // Call callback before redirecting
    onPaymentInitiated?.();
    
    // Submit and cleanup
    form.submit();
    
    // Cleanup after a short delay to ensure submission
    setTimeout(() => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    }, 100);
  }, [onPaymentInitiated]);

  const initiatePayment = useCallback(async () => {
    if (isLoading) return; // Prevent double-clicks
    
    setIsLoading(true);
    
    try {
      toast.loading('Preparing payment...', { id: 'payment-prep' });
      
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
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create payment');
      }

      const { paymentUrl, paymentData } = await response.json();
      
      toast.success('Redirecting to PayFast...', { id: 'payment-prep' });
      
      // Small delay to show the success message before redirect
      setTimeout(() => {
        submitToPayFast(paymentUrl, paymentData);
      }, 500);

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(
        error instanceof Error 
          ? `Payment failed: ${error.message}` 
          : 'Failed to initiate payment. Please try again.',
        { id: 'payment-prep' }
      );
      setIsLoading(false);
    }
  }, [orderId, userId, amount, itemName, itemDescription, userDetails, isLoading, submitToPayFast]);

  return (
    <Button
      onClick={initiatePayment}
      disabled={isLoading}
      className={`${className} bg-gradient-to-r from-neonCyan to-neonBlue text-black font-semibold hover:from-neonCyan/90 hover:to-neonBlue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          Preparing Payment...
        </div>
      ) : (
        `Pay R${amount.toFixed(2)} with PayFast`
      )}
    </Button>
  );
}
