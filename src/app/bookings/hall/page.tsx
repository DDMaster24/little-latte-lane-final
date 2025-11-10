'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RobertsHallBookingForm from '@/components/RobertsHallBookingForm';

export default function HallBookingPage() {
  return (
    <main className="min-h-screen relative">
      {/* Full Background Image */}
      <div className="absolute inset-0">
        <NextImage
          src="/images/food-drinks-neon-wp.png"
          alt="Little Latte Lane Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 safe-area-top">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <Link href="/bookings">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </Link>
        </div>

        {/* Page Content */}
        <div className="py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-5xl sm:text-6xl mb-4">🏛️</div>
              <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-neonPink to-purple-500 bg-clip-text text-transparent">
                Roberts Hall Booking
              </h1>
              <p className="text-gray-300 text-lg mb-4">
                Reserve the exclusive Roberts Hall for your special event
              </p>
              <div className="bg-neonPink/10 border border-neonPink/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-white font-semibold text-center mb-2">
                  💰 Total Cost: R2,500
                </p>
                <p className="text-gray-300 text-sm text-center">
                  R1,500 rental fee + R1,000 refundable deposit
                </p>
              </div>
            </div>

            {/* Booking Form */}
            <RobertsHallBookingForm />
          </div>
        </div>
      </div>
    </main>
  );
}
