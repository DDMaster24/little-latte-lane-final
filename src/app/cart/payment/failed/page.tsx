'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');
  const [retryCount, setRetryCount] = useState(0);

  // Get user-friendly error message based on reason
  const getErrorMessage = (reason: string | null) => {
    if (!reason) return 'We were unable to process your payment. Please try again or use a different payment method.';
    
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes('insufficient') || reasonLower.includes('funds')) {
      return 'Insufficient funds. Please check your account balance or try a different card.';
    }
    if (reasonLower.includes('expired') || reasonLower.includes('invalid')) {
      return 'Your card appears to be expired or invalid. Please check your card details.';
    }
    if (reasonLower.includes('declined') || reasonLower.includes('blocked')) {
      return 'Payment was declined by your bank. Please contact your bank or try a different card.';
    }
    if (reasonLower.includes('network') || reasonLower.includes('timeout')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    return 'Payment could not be processed. Please try again or contact support if the issue persists.';
  };

  const handleRetryPayment = () => {
    setRetryCount(prev => prev + 1);
    if (orderId) {
      // Redirect to account page to retry the specific order
      router.push(`/account?retry=${orderId}`);
    } else {
      // Fallback to cart
      router.push('/cart');
    }
  };

  useEffect(() => {
    // Auto-focus the retry button for better UX
    const retryButton = document.getElementById('retry-payment-btn');
    if (retryButton) {
      retryButton.focus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-darkBg/80 border-red-500/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="animate-slide-up">
              <h1 className="text-2xl font-bold text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-300 text-sm">
                {getErrorMessage(reason)}
              </p>
            </div>

            {/* Specific Error Details */}
            {reason && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 animate-slide-up">
                <h3 className="text-white font-semibold mb-2">Error Details</h3>
                <p className="text-red-300 text-sm font-mono">
                  {reason.replace(/_/g, ' ').toUpperCase()}
                </p>
              </div>
            )}

            {/* Troubleshooting Tips */}
            <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 animate-slide-up">
              <h3 className="text-white font-semibold mb-2">Quick Solutions</h3>
              <div className="text-gray-300 text-sm space-y-1 text-left">
                <p>• Check your card details and expiry date</p>
                <p>• Ensure sufficient funds are available</p>
                <p>• Try a different payment method</p>
                <p>• Contact your bank if payment is blocked</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 animate-slide-up">
              <Button
                id="retry-payment-btn"
                onClick={handleRetryPayment}
                className="w-full btn-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryCount > 0 ? `Retry Payment (${retryCount + 1})` : 'Try Payment Again'}
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full btn-tertiary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>

              {/* Support option for persistent failures */}
              {retryCount > 1 && (
                <Button
                  onClick={() => router.push('/contact')}
                  variant="outline"
                  className="w-full btn-danger"
                >
                  Contact Support
                </Button>
              )}
            </div>

            {/* Order ID for support */}
            {orderId && (
              <div className="text-xs text-gray-500 animate-slide-up">
                Order ID: {orderId.slice(-8).toUpperCase()}
                <br />
                <span className="text-gray-600">Save this ID for support inquiries</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
