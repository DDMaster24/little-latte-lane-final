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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <Link href="/bookings">
            <Button variant="outline" className="border-2 border-neonPink/50 text-neonPink hover:bg-neonPink/10 hover:border-neonPink text-sm sm:text-base">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </Link>
        </div>

        {/* Page Content */}
        <div className="py-6 sm:py-8 lg:py-12 pb-12 sm:pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 lg:mb-10">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-neonPink to-purple-500 bg-clip-text text-transparent">
                Roberts Hall Booking
              </h1>
              <p className="text-gray-300 text-base sm:text-lg px-4">
                Reserve the exclusive Roberts Hall for your special event
              </p>
            </div>

            {/* Booking Form */}
            <RobertsHallBookingForm />
          </div>
        </div>
      </div>
    </main>
  );
}
