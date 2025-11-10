'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NextImage from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  partySize: number;
  eventType: string;
  message: string;
}

export default function TablesBookingPage() {
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

    // Validation - all fields required
    if (!formData.name || !formData.email || !formData.phone || !formData.preferredDate || !formData.message) {
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
        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <Link href="/bookings">
            <Button variant="outline" className="border-2 border-neonCyan/50 text-neonCyan hover:bg-neonCyan/10 hover:border-neonCyan">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Button>
          </Link>
        </div>

        {/* Page Content */}
        <div className="py-8 sm:py-12">
          <div className="max-w-3xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-neonCyan to-cyan-500 bg-clip-text text-transparent">
                Tables & Events Booking
              </h1>
              <p className="text-gray-300 text-lg">
                Fill in the form below and we'll get back to you within 24 hours
              </p>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-neonCyan/20 to-neonCyan/10 backdrop-blur-sm bg-gray-900/60 border-2 border-neonCyan/30 rounded-2xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal Information Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block font-semibold mb-2 text-gray-200">
                      Full Name
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
                      Email Address
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
                      required
                      className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
                      placeholder="Enter your phone number"
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
                      required
                      className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan [color-scheme:dark]"
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
                    Message & Special Requests
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
                    className="w-full text-lg py-4 bg-gradient-to-r from-neonCyan to-cyan-500 hover:from-neonCyan/80 hover:to-cyan-500/80 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                        Sending...
                      </span>
                    ) : (
                      'Send Booking Inquiry'
                    )}
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-neonCyan/30">
                  <p className="text-sm text-gray-400 text-center mb-3">
                    Prefer to contact us directly?
                  </p>
                  <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-4">
                    <p className="text-lg font-semibold text-neonCyan text-center mb-1">
                      📧 admin@littlelattelane.co.za
                    </p>
                    <p className="text-sm text-gray-300 text-center">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
