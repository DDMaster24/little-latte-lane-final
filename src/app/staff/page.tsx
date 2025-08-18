'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  user_id: string | null;
  status: string | null;
  total_amount: number | null;
  special_instructions: string | null;
  created_at: string | null;
  order_items: {
    menu_item_id: string | null;
    quantity: number;
    menu_items: { name: string } | null;
  }[];
  profiles: { full_name: string | null } | null;
}

interface Booking {
  id: string;
  user_id: string | null;
  booking_date: string;
  booking_time: string;
  party_size: number;
  status: string | null;
  special_requests: string | null;
  created_at: string | null;
  profiles: { full_name: string | null } | null;
}

interface StockRequest {
  item_name: string;
  description: string;
  priority: string;
}

export default function StaffPanel() {
  const { profile } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const stockRequestForm = useForm<StockRequest>();

  useEffect(() => {
    // Check if user has staff access
    if (!profile) {
      setLoading(false);
      return;
    }

    if (!profile.is_staff && !profile.is_admin) {
      router.push('/');
      return;
    }

    fetchData();
    setupRealtime();
    setLoading(false);
  }, [profile, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          menu_item_id,
          quantity,
          menu_items (name)
        ),
        profiles (full_name)
      `
      )
      .in('status', ['pending', 'confirmed', 'preparing'])
      .order('created_at', { ascending: true });

    setOrders(data || [] as Order[]);
  };

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(
        `
        *,
        profiles (full_name)
      `
      )
      .in('status', ['pending', 'confirmed'])
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    setBookings(data || []);
  };

  const fetchData = async () => {
    await Promise.all([fetchOrders(), fetchBookings()]);
  };

  const setupRealtime = () => {
    const orderSub = supabase
      .channel('staff-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        fetchOrders
      )
      .subscribe();

    const bookingSub = supabase
      .channel('staff-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        fetchBookings
      )
      .subscribe();

    return () => {
      orderSub.unsubscribe();
      bookingSub.unsubscribe();
    };
  };

  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: string
  ) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        assigned_staff_id: profile?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order status');
      console.error('Order update error:', error);
    } else {
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
      fetchOrders();
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: number,
    newStatus: string
  ) => {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: newStatus,
        assigned_staff_id: profile?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to update booking status');
      console.error('Booking update error:', error);
    } else {
      toast.success(`Booking ${bookingId} status updated to ${newStatus}`);
      fetchBookings();
    }
  };

  const handleStockRequest = async (data: StockRequest) => {
    if (!data.item_name?.trim() || !data.description?.trim()) {
      toast.error('Please fill out all required fields');
      return;
    }

    const { error } = await supabase.from('staff_requests').insert({
      user_id: profile?.id,
      request_type: 'inventory',
      message: `Stock Request: ${data.item_name} - ${data.description}`,
      priority: data.priority || 'medium',
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to submit stock request');
      console.error('Stock request error:', error);
    } else {
      toast.success('Stock request submitted successfully');
      stockRequestForm.reset();
    }
  };

  const formatDateTime = (date: string, time?: string) => {
    const dateObj = new Date(`${date}${time ? `T${time}` : ''}`);
    return dateObj.toLocaleString('en-ZA', {
      dateStyle: 'medium',
      timeStyle: time ? 'short' : undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-orange-500';
      case 'ready':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || (!profile.is_staff && !profile.is_admin)) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neonText mb-4">
            Access Denied
          </h1>
          <p className="text-gray-400 mb-4">
            You need staff privileges to access this panel.
          </p>
          <Button onClick={() => router.push('/')} className="neon-button">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-2">
            Staff Panel
          </h1>
          <p className="text-gray-400">
            Welcome, {profile.full_name || 'Staff Member'}! Manage orders,
            bookings, and requests.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-neonCyan">
            <CardHeader className="pb-3">
              <CardTitle className="text-neonCyan">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {orders.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-neonPink">
            <CardHeader className="pb-3">
              <CardTitle className="text-neonPink">Pending Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {bookings.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-500">
                Today&apos;s Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {orders.length + bookings.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Orders Management */}
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-neonCyan">Order Management</CardTitle>
              <CardDescription>
                Manage incoming orders and update their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No active orders
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-600 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">
                            Order #{order.id}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {order.profiles?.full_name} •{' '}
                            {formatDateTime(order.created_at)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {order.delivery_type.charAt(0).toUpperCase() +
                              order.delivery_type.slice(1)}{' '}
                            • R{order.total.toFixed(2)}
                          </p>
                        </div>
                        <Badge
                          className={`${getStatusColor(order.status)} text-white`}
                        >
                          {order.status}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-300">
                          Items:
                        </p>
                        {order.order_items.map((item, idx) => (
                          <p key={idx} className="text-sm text-gray-400 ml-2">
                            • {item.menu_items?.name} × {item.quantity}
                          </p>
                        ))}
                      </div>

                      {order.special_instructions && (
                        <div className="bg-gray-700 p-2 rounded">
                          <p className="text-sm font-medium text-gray-300">
                            Special Instructions:
                          </p>
                          <p className="text-sm text-gray-400">
                            {order.special_instructions}
                          </p>
                        </div>
                      )}

                      <Select
                        value={order.status || ''}
                        onValueChange={(value) =>
                          handleUpdateOrderStatus(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bookings Management */}
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-neonPink">
                Booking Management
              </CardTitle>
              <CardDescription>
                Manage table and golf simulator bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No pending bookings
                </p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-600 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">
                            {booking.type.charAt(0).toUpperCase() +
                              booking.type.slice(1)}{' '}
                            Booking #{booking.id}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {booking.profiles?.full_name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDateTime(booking.date, booking.booking_time)} •{' '}
                            {booking.party_size} people
                          </p>
                        </div>
                        <Badge
                          className={`${getStatusColor(booking.status)} text-white`}
                        >
                          {booking.status}
                        </Badge>
                      </div>

                      {booking.special_requests && (
                        <div className="bg-gray-700 p-2 rounded">
                          <p className="text-sm font-medium text-gray-300">
                            Special Requests:
                          </p>
                          <p className="text-sm text-gray-400">
                            {booking.special_requests}
                          </p>
                        </div>
                      )}

                      <Select
                        value={booking.status || ''}
                        onValueChange={(value) =>
                          handleUpdateBookingStatus(booking.id, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="no_show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stock Request Form */}
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="text-yellow-500">Stock Request</CardTitle>
            <CardDescription>
              Request inventory items or supplies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={stockRequestForm.handleSubmit(handleStockRequest)}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <Input
                placeholder="Item name"
                {...stockRequestForm.register('item_name', { required: true })}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Description/reason"
                {...stockRequestForm.register('description', {
                  required: true,
                })}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Select
                onValueChange={(value) =>
                  stockRequestForm.setValue('priority', value)
                }
                defaultValue="medium"
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="neon-button">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
