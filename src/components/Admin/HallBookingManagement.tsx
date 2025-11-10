'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Users, DollarSign, FileText, Check, X, Eye, Mail } from 'lucide-react';

interface HallBooking {
  id: string;
  booking_reference: string;
  user_id: string;
  status: string;
  applicant_name: string;
  applicant_surname: string;
  applicant_email: string;
  applicant_phone: string;
  roberts_estate_address: string;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  event_type: string;
  total_guests: number;
  number_of_vehicles: number;
  total_amount: number;
  deposit_amount: number;
  payment_status: string;
  terms_accepted: boolean;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  pending_payment: 'bg-yellow-500',
  payment_processing: 'bg-blue-500',
  confirmed: 'bg-green-500',
  completed: 'bg-purple-500',
  deposit_refunded: 'bg-teal-500',
  cancelled: 'bg-red-500',
  rejected: 'bg-red-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_payment: 'Pending Payment',
  payment_processing: 'Processing',
  confirmed: 'Confirmed',
  completed: 'Completed',
  deposit_refunded: 'Deposit Refunded',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

export default function HallBookingManagement() {
  const [bookings, setBookings] = useState<HallBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<HallBooking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from('hall_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('hall_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Booking status updated to ${statusLabels[newStatus]}`);
      fetchBookings();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    pending: bookings.filter((b) => b.status === 'pending_payment').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-neonCyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">🏛️ Roberts Hall Bookings</h2>
          <p className="text-gray-400 mt-1">Manage hall rental bookings and payments</p>
        </div>
        <Button onClick={fetchBookings} variant="outline" className="border-neonCyan/50 text-neonCyan">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-sm flex items-center gap-2">
              <Check className="h-4 w-4" />
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.confirmed}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pending Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
              <Check className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'confirmed', 'pending_payment', 'completed', 'cancelled'].map((status) => (
          <Button
            key={status}
            onClick={() => setFilter(status)}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            className={filter === status ? 'bg-neonCyan text-black' : 'border-gray-600 text-gray-300'}
          >
            {status === 'all' ? 'All Bookings' : statusLabels[status] || status}
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="grid gap-4">
        {bookings.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card
              key={booking.id}
              className="bg-gray-800/50 border-gray-700 hover:border-neonCyan/50 transition-all cursor-pointer"
              onClick={() => setSelectedBooking(booking)}
            >
              <CardContent className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  {/* Booking Reference & Customer */}
                  <div>
                    <p className="text-xs text-gray-400">Ref #{booking.booking_reference}</p>
                    <p className="text-white font-semibold">
                      {booking.applicant_name} {booking.applicant_surname}
                    </p>
                    <p className="text-xs text-gray-500">{booking.applicant_email}</p>
                  </div>

                  {/* Event Details */}
                  <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Event Date
                    </p>
                    <p className="text-white font-medium">{formatDate(booking.event_date)}</p>
                    <p className="text-xs text-gray-500">
                      {booking.event_start_time} - {booking.event_end_time}
                    </p>
                  </div>

                  {/* Guests & Vehicles */}
                  <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Guests & Vehicles
                    </p>
                    <p className="text-white">{booking.total_guests} guests</p>
                    <p className="text-xs text-gray-500">{booking.number_of_vehicles} vehicles</p>
                  </div>

                  {/* Payment */}
                  <div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Payment
                    </p>
                    <p className="text-white font-semibold">R {booking.total_amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {booking.payment_status === 'paid' ? '✅ Paid' : '⏳ ' + booking.payment_status}
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col gap-2">
                    <Badge className={`${statusColors[booking.status]} text-white w-fit`}>
                      {statusLabels[booking.status]}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                        className="bg-neonCyan/20 hover:bg-neonCyan/30 text-neonCyan"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neonCyan/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white">Booking Details</h3>
                  <p className="text-gray-400">Reference: {selectedBooking.booking_reference}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Status Badge */}
              <Badge className={`${statusColors[selectedBooking.status]} text-white text-base px-4 py-2`}>
                {statusLabels[selectedBooking.status]}
              </Badge>

              {/* Applicant Information */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-neonCyan mb-3">👤 Applicant Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <p className="text-white font-medium">
                      {selectedBooking.applicant_name} {selectedBooking.applicant_surname}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <p className="text-white font-medium">{selectedBooking.applicant_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <p className="text-white font-medium">{selectedBooking.applicant_phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Roberts Estate Address:</span>
                    <p className="text-white font-medium">{selectedBooking.roberts_estate_address}</p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-neonPink mb-3">🎉 Event Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Event Type:</span>
                    <p className="text-white font-medium">{selectedBooking.event_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Event Date:</span>
                    <p className="text-white font-medium">{formatDate(selectedBooking.event_date)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Start Time:</span>
                    <p className="text-white font-medium">{selectedBooking.event_start_time}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">End Time:</span>
                    <p className="text-white font-medium">{selectedBooking.event_end_time}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Guests:</span>
                    <p className="text-white font-medium">{selectedBooking.total_guests}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Vehicles:</span>
                    <p className="text-white font-medium">{selectedBooking.number_of_vehicles}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-400 mb-3">💰 Payment Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Total Amount:</span>
                    <p className="text-white font-bold text-lg">
                      R {selectedBooking.total_amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Payment Status:</span>
                    <p className="text-white font-medium">{selectedBooking.payment_status}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Deposit Amount:</span>
                    <p className="text-white font-medium">R {selectedBooking.deposit_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Terms Accepted:</span>
                    <p className="text-white font-medium">
                      {selectedBooking.terms_accepted ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">⚙️ Admin Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.status !== 'confirmed' && selectedBooking.status !== 'rejected' && (
                    <Button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </Button>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <Button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}
                  {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'rejected' && (
                    <Button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'rejected')}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Booking
                    </Button>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setSelectedBooking(null)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
