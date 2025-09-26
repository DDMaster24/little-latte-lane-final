'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NextImage from 'next/image';

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
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-neonCyan via-neonPink to-neonBlue bg-clip-text text-transparent">
              Book Your Table or Event
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8">
              Planning a party, event, or need to book a table? Get in touch with us!
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
          <div className="bg-gray-800/90 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-2xl border border-neonCyan/30">
            <h2 className="text-2xl font-semibold mb-6 text-white text-center">
              Send Us Your Booking Inquiry
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    Party Size
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
                    <option value="wedding">Wedding Reception</option>
                    <option value="private">Private Dining</option>
                    <option value="other">Other Event</option>
                  </select>
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
            </form>

            {/* Contact Information */}
            <div className="mt-8 pt-8 border-t border-gray-600">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Prefer to call us directly?
                </h3>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>admin@littlelattelane.co.za</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏰</span>
                    <span>We&apos;ll respond within 24 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
