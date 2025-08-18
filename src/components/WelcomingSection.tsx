'use client';

import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Camera,
  Coffee,
  Utensils,
  Star,
  MapPin,
  Wifi,
  Car,
} from 'lucide-react';

export default function WelcomingSection() {
  const { user, profile } = useAuth();
  const username = profile?.full_name || user?.email?.split('@')[0] || '';
  const [currentIndex, setCurrentIndex] = useState(2); // Start with center card (Virtual Golf)

  const carouselItems = [
    {
      id: 'opening-hours',
      title: 'Opening Hours',
      description: "We're here when you need us",
      content: (
        <div className="space-y-4">
          <Clock className="h-12 w-12 text-neonCyan mx-auto" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Mon - Fri</span>
              <span className="text-white font-medium">06:00 - 22:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Saturday</span>
              <span className="text-white font-medium">07:00 - 23:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Sunday</span>
              <span className="text-white font-medium">08:00 - 21:00</span>
            </div>
          </div>
          <Badge className="bg-green-500 text-green-50 w-full justify-center">
            Now Open
          </Badge>
        </div>
      ),
      bgColor: 'from-blue-900/50 to-cyan-900/50',
      borderColor: 'border-neonCyan',
    },
    {
      id: 'menu-ordering',
      title: 'Menu & Ordering',
      description: 'Delicious food, premium coffee',
      content: (
        <div className="space-y-2 w-full h-full flex flex-col">
          <div className="relative flex-shrink-0">
            <Image
              src="/images/food-drinks-neon-wp.png"
              alt="Menu Items"
              width={160}
              height={90}
              className="rounded-lg mx-auto object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs flex-1">
            <div className="flex items-center">
              <Coffee className="h-3 w-3 mr-1 text-neonPink flex-shrink-0" />
              <span className="truncate">Premium Coffee</span>
            </div>
            <div className="flex items-center">
              <Utensils className="h-3 w-3 mr-1 text-neonPink flex-shrink-0" />
              <span className="truncate">Fresh Meals</span>
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-neonPink flex-shrink-0" />
              <span className="truncate">Daily Specials</span>
            </div>
            <div className="flex items-center">
              <Wifi className="h-3 w-3 mr-1 text-neonPink flex-shrink-0" />
              <span className="truncate">Quick Orders</span>
            </div>
          </div>
        </div>
      ),
      bgColor: 'from-pink-900/50 to-rose-900/50',
      borderColor: 'border-neonPink',
    },
    {
      id: 'virtual-golf',
      title: 'Virtual Golf',
      description: 'Coming Soon - Golf Simulator',
      content: (
        <div className="space-y-2 w-full h-full flex flex-col">
          <div className="relative flex-shrink-0">
            <Image
              src="/images/golf-coming-soon-wp.png"
              alt="Virtual Golf Coming Soon"
              width={160}
              height={90}
              className="rounded-lg mx-auto object-cover"
            />
          </div>
          <div className="text-center flex-1 flex flex-col justify-center">
            <Badge className="bg-gradient-to-r from-neonPink to-neonCyan text-black font-medium mb-2 text-xs">
              Coming This Year!
            </Badge>
            <div className="space-y-1 text-xs">
              <div className="truncate">⚡ Professional Simulator</div>
              <div className="truncate">⚡ Famous Golf Courses</div>
              <div className="truncate">⚡ Private Bookings</div>
              <div className="truncate">⚡ Tournament Events</div>
            </div>
          </div>
        </div>
      ),
      bgColor: 'from-green-900/50 to-emerald-900/50',
      borderColor: 'border-yellow-500',
    },
    {
      id: 'events-news',
      title: 'Events & News',
      description: 'Stay updated with our latest',
      content: (
        <div className="space-y-4">
          <Calendar className="h-12 w-12 text-yellow-500 mx-auto" />
          <div className="space-y-2 text-sm">
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-white font-medium text-xs">Live Music Night</p>
              <p className="text-gray-400 text-xs">Every Friday 19:00</p>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-white font-medium text-xs">Coffee Cupping</p>
              <p className="text-gray-400 text-xs">Saturdays 10:00</p>
            </div>
          </div>
        </div>
      ),
      bgColor: 'from-purple-900/50 to-violet-900/50',
      borderColor: 'border-yellow-500',
    },
    {
      id: 'social-instagram',
      title: 'Social / Instagram',
      description: 'Follow our journey',
      content: (
        <div className="space-y-4">
          <Camera className="h-12 w-12 text-neonPink mx-auto" />
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-300">@LittleLatteLane</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 p-1 rounded">📸 Daily Specials</div>
              <div className="bg-gray-700 p-1 rounded">☕ Latte Art</div>
              <div className="bg-gray-700 p-1 rounded">🎉 Events</div>
              <div className="bg-gray-700 p-1 rounded">👥 Community</div>
            </div>
          </div>
        </div>
      ),
      bgColor: 'from-pink-900/50 to-purple-900/50',
      borderColor: 'border-neonPink',
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Get 3D transform and styling for each card based on its position relative to center
  const getCardTransform = (index: number) => {
    const relativeIndex = index - currentIndex;
    const normalizedIndex =
      ((relativeIndex % carouselItems.length) + carouselItems.length) %
      carouselItems.length;

    // Show all 5 cards with different sizes based on position
    switch (normalizedIndex) {
      case 0: // Center card (Virtual Golf) - Largest
        return {
          transform: 'translateX(0) translateZ(100px) rotateY(0deg) scale(1.2)',
          opacity: 1,
          zIndex: 50,
          visibility: 'visible' as const,
          width: '400px',
          height: '480px',
        };
      case 1: // Right medium card (Events/News)
        return {
          transform:
            'translateX(320px) translateZ(20px) rotateY(-15deg) scale(0.9)',
          opacity: 0.8,
          zIndex: 40,
          visibility: 'visible' as const,
          width: '320px',
          height: '400px',
        };
      case 2: // Far right small card (Social/Instagram) - Smallest
        return {
          transform:
            'translateX(560px) translateZ(-50px) rotateY(-30deg) scale(0.7)',
          opacity: 0.6,
          zIndex: 30,
          visibility: 'visible' as const,
          width: '260px',
          height: '320px',
        };
      case 3: // Far left small card (Opening Hours) - Smallest
        return {
          transform:
            'translateX(-560px) translateZ(-50px) rotateY(30deg) scale(0.7)',
          opacity: 0.6,
          zIndex: 30,
          visibility: 'visible' as const,
          width: '260px',
          height: '320px',
        };
      case 4: // Left medium card (Menu & Ordering)
        return {
          transform:
            'translateX(-320px) translateZ(20px) rotateY(15deg) scale(0.9)',
          opacity: 0.8,
          zIndex: 40,
          visibility: 'visible' as const,
          width: '320px',
          height: '400px',
        };
      default:
        return {
          transform:
            'translateX(0) translateZ(-400px) rotateY(0deg) scale(0.3)',
          opacity: 0,
          zIndex: 10,
          visibility: 'hidden' as const,
          width: '320px',
          height: '400px',
        };
    }
  };

  // Auto-rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 8000); // Increased to 8 seconds for 5-panel viewing

    return () => clearInterval(interval);
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="bg-gradient-to-br from-darkBg via-gray-900 to-darkBg py-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-neon-gradient bg-clip-text text-transparent">
            {username
              ? `Welcome Back, ${username}!`
              : 'Welcome to Little Latte Lane'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-6">
            Roberts&apos; Café and Deli - Where Great Food Meets Amazing
            Experiences
          </p>
          <div className="flex justify-center gap-3 mb-12">
            <Badge className="bg-neonCyan text-black px-4 py-2 text-sm font-medium">
              Now Open
            </Badge>
            <Badge className="bg-neonPink text-black px-4 py-2 text-sm font-medium">
              Dine In • Takeaway • Delivery
            </Badge>
          </div>
        </div>

        {/* 5-Panel Carousel */}
        <div className="relative mb-16">
          {/* Carousel Container */}
          <div className="relative h-[600px] flex items-center justify-center carousel-3d-container overflow-visible">
            {carouselItems.map((item, index) => {
              const cardStyle = getCardTransform(index);

              return (
                <div
                  key={item.id}
                  className="absolute carousel-3d-card cursor-pointer transition-all duration-1000 ease-in-out"
                  style={{
                    transform: cardStyle.transform,
                    opacity: cardStyle.opacity,
                    zIndex: cardStyle.zIndex,
                    visibility: cardStyle.visibility,
                    width: cardStyle.width,
                    height: cardStyle.height,
                  }}
                  onClick={() => goToSlide(index)}
                >
                  <Card
                    className={`
                      w-full h-full bg-gradient-to-br ${item.bgColor} backdrop-blur-sm 
                      border-2 ${item.borderColor} shadow-2xl
                      overflow-hidden hover:shadow-3xl hover:border-opacity-100
                      transition-all duration-300
                    `}
                  >
                    <CardContent className="p-4 h-full flex flex-col justify-between">
                      <div className="flex-shrink-0">
                        <h3
                          className={`font-bold text-white mb-2 ${
                            index === currentIndex ? 'text-2xl' : 'text-lg'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={`text-gray-300 mb-3 ${
                            index === currentIndex ? 'text-sm' : 'text-xs'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center">
                          {item.content}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-neon-green scale-125'
                    : 'bg-gray-600 hover:bg-gray-400'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full border border-neon-green/50 hover:border-neon-green transition-all duration-300 z-60"
            onClick={() =>
              setCurrentIndex(
                (prev) =>
                  (prev - 1 + carouselItems.length) % carouselItems.length
              )
            }
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full border border-neon-green/50 hover:border-neon-green transition-all duration-300 z-60"
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % carouselItems.length)
            }
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
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
