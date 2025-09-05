'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEditorMode } from '@/contexts/EditorModeContext';

export default function BookingsSection() {
  const { isEditorMode } = useEditorMode();

  return (
    <section 
      className="container-responsive section-padding-sm shadow-neon rounded-xl animate-fade-in"
      data-editable="bookings-section-background"
    >
      <div className="text-center">
        <h2 
          className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent"
          data-editable="bookings-title"
        >
          Make a Booking
        </h2>
        <p 
          className="text-fluid-base xs:text-fluid-lg mb-6 xs:mb-8 text-neonText max-w-3xl mx-auto leading-relaxed"
          data-editable="bookings-description"
        >
          Book the virtual golf simulator and optionally pre-order food. Choose
          your time slot and we&apos;ll have everything ready.
        </p>
        
        {/* Conditional rendering for editor vs normal mode */}
        {isEditorMode ? (
          // Editor mode: Button without navigation
          <Button 
            className="neon-button px-4 xs:px-6 py-3 xs:py-4 text-fluid-base xs:text-fluid-lg hover:shadow-xl touch-target"
            data-editable="bookings-button"
            type="button"
          >
            <span 
              data-editable="bookings-button-text"
              className="cursor-pointer"
            >
              Book Now
            </span>
          </Button>
        ) : (
          // Normal mode: Button with navigation
          <Link href="/bookings" aria-label="Book a golf session">
            <Button 
              className="neon-button px-4 xs:px-6 py-3 xs:py-4 text-fluid-base xs:text-fluid-lg hover:shadow-xl touch-target"
            >
              Book Now
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
}
