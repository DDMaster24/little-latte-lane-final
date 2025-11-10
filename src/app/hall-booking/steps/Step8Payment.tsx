'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase-client';
import { HallBookingFormData } from '@/types/hall-booking';

interface Step8Props {
  formData: HallBookingFormData;
  updateFormData: (updates: Partial<HallBookingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  user: any;
  draftId: string | null;
}

declare global {
  interface Window {
    YocoSDK?: any;
  }
}

export default function Step8Payment({
  formData,
  onPrevious,
  user,
  draftId,
}: Step8Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>('');

  const handlePayment = async () => {
    if (!draftId) {
      toast.error('Draft booking not found. Please go back and save your information.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create Yoco checkout session
      const checkoutResponse = await fetch('/api/yoco/hall-booking-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: draftId,
          amount: formData.totalAmount,
          customerEmail: formData.applicantEmail,
          customerName: `${formData.applicantName} ${formData.applicantSurname}`,
        }),
      });

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { checkoutId, redirectUrl } = await checkoutResponse.json();

      // Update booking with checkout ID
      const supabase = getSupabaseClient();
      await supabase
        .from('hall_bookings')
        .update({
          yoco_checkout_id: checkoutId,
          status: 'payment_processing',
        })
        .eq('id', draftId);

      // Step 2: Redirect to Yoco payment page or show popup
      if (redirectUrl) {
        // Redirect to Yoco hosted checkout
        window.location.href = redirectUrl;
      } else {
        // Use Yoco SDK inline popup (if available)
        if (window.YocoSDK) {
          const yoco = new window.YocoSDK({
            publicKey: process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY,
          });

          yoco.showPopup({
            amountInCents: Math.round(formData.totalAmount * 100),
            currency: 'ZAR',
            name: 'Roberts Hall Booking',
            description: `Roberts Hall Booking - ${formData.eventDate}`,
            metadata: {
              bookingId: draftId,
              userId: user.id,
              type: 'hall_booking',
            },
            callback: async function (result: any) {
              if (result.error) {
                toast.error('Payment failed: ' + result.error.message);
                setIsProcessing(false);

                // Update booking status to failed
                await supabase
                  .from('hall_bookings')
                  .update({
                    status: 'draft',
                    payment_status: 'failed',
                  })
                  .eq('id', draftId);
              } else {
                // Payment successful
                toast.success('Payment successful! Confirming your booking...');
                await handlePaymentSuccess(result.id);
              }
            },
          });
        } else {
          throw new Error('Yoco SDK not loaded. Please refresh and try again.');
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed: ' + error.message);
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentReference: string) => {
    try {
      const supabase = getSupabaseClient();

      // Update booking with payment confirmation
      const { data: updatedBooking, error } = await supabase
        .from('hall_bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          payment_reference: paymentReference,
          payment_date: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', draftId)
        .select()
        .single();

      if (error) throw error;

      setBookingReference(updatedBooking.booking_reference);
      setPaymentSuccess(true);
      setIsProcessing(false);

      // Send confirmation email (optional - handled by webhook)
      try {
        await fetch('/api/hall-booking/confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: draftId,
            bookingReference: updatedBooking.booking_reference,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the whole process if email fails
      }

      toast.success('Booking confirmed! Check your email for details.');
    } catch (error: any) {
      console.error('Failed to confirm booking:', error);
      toast.error('Payment succeeded but booking confirmation failed. Please contact support.');
    }
  };

  if (paymentSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-green-500/10 border-2 border-green-500/50 rounded-xl p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-400 mb-4">Payment Successful!</h2>
          <p className="text-white text-xl mb-2">Your Roberts Hall booking is confirmed</p>
          <p className="text-gray-300 mb-6">Booking Reference: <span className="font-bold text-neonCyan">{bookingReference}</span></p>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">✅ What Happens Next?</h3>
          <ul className="space-y-3 text-gray-300 text-left">
            <li className="flex items-start gap-3">
              <span className="text-neonCyan text-2xl">📧</span>
              <div>
                <p className="font-semibold text-white">Confirmation Email Sent</p>
                <p className="text-sm">Check {formData.applicantEmail} for your booking confirmation and receipt</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-neonCyan text-2xl">👁️</span>
              <div>
                <p className="font-semibold text-white">Office Review</p>
                <p className="text-sm">Our office will review your booking and confirm within 24-48 hours</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-neonCyan text-2xl">🔑</span>
              <div>
                <p className="font-semibold text-white">Access Code Provided</p>
                <p className="text-sm">You'll receive the hall access code 24 hours before your event</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-neonCyan text-2xl">💰</span>
              <div>
                <p className="font-semibold text-white">Deposit Refund</p>
                <p className="text-sm">R{formData.depositAmount.toFixed(2)} will be refunded within 7 days after inspection</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neonCyan mb-3">📱 Manage Your Booking</h3>
          <p className="text-gray-300 text-sm mb-4">
            You can view your booking details, track payment status, and see important updates in your account dashboard.
          </p>
          <Button
            onClick={() => router.push('/account')}
            className="bg-gradient-to-r from-neonCyan to-neonPink hover:from-neonCyan/80 hover:to-neonPink/80 text-black font-semibold"
          >
            Go to My Bookings
          </Button>
        </div>

        <div className="pt-6">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
        <p className="text-gray-300">
          Secure online payment via Yoco to confirm your Roberts Hall booking.
        </p>
      </div>

      {/* Payment Summary */}
      <div className="bg-gradient-to-br from-neonCyan/10 to-neonPink/10 border-2 border-neonCyan/50 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Payment Summary</h3>
        <div className="space-y-4 max-w-md mx-auto">
          <div className="flex justify-between items-center py-3 border-b border-gray-600">
            <span className="text-gray-300">Hall Rental Fee</span>
            <span className="text-white font-semibold text-lg">
              R {formData.rentalFee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-600">
            <span className="text-gray-300">Security Deposit</span>
            <span className="text-white font-semibold text-lg">
              R {formData.depositAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-4 bg-neonCyan/20 rounded-lg px-4 mt-4">
            <span className="text-white font-bold text-xl">Total Amount</span>
            <span className="text-neonCyan font-bold text-3xl">
              R {formData.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-gray-700/50 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">💳 Secure Payment via Yoco</h3>
        <ul className="space-y-3 text-gray-300 text-sm">
          <li className="flex items-start gap-3">
            <span className="text-green-400 text-xl">🔒</span>
            <div>
              <p className="font-semibold text-white">Secure & Encrypted</p>
              <p>All payments are processed securely via Yoco, South Africa's trusted payment gateway</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-400 text-xl">💳</span>
            <div>
              <p className="font-semibold text-white">Multiple Payment Methods</p>
              <p>Pay with credit card, debit card, or instant EFT</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-400 text-xl">📧</span>
            <div>
              <p className="font-semibold text-white">Instant Confirmation</p>
              <p>Receive booking confirmation and receipt immediately after payment</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Important Reminders */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">⚠️ Before You Pay</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>Payment is <strong className="text-white">non-refundable</strong> except the R{formData.depositAmount.toFixed(2)} deposit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>Deposit refunded within 7 days after successful inspection</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>Booking subject to office approval (confirmation within 24-48 hours)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">•</span>
            <span>If booking is rejected by office, full amount will be refunded</span>
          </li>
        </ul>
      </div>

      {/* Payment Button */}
      <div className="pt-6">
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full text-xl py-6 bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-bold disabled:opacity-50"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-3">
              <div className="animate-spin w-6 h-6 border-3 border-black border-t-transparent rounded-full"></div>
              Processing Payment...
            </span>
          ) : (
            <>💳 Pay R {formData.totalAmount.toFixed(2)} Now</>
          )}
        </Button>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <Button
          onClick={onPrevious}
          disabled={isProcessing}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          ← Go Back to Review
        </Button>
      </div>

      {/* Security Badge */}
      <div className="text-center pt-4">
        <p className="text-gray-400 text-sm">
          🔒 Powered by <strong className="text-white">Yoco</strong> - PCI DSS Level 1 Compliant
        </p>
      </div>
    </div>
  );
}
