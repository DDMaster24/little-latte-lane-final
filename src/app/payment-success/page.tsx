'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Smartphone } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Payment Success Fallback Page
 * 
 * This page serves as a fallback when deep linking fails on Android.
 * It provides clear instructions to manually return to the app.
 * 
 * On successful deep link: This page will never be seen (browser closes automatically)
 * On failed deep link: User sees this page with instructions to close browser
 */
export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<'android' | 'ios' | 'web'>('web');
  
  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) {
      setPlatform('android');
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      setPlatform('ios');
    } else {
      setPlatform('web');
    }
    
    // If on web (not native app), redirect to account page after 3 seconds
    if (!userAgent.includes('android') && !userAgent.includes('iphone') && !userAgent.includes('ipad')) {
      setTimeout(() => {
        router.push('/account');
      }, 3000);
    }
  }, [router]);
  
  const paymentStatus = searchParams.get('payment'); // success, cancelled, failed
  const orderId = searchParams.get('orderId');
  
  const isSuccess = paymentStatus === 'success';
  const isCancelled = paymentStatus === 'cancelled';
  const isFailed = paymentStatus === 'failed';
  
  // Show different content based on payment status
  const getStatusContent = () => {
    if (isSuccess) {
      return {
        icon: <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />,
        title: 'Payment Successful! 🎉',
        subtitle: 'Your order has been received',
        color: 'green',
      };
    } else if (isCancelled) {
      return {
        icon: <div className="h-16 w-16 text-yellow-400 mx-auto mb-4 text-5xl">⚠️</div>,
        title: 'Payment Cancelled',
        subtitle: 'Your payment was cancelled',
        color: 'yellow',
      };
    } else if (isFailed) {
      return {
        icon: <div className="h-16 w-16 text-red-400 mx-auto mb-4 text-5xl">❌</div>,
        title: 'Payment Failed',
        subtitle: 'There was an issue processing your payment',
        color: 'red',
      };
    } else {
      return {
        icon: <CheckCircle className="h-16 w-16 text-neonCyan mx-auto mb-4" />,
        title: 'Payment Processed',
        subtitle: 'Please check your account for details',
        color: 'cyan',
      };
    }
  };
  
  const statusContent = getStatusContent();
  
  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Status Icon */}
        {statusContent.icon}
        
        {/* Status Title */}
        <h1 className="text-3xl font-bold text-white mb-2">
          {statusContent.title}
        </h1>
        
        {/* Status Subtitle */}
        <p className="text-gray-400 mb-6">
          {statusContent.subtitle}
        </p>
        
        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Order ID: {orderId}
          </p>
        )}
        
        {/* Instructions for Mobile App */}
        {platform !== 'web' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-3">
              <ArrowLeft className="h-6 w-6 text-neonCyan mt-1 flex-shrink-0" />
              <div className="text-left">
                <p className="text-white font-medium mb-2">
                  Return to Little Latte Lane
                </p>
                <p className="text-sm text-gray-400">
                  Close this browser window to go back to the app and view your order details.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Icon Indication */}
        {platform !== 'web' && (
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Smartphone className="h-4 w-4" />
            <span>Tap the back button or close this window</span>
          </div>
        )}
        
        {/* Web Redirect Message */}
        {platform === 'web' && (
          <div className="bg-gray-800/50 border border-neonCyan/30 rounded-lg p-6">
            <p className="text-white mb-2">
              Redirecting you to your account...
            </p>
            <button
              onClick={() => router.push('/account')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-neonCyan to-neonPink text-white font-medium rounded-lg hover:shadow-neonCyan transition-all"
            >
              View Orders Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
