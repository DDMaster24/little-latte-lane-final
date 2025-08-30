'use client';

import { useAuth } from '@/components/AuthProvider';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NextImage from 'next/image';
import type { BookingSlot } from '@/types/app-types';

interface VirtualGolfSettings {
  enabled: boolean;
  comingSoonMessage: string;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const [golfDate, setGolfDate] = useState<Date | null>(new Date());
  const [golfPeople, setGolfPeople] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [existingBookings, setExistingBookings] = useState<BookingSlot[]>([]);
  const [golfSettings, setGolfSettings] = useState<VirtualGolfSettings | null>(
    null
  );
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Fetch virtual golf settings and existing bookings
  const fetchGolfSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      // TODO: Implement settings storage solution
      // Virtual golf settings currently disabled - no settings table in database
      const defaultSettings = {
        enabled: false,
        comingSoonMessage:
          "Virtual Golf Coming Soon! 🏌️‍♂️\n\nWe're putting the finishing touches on our state-of-the-art virtual golf simulator. Stay tuned for an amazing golf experience!",
      };

      setGolfSettings(defaultSettings);
    } catch (err) {
      console.error('Error in fetchGolfSettings:', err);
      // Fallback to default settings
      setGolfSettings({
        enabled: false,
        comingSoonMessage:
          "Virtual Golf Coming Soon! 🏌️‍♂️\n\nWe're putting the finishing touches on our state-of-the-art virtual golf simulator. Stay tuned for an amazing golf experience!",
      });
    }

    setIsLoadingSettings(false);
  }, []);

  const fetchBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, booking_date, booking_time, party_size')
      .gte('booking_date', new Date().toISOString().split('T')[0])
      .order('booking_date', { ascending: true });

    if (!error && data) {
      setExistingBookings(data);
    }
  }, [supabase]);

  useEffect(() => {
    fetchGolfSettings();
    fetchBookings();
  }, [fetchGolfSettings, fetchBookings]);

  // Filter time to business hours (07:00 - 17:00)
  const filterBusinessHours = (time: Date) => {
    const hours = time.getHours();
    return hours >= 7 && hours <= 17;
  };

  // Check if a date/time is already booked
  const isTimeSlotBooked = (date: Date) => {
    return existingBookings.some((booking) => {
      const bookingDate = new Date(booking.booking_date);
      return Math.abs(bookingDate.getTime() - date.getTime()) < 3600000; // Within 1 hour
    });
  };

  async function handleFinalizeBook() {
    if (!user) {
      toast.error('Please log in to book.');
      return;
    }
    if (!golfDate) {
      toast.error('Please select a date and time.');
      return;
    }

    if (isTimeSlotBooked(golfDate)) {
      toast.error(
        'This time slot is already booked. Please choose another time.'
      );
      return;
    }

    setIsBooking(true);

    const { error } = await supabase.from('bookings').insert({
      name: user.email || 'Guest', // Use email as name fallback
      email: user.email || '',
      booking_date: golfDate.toISOString().split('T')[0],
      booking_time: golfDate.toTimeString().split(' ')[0],
      party_size: golfPeople,
      special_requests: 'Golf booking',
    });

    if (error) {
      toast.error('Booking failed: ' + error.message);
    } else {
      toast.success('Golf booking created!');
      setGolfDate(new Date());
      setGolfPeople(1);
      fetchBookings(); // Refresh bookings
    }

    setIsBooking(false);
  }

  return (
    <main className="min-h-screen relative">
      {/* Full Background Image */}
      <div className="absolute inset-0">
        <NextImage
          src="/images/golf-coming-soon-wp.png"
          alt="Virtual Golf Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Coming Soon Banner (shown when golf is not active) */}
      {!isLoadingSettings && golfSettings && !golfSettings.enabled && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="max-w-2xl mx-auto text-center p-8 bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-neonCyan/30 shadow-2xl">
            <div 
              data-editable="golf-coming-soon-emoji"
              className="text-6xl mb-6"
            >
              🏌️‍♂️
            </div>
            <h1 
              data-editable="golf-coming-soon-heading"
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-neonCyan via-neonPink to-neonBlue bg-clip-text text-transparent"
            >
              Virtual Golf Coming Soon!
            </h1>
            <div 
              data-editable="golf-coming-soon-message"
              className="text-gray-300 text-lg whitespace-pre-line mb-8"
            >
              {golfSettings.comingSoonMessage}
            </div>
            <div className="flex justify-center">
              <div 
                data-editable="golf-stay-tuned-badge"
                className="animate-pulse bg-gradient-to-r from-neonPink to-neonCyan px-8 py-4 rounded-full text-black font-semibold"
              >
                Stay Tuned for Updates!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content (shown when golf is active) */}
      {!isLoadingSettings && golfSettings?.enabled && (
        <div className="relative z-10">
          {/* Hero Section */}
          <div className="py-12">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <h1 
                data-editable="golf-active-heading"
                className="text-5xl font-bold mb-4 bg-gradient-to-r from-neonCyan via-neonPink to-neonBlue bg-clip-text text-transparent"
              >
                Book Virtual Golf
              </h1>
              <p 
                data-editable="golf-active-subtitle"
                className="text-xl text-gray-200 mb-8"
              >
                Experience the future of golf in our state-of-the-art virtual
                golf simulator
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Form */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-neonCyan/30">
                  <h2 
                    data-editable="booking-form-title"
                    className="text-2xl font-semibold mb-6 text-white"
                  >
                    Reserve Your Tee Time
                  </h2>

                  <div className="space-y-6">
                    {/* Date Picker */}
                    <div>
                      <label 
                        data-editable="date-picker-label"
                        className="block font-semibold mb-3 text-gray-200"
                      >
                        Select Date and Time:
                      </label>
                      <DatePicker
                        selected={golfDate}
                        onChange={(date) => setGolfDate(date)}
                        showTimeSelect
                        timeIntervals={60}
                        filterTime={filterBusinessHours}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full p-4 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonCyan focus:ring-2 focus:ring-neonCyan/20"
                        minDate={new Date()}
                        placeholderText="Choose your preferred time"
                      />
                      <p 
                        data-editable="available-hours-text"
                        className="text-sm text-gray-300 mt-2"
                      >
                        Available hours: 07:00 - 17:00
                      </p>
                    </div>

                    {/* Number of People */}
                    <div>
                      <label 
                        data-editable="party-size-label"
                        className="block font-semibold mb-3 text-gray-200"
                      >
                        Number of People:
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={8}
                        value={golfPeople}
                        onChange={(e) => setGolfPeople(Number(e.target.value))}
                        className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
                      />
                      <p 
                        data-editable="max-players-text"
                        className="text-sm text-gray-300 mt-2"
                      >
                        Maximum 8 players per booking
                      </p>
                    </div>

                    {/* Booking Button */}
                    <div className="pt-4">
                      <Button
                        onClick={handleFinalizeBook}
                        disabled={
                          isBooking || isTimeSlotBooked(golfDate || new Date())
                        }
                        className="w-full text-lg py-4 bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span data-editable="booking-button-text">
                          {isBooking ? 'Processing...' : 'Reserve Your Tee Time'}
                        </span>
                      </Button>
                      {isTimeSlotBooked(golfDate || new Date()) && (
                        <p className="text-red-400 text-sm mt-2 text-center">
                          This time slot is already booked
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Calendar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800/80 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-neonBlue/30 sticky top-6">
                  <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                    📅 Availability This Month
                  </h3>

                  {existingBookings.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {existingBookings.slice(0, 10).map((booking) => {
                        const bookingDate = new Date(booking.booking_date);
                        return (
                          <div
                            key={booking.id}
                            className="flex justify-between items-center p-3 bg-gray-700/60 rounded-lg"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {bookingDate.toLocaleDateString()}
                              </p>
                              <p className="text-gray-300 text-sm">
                                {bookingDate.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-red-400 text-sm font-semibold">
                                Booked
                              </p>
                              <p className="text-gray-400 text-xs">
                                {booking.party_size} players
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {existingBookings.length > 10 && (
                        <p className="text-center text-gray-400 text-sm pt-2">
                          +{existingBookings.length - 10} more bookings...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No bookings found</p>
                      <p className="text-green-400 text-sm mt-2">
                        All times available!
                      </p>
                    </div>
                  )}

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">
                      Legend:
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-gray-400">Unavailable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-400">Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoadingSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-4 border-neonCyan border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading virtual golf settings...</p>
          </div>
        </div>
      )}
    </main>
  );
}
