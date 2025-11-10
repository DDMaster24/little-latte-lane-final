'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NextImage from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  partySize: number;
  eventType: string;
  message: string;
}

export default function BookingsContactPage() {
  // Collapsible sections state
  const [tableEnquiryOpen, setTableEnquiryOpen] = useState(false);
  const [hallBookingOpen, setHallBookingOpen] = useState(false);

  // Contact form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    partySize: 1,
    eventType: 'general',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Your booking inquiry has been sent! We\'ll get back to you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          partySize: 1,
          eventType: 'general',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Sorry, something went wrong. Please try again or call us directly.');
    }

    setIsSubmitting(false);
  };

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
            <h1 className="text-3xl sm:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-neonCyan to-neonPink bg-clip-text text-transparent">
              Book with Little Latte Lane
            </h1>

            {/* Two Collapsible Booking Sections */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">

              {/* SECTION 1: TABLE & EVENT ENQUIRY */}
              <div className="bg-gradient-to-br from-neonCyan/10 to-neonCyan/5 border-2 border-neonCyan/30 rounded-2xl overflow-hidden hover:border-neonCyan/50 transition-all duration-300">
                {/* Header - Always Visible */}
                <button
                  onClick={() => {
                    setTableEnquiryOpen(!tableEnquiryOpen);
                    if (!tableEnquiryOpen) setHallBookingOpen(false);
                  }}
                  className="w-full p-6 sm:p-8 text-left hover:bg-neonCyan/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-5xl sm:text-6xl mb-4">🍽️</div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-neonCyan mb-3">
                        Tables & Events
                      </h2>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                        Book a table for dining, celebrate birthdays, host corporate gatherings, or plan any special event at our cafe.
                      </p>
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
                    <div className="ml-4 flex-shrink-0">
                      {tableEnquiryOpen ? (
                        <ChevronUp className="h-6 w-6 text-neonCyan" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-neonCyan" />
                      )}
                    </div>
                  </div>
                  {!tableEnquiryOpen && (
                    <div className="mt-4 text-center">
                      <span className="text-neonCyan font-semibold text-sm">
                        Click to open booking form →
                      </span>
                    </div>
                  )}
                </button>

                {/* Collapsible Content - Contact Form */}
                {tableEnquiryOpen && (
                  <div className="px-6 sm:px-8 pb-8 border-t border-neonCyan/20">
                    <div className="mt-6 bg-gray-800/80 backdrop-blur-lg p-6 rounded-xl">
                      <h3 className="text-xl font-semibold mb-6 text-white text-center">
                        Send Us Your Booking Inquiry
                      </h3>

                      <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block font-semibold mb-2 text-gray-200">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-200">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Contact & Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block font-semibold mb-2 text-gray-200">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
                    placeholder="(optional)"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 text-gray-200">
                    Preferred Date
                  </label>
                  <Input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Event Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block font-semibold mb-2 text-gray-200">
                    Amount of People
                  </label>
                  <Input
                    type="number"
                    name="partySize"
                    value={formData.partySize}
                    onChange={handleInputChange}
                    min={1}
                    max={50}
                    className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
                  />
                  <p className="text-sm text-gray-300 mt-1">
                    How many people?
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-200">
                    Type of Booking
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonCyan focus:ring-2 focus:ring-neonCyan/20"
                  >
                    <option value="general">General Table Booking</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="hall">Roberts Hall Booking</option>
                    <option value="other">Other Event</option>
                  </select>
                  <p className="text-sm text-gray-400 mt-1">
                    Select Roberts Hall for weddings, large functions, or conferences
                  </p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block font-semibold mb-2 text-gray-200">
                  Message & Special Requests *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full p-4 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonCyan focus:ring-2 focus:ring-neonCyan/20 resize-vertical"
                  placeholder="Tell us about your booking needs, preferred time, special dietary requirements, decorations, or any other details..."
                />
                <p className="text-sm text-gray-300 mt-2">
                  Please include your preferred time, any special requirements, and other relevant details.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-lg py-4 bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                      Sending...
                    </span>
                  ) : (
                    '📧 Send Booking Inquiry'
                  )}
                        </Button>
                      </div>

                      {/* Contact Info */}
                      <div className="mt-6 pt-6 border-t border-gray-600 text-center">
                        <p className="text-sm text-gray-300">
                          📧 admin@littlelattelane.co.za • ⏰ We&apos;ll respond within 24 hours
                        </p>
                      </div>
                    </form>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: ROBERTS HALL BOOKING */}
              <div className="bg-gradient-to-br from-neonPink/10 to-neonPink/5 border-2 border-neonPink/30 rounded-2xl overflow-hidden hover:border-neonPink/50 transition-all duration-300">
                {/* Header - Always Visible */}
                <button
                  onClick={() => {
                    setHallBookingOpen(!hallBookingOpen);
                    if (!hallBookingOpen) setTableEnquiryOpen(false);
                  }}
                  className="w-full p-6 sm:p-8 text-left hover:bg-neonPink/5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-5xl sm:text-6xl mb-4">🏛️</div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-neonPink mb-3">
                        Roberts Hall
                      </h2>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                        Reserve the exclusive Roberts Hall for weddings, large gatherings, conferences, and major events.
                      </p>
                      <ul className="space-y-2 text-gray-200 text-sm sm:text-base mb-6">
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

                      <div className="bg-neonPink/10 border border-neonPink/50 rounded-lg p-4">
                        <p className="text-white font-semibold text-center mb-2">
                          💰 Total Cost: R2,500
                        </p>
                        <p className="text-gray-300 text-sm text-center">
                          R1,500 rental fee + R1,000 refundable deposit
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {hallBookingOpen ? (
                        <ChevronUp className="h-6 w-6 text-neonPink" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-neonPink" />
                      )}
                    </div>
                  </div>
                  {!hallBookingOpen && (
                    <div className="mt-4 text-center">
                      <span className="text-neonPink font-semibold text-sm">
                        Click to check availability & book online →
                      </span>
                    </div>
                  )}
                </button>

                {/* Collapsible Content - Hall Booking (Placeholder) */}
                {hallBookingOpen && (
                  <div className="px-6 sm:px-8 pb-8 border-t border-neonPink/20">
                    <div className="mt-6 bg-gray-800/80 backdrop-blur-lg p-6 rounded-xl text-center">
                      <p className="text-white mb-4">
                        🏗️ Roberts Hall online booking coming soon...
                      </p>
                      <p className="text-gray-400 text-sm">
                        For now, please use the Table & Events form and select "Roberts Hall Booking"
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
