'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSupabaseClient } from '@/lib/supabase-client';
import { getBookingInquiries } from '@/app/admin/actions';
import {
  Mail, Calendar, Users, Phone,
  RefreshCw, Clock, MessageSquare, MapPin, FileText, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  party_size: number | null;
  event_type: string | null;
  message: string | null;
  status: string | null;
  created_at: string | null;
}

export default function BookingManagement() {
  const [inquiries, setInquiries] = useState<ContactSubmission[]>([]);
  const [hallBookings, setHallBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'hall'>('hall');

  const supabase = getSupabaseClient();

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getBookingInquiries();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch inquiries');
      }

      setInquiries(result.data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHallBookings = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('hall_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHallBookings(data || []);
    } catch (error) {
      console.error('Error fetching hall bookings:', error);
      toast.error('Failed to load hall bookings');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setInquiries(prev => prev.map(inquiry =>
        inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry
      ));

      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const updateHallBookingStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('hall_bookings')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setHallBookings(prev => prev.map(booking =>
        booking.id === id ? { ...booking, status: newStatus } : booking
      ));

      toast.success('Hall booking status updated');
    } catch (error) {
      console.error('Error updating hall booking status:', error);
      toast.error('Failed to update hall booking status');
    }
  };

  useEffect(() => {
    if (activeSubTab === 'tables') {
      fetchInquiries();
    } else {
      fetchHallBookings();
    }
  }, [activeSubTab, fetchInquiries, fetchHallBookings]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-500 text-white">Contacted</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500 text-white">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Not specified';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-neonCyan" />
        <span className="ml-2 text-gray-300">Loading inquiries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Management</h2>
          <p className="text-gray-400">Manage table bookings and Roberts Hall reservations</p>
        </div>
        <Button
          onClick={() => activeSubTab === 'tables' ? fetchInquiries() : fetchHallBookings()}
          className="neon-button"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveSubTab('hall')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeSubTab === 'hall'
              ? 'bg-neonPink text-black'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <MapPin className="h-4 w-4" />
          Roberts Hall Bookings ({hallBookings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tables')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all ${
            activeSubTab === 'tables'
              ? 'bg-neonCyan text-black'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Table Inquiries ({inquiries.length})
        </button>
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'hall' ? (
        // ROBERTS HALL BOOKINGS
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-neonPink" />
              Roberts Hall Bookings ({hallBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hallBookings.length > 0 ? (
                hallBookings.map((booking) => {
                  const getHallStatusBadge = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'confirmed':
                        return <Badge className="bg-green-500 text-white">Confirmed</Badge>;
                      case 'pending_payment':
                        return <Badge className="bg-yellow-500 text-black">Pending Payment</Badge>;
                      case 'payment_processing':
                        return <Badge className="bg-blue-500 text-white">Processing</Badge>;
                      case 'cancelled':
                        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
                      default:
                        return <Badge variant="outline">{status}</Badge>;
                    }
                  };

                  return (
                    <div key={booking.id} className="bg-gray-700/30 rounded-lg p-4 border-2 border-neonPink/20">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Booking Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="text-white font-medium text-lg">
                                {booking.applicant_name} {booking.applicant_surname}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                Booking Ref: {booking.booking_reference}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Created: {new Date(booking.created_at).toLocaleString('en-ZA')}
                              </p>
                            </div>
                            <div className="ml-auto">
                              {getHallStatusBadge(booking.status)}
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="bg-neonPink/5 border border-neonPink/20 rounded-lg p-4 mb-4">
                            <h4 className="text-neonPink font-semibold mb-3">Event Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs text-gray-400">Event Type</p>
                                <p className="text-white text-sm">{booking.event_type || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Event Date</p>
                                <p className="text-white text-sm">
                                  {new Date(booking.event_date).toLocaleDateString('en-ZA', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Time</p>
                                <p className="text-white text-sm">{booking.event_start_time} - {booking.event_end_time}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Guests</p>
                                <p className="text-white text-sm">{booking.total_guests} people</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Vehicles</p>
                                <p className="text-white text-sm">{booking.number_of_vehicles} vehicles</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Tables / Chairs</p>
                                <p className="text-white text-sm">{booking.tables_required} / {booking.chairs_required}</p>
                              </div>
                            </div>
                          </div>

                          {/* Contact & Address */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Mail className="w-4 h-4 text-neonCyan" />
                              <span>{booking.applicant_email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Phone className="w-4 h-4 text-neonCyan" />
                              <span>{booking.applicant_phone}</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-300 col-span-full">
                              <MapPin className="w-4 h-4 text-neonCyan mt-0.5" />
                              <span>{booking.address}</span>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                            <h4 className="text-white font-semibold text-sm mb-2">Payment Details</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-400">Rental Fee:</span>
                                <span className="text-white ml-2">R{booking.rental_fee?.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Deposit:</span>
                                <span className="text-white ml-2">R{booking.deposit_amount?.toFixed(2)}</span>
                              </div>
                              <div className="col-span-2 font-bold border-t border-gray-600 pt-2">
                                <span className="text-neonPink">Total Amount:</span>
                                <span className="text-neonPink ml-2">R{booking.total_amount?.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Uploaded Documents */}
                          {(booking.proof_of_payment_url || booking.signature_url) && (
                            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                              <h4 className="text-white font-semibold text-sm mb-2">Uploaded Documents</h4>
                              <div className="flex flex-wrap gap-2">
                                {booking.proof_of_payment_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-neonCyan text-neonCyan"
                                    onClick={() => window.open(booking.proof_of_payment_url, '_blank')}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Bank Proof
                                  </Button>
                                )}
                                {booking.signature_url && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-neonPink text-neonPink"
                                    onClick={() => window.open(booking.signature_url, '_blank')}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    View Signature
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Status Actions */}
                          <div className="flex flex-wrap gap-2">
                            {booking.status === 'pending_payment' && (
                              <Button
                                onClick={() => updateHallBookingStatus(booking.id, 'cancelled')}
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                Cancel Booking
                              </Button>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button
                                onClick={() => updateHallBookingStatus(booking.id, 'completed')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Mark as Completed
                              </Button>
                            )}
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <Button
                                onClick={() => updateHallBookingStatus(booking.id, 'cancelled')}
                                size="sm"
                                variant="outline"
                                className="border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No Roberts Hall bookings found</p>
                  <p className="text-gray-500 text-sm mt-2">Hall bookings will appear here when customers make reservations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        // TABLE INQUIRIES (EXISTING CODE)
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neonCyan" />
              Table Booking Inquiries ({inquiries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inquiries.length > 0 ? (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Inquiry Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <h3 className="text-white font-medium text-lg">
                            {inquiry.name}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Submitted on {new Date(inquiry.created_at || '').toLocaleString('en-ZA')}
                          </p>
                        </div>
                        <div className="ml-auto">
                          {getStatusBadge(inquiry.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Mail className="w-4 h-4 text-neonCyan" />
                          <span>{inquiry.email}</span>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Phone className="w-4 h-4 text-neonCyan" />
                            <span>{inquiry.phone}</span>
                          </div>
                        )}
                        {inquiry.party_size && (
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Users className="w-4 h-4 text-neonCyan" />
                            <span>{inquiry.party_size} people</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Calendar className="w-4 h-4 text-neonCyan" />
                          <span>{formatDate(inquiry.preferred_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Clock className="w-4 h-4 text-neonCyan" />
                          <span>{formatTime(inquiry.preferred_time)}</span>
                        </div>
                        {inquiry.event_type && (
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <MessageSquare className="w-4 h-4 text-neonCyan" />
                            <span>{inquiry.event_type}</span>
                          </div>
                        )}
                      </div>

                      {inquiry.message && (
                        <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-300 break-words overflow-wrap-anywhere max-w-full">
                            <strong className="text-white">Message:</strong> {inquiry.message}
                          </p>
                        </div>
                      )}

                      {/* Status Actions */}
                      <div className="flex flex-wrap gap-2">
                        {inquiry.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => updateStatus(inquiry.id, 'contacted')}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Mark as Contacted
                            </Button>
                            <Button
                              onClick={() => updateStatus(inquiry.id, 'confirmed')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Confirm Booking
                            </Button>
                          </>
                        )}
                        {inquiry.status === 'contacted' && (
                          <Button
                            onClick={() => updateStatus(inquiry.id, 'confirmed')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Confirm Booking
                          </Button>
                        )}
                        <Button
                          onClick={() => updateStatus(inquiry.id, 'cancelled')}
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No inquiries found</p>
                <p className="text-gray-500 text-sm mt-2">Customer inquiries will appear here when submitted</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
