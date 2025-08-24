'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BookingsSection() {
  return (
    <section className="container-responsive section-padding-sm">
      <div className="bg-darkBg shadow-neon rounded-xl overflow-hidden animate-fade-in">
        <div className="text-center py-8 xs:py-12 px-6">
          <h2 className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent">
            Make a Booking
          </h2>
          <p className="text-fluid-base xs:text-fluid-lg mb-6 xs:mb-8 text-neonText max-w-3xl mx-auto leading-relaxed">
            Book the virtual golf simulator and optionally pre-order food. Choose
            your time slot and we&apos;ll have everything ready.
          </p>
          <Link href="/bookings" aria-label="Book a golf session">
            <Button className="neon-button px-4 xs:px-6 py-3 xs:py-4 text-fluid-base xs:text-fluid-lg hover:shadow-xl touch-target">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
