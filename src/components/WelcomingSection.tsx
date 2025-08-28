'use client';

import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Car } from 'lucide-react';
import DynamicCarousel from '@/components/DynamicCarousel';

export default function WelcomingSection() {
  const { user, profile } = useAuth();
  const username = profile?.full_name || user?.email?.split('@')[0] || '';

  return (
    <section className="bg-gradient-to-br from-darkBg via-gray-900 to-darkBg section-padding overflow-hidden">
      <div className="container-wide animate-fade-in">
        {/* Hero Header - Fully Responsive */}
        <div className="text-center section-padding-sm">
          <h1 
            data-editable="main-heading"
            className="text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl lg:text-fluid-6xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent"
          >
            {username
              ? `Welcome Back, ${username}!`
              : 'Welcome to Little Latte Lane'}
          </h1>
          <p 
            data-editable="hero-subheading"
            className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl text-gray-300 mb-4 xs:mb-6 max-w-4xl mx-auto"
          >
            Roberts&apos; Café and Deli - Where Great Food Meets Amazing
            Experiences
          </p>
          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 mb-8 xs:mb-12">
            <Badge 
              data-editable="now-open-badge"
              className="bg-neonCyan text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium"
            >
              Now Open
            </Badge>
            <Badge 
              data-editable="service-options-badge"
              className="bg-neonPink text-black px-3 xs:px-4 py-2 text-fluid-xs xs:text-fluid-sm font-medium"
            >
              Dine In • Takeaway • Delivery
            </Badge>
          </div>
        </div>

        {/* Dynamic Carousel */}
        <div className="mb-16">
          <DynamicCarousel />
        </div>

        {/* Call to Action Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4">
            Ready to Experience Little Latte Lane?
          </h2>
          <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
            Join us for exceptional food, premium beverages, and a warm,
            welcoming atmosphere. Whether you&apos;re catching up with friends,
            having a business meeting, or enjoying a quiet moment, we&apos;re
            here to make your experience memorable.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="flex items-center justify-center gap-2 text-neonCyan">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium">Exceptional Quality</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-neonPink">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium">Prime Location</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Car className="h-5 w-5" />
              <span className="text-sm font-medium">Easy Parking</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
