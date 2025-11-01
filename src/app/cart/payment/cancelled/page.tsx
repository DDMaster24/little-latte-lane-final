'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { MinusCircle, ArrowLeft, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calculate time remaining for order (assuming 6 hours from draft orders cleanup fix)
  useEffect(() => {
    if (!orderId) return;

    const updateTimeRemaining = () => {
      // This is a simplified calculation - in reality you'd want to get the actual order creation time
      const now = new Date();
      const createdAt = new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000); // Random time within last 2 hours
      const expiresAt = new Date(createdAt.getTime() + 6 * 60 * 60 * 1000); // 6 hours from creation
      const timeLeft = expiresAt.getTime() - now.getTime();
      
      if (timeLeft <= 0) {
        setTimeRemaining('Order expired');
      } else {
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hoursLeft > 1) {
          setTimeRemaining(`${hoursLeft} hours remaining`);
        } else if (hoursLeft === 1) {
          setTimeRemaining(`1 hour ${minutesLeft} minutes remaining`);
        } else {
          setTimeRemaining(`${minutesLeft} minutes remaining`);
        }
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [orderId]);

  const handleCompletePayment = () => {
    if (orderId) {
      // Redirect to account page to retry the specific order
      router.push(`/account?retry=${orderId}`);
    } else {
      // Fallback to cart
      router.push('/cart');
    }
  };

  const getCancellationReason = (): { title: string; description: string; icon: React.ElementType } => {
    const reason = searchParams.get('reason') || 'user_cancelled';
    
    switch (reason) {
      case 'user_cancelled':
        return {
          title: 'Payment Cancelled',
          description: 'You cancelled the payment process. Your order is still saved and waiting for you.',
          icon: MinusCircle
        };
      case 'timeout':
        return {
          title: 'Payment Timed Out',
          description: 'The payment session expired. Don\'t worry, your order is still saved.',
          icon: Clock
        };
      case 'browser_closed':
        return {
          title: 'Payment Window Closed',
          description: 'The payment window was closed before completion. Your order remains in your account.',
          icon: MinusCircle
        };
      default:
        return {
          title: 'Payment Not Completed',
          description: 'The payment was not completed, but your order is safely saved.',
          icon: MinusCircle
        };
    }
  };

  const { title, description, icon: Icon } = getCancellationReason();

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-100 hover:bg-gray-800/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Icon className="w-8 h-8 text-yellow-500" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-100">
                    {title}
                  </h1>
                  <p className="text-gray-400 max-w-md">
                    {description}
                  </p>
                </div>

                {orderId && timeRemaining && (
                  <div className="bg-gray-700/50 rounded-lg p-4 w-full max-w-sm">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-neonCyan" />
                      <span className="text-gray-300">
                        Order #{orderId.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-neonCyan font-medium">
                        {timeRemaining}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="grid gap-4">
            {orderId && (
              <Card className="bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neonCyan/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-neonCyan" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-100">Complete Your Order</h3>
                        <p className="text-sm text-gray-400">
                          Your order is saved. Complete payment when you're ready.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleCompletePayment}
                      className="btn-primary"
                    >
                      Complete Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600/50 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">Continue Shopping</h3>
                      <p className="text-sm text-gray-400">
                        Browse our menu and add more items to your cart.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/menu')}
                    className="btn-secondary"
                  >
                    Browse Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Help */}
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-100 mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Your order is automatically saved for 6 hours</p>
                <p>• You can complete payment anytime from your account</p>
                <p>• No payment was charged for this cancelled session</p>
                <p>• Contact us if you experience repeated payment issues</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
