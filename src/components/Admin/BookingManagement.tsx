'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSupabaseClient } from '@/lib/supabase-client';
import { getBookingInquiries } from '@/app/admin/actions';
import { 
  Mail, Calendar, Users, Phone,
  RefreshCw, Clock, MessageSquare
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
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

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
          <h2 className="text-2xl font-bold text-white mb-2">Booking Inquiries</h2>
          <p className="text-gray-400">Recent contact form submissions from customers</p>
        </div>
        <Button onClick={fetchInquiries} className="neon-button">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Inquiries List */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neonPink" />
            Customer Inquiries ({inquiries.length})
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
                          <p className="text-sm text-gray-300">
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
    </div>
  );
}
