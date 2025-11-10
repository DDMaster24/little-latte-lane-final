'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BookingsPage() {
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
        {/* Hero Section */}
        <div className="py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
              Book with Little Latte Lane
            </h1>
            <p className="text-gray-300 text-center text-lg mb-12 max-w-2xl mx-auto">
              Choose your booking type below
            </p>

            {/* Two Booking Cards */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">

              {/* CARD 1: TABLE & EVENT ENQUIRY */}
              <div className="bg-gradient-to-br from-neonCyan/20 to-neonCyan/10 backdrop-blur-sm bg-gray-900/60 border-2 border-neonCyan/30 rounded-2xl overflow-hidden hover:border-neonCyan/50 transition-all duration-300 hover:scale-[1.02]">
                {/* Card Header */}
                <div className="p-6 sm:p-8">
                  <div className="text-5xl sm:text-6xl mb-4 text-center">🍽️</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-neonCyan mb-3 text-center">
                    Tables & Events
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base text-center mb-6">
                    Book a table for dining, celebrate birthdays, host corporate gatherings, or plan any special event at our cafe.
                  </p>
                </div>

                {/* Tables Image */}
                <div className="relative h-48 sm:h-64 mx-6 mb-6 rounded-lg overflow-hidden">
                  <NextImage
                    src="/images/Tables.jpg"
                    alt="Tables & Events at Little Latte Lane"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Features List */}
                <div className="px-6 sm:px-8 mb-6">
                  <ul className="space-y-2 text-gray-200 text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-neonCyan mt-1">✓</span>
                      <span>General table reservations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neonCyan mt-1">✓</span>
                      <span>Birthday parties & celebrations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neonCyan mt-1">✓</span>
                      <span>Corporate events & meetings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neonCyan mt-1">✓</span>
                      <span>Custom event planning</span>
                    </li>
                  </ul>
                </div>

                {/* Action Button */}
                <div className="p-6 sm:p-8 pt-0">
                  <Link href="/bookings/tables">
                    <Button className="w-full text-lg py-6 bg-gradient-to-r from-neonCyan to-cyan-500 hover:from-neonCyan/80 hover:to-cyan-500/80 text-black font-semibold">
                      Book Table or Event →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* CARD 2: ROBERTS HALL BOOKING */}
              <div className="bg-gradient-to-br from-neonPink/20 to-neonPink/10 backdrop-blur-sm bg-gray-900/60 border-2 border-neonPink/30 rounded-2xl overflow-hidden hover:border-neonPink/50 transition-all duration-300 hover:scale-[1.02]">
                {/* Card Header */}
                <div className="p-6 sm:p-8">
                  <div className="text-5xl sm:text-6xl mb-4 text-center">🏛️</div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-neonPink mb-3 text-center">
                    Roberts Hall
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base text-center mb-6">
                    Reserve the exclusive Roberts Hall for weddings, large gatherings, conferences, and major events.
                  </p>
                </div>

                {/* Roberts Hall Image */}
                <div className="relative h-48 sm:h-64 mx-6 mb-6 rounded-lg overflow-hidden">
                  <NextImage
                    src="/images/Hall.jpg"
                    alt="Roberts Hall"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Features List */}
                <div className="px-6 sm:px-8 mb-6">
                  <ul className="space-y-2 text-gray-200 text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-neonPink mt-1">✓</span>
                      <span>Weddings & receptions (up to 50 guests)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neonPink mt-1">✓</span>
                      <span>Large private functions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neonPink mt-1">✓</span>
                      <span>Conferences & seminars</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neonPink mt-1">✓</span>
                      <span>Community events</span>
                    </li>
                  </ul>
                </div>

                {/* Action Button */}
                <div className="p-6 sm:p-8 pt-0">
                  <Link href="/bookings/hall">
                    <Button className="w-full text-lg py-6 bg-gradient-to-r from-neonPink to-purple-500 hover:from-neonPink/80 hover:to-purple-500/80 text-white font-semibold">
                      Book Roberts Hall →
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
