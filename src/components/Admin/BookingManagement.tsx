'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getSupabaseClient } from '@/lib/supabase-client';
import { 
  Calendar, Clock, Users, Phone, Mail,
  Search, RefreshCw, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  booking_date: string;
  booking_time: string;
  party_size: number;
  special_requests: string | null;
  status: string | null;
  created_at: string | null;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const supabase = getSupabaseClient();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      
        const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: true });      if (error) throw error;

      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));

      toast.success('Booking status updated');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone?.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500 text-white">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBookingStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const completed = bookings.filter(b => b.status === 'completed').length;

    return { total, pending, confirmed, cancelled, completed };
  };

  const stats = getBookingStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-neonCyan" />
        <span className="ml-2 text-gray-300">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Management</h2>
          <p className="text-gray-400">Manage restaurant table bookings and reservations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchBookings} className="neon-button">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <Calendar className="h-12 w-12 text-neonCyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
              </div>
              <AlertCircle className="h-12 w-12 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Confirmed</p>
                <p className="text-3xl font-bold text-white">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Cancelled</p>
                <p className="text-3xl font-bold text-white">{stats.cancelled}</p>
              </div>
              <XCircle className="h-12 w-12 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-3xl font-bold text-white">{stats.completed}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search bookings by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700/50 text-white"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant={statusFilter === status ? 'default' : 'outline'}
              className={
                statusFilter === status 
                  ? 'bg-neonCyan text-black' 
                  : 'border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neonCyan" />
            Bookings ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(booking.status)}
                        <div>
                          <h3 className="text-white font-medium text-lg">
                            {booking.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(booking.booking_date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(booking.booking_time)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {booking.party_size} guests
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400 mb-3">
                        {booking.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {booking.email}
                          </div>
                        )}
                        {booking.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.phone}
                          </div>
                        )}
                      </div>

                      {booking.special_requests && (
                        <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-300">
                            <strong>Special Requests:</strong> {booking.special_requests}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                          </Button>
                          <Button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No bookings found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
