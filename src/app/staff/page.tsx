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
  order_number: string | null;
  payment_status: string | null;
  updated_at: string | null;
  order_items: {
    id: string;
    menu_item_id: string | null;
    quantity: number;
    price: number | null;
    special_instructions: string | null;
    menu_items: { name: string; category_id: string | null } | null;
  }[];
  profiles: { full_name: string | null; email: string | null } | null;
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
  updated_at: string | null;
  name: string;
  email: string;
  phone: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
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
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            id,
            menu_item_id,
            quantity,
            price,
            special_instructions,
            menu_items (
              name,
              category_id
            )
          ),
          profiles (
            full_name,
            email
          )
        `
        )
        .in('status', ['confirmed', 'preparing', 'ready'])
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Staff Panel: Error fetching orders:', error);
        toast.error('Failed to fetch orders');
        return;
      }

      console.log(`✅ Staff Panel: Fetched ${data?.length || 0} orders at ${new Date().toLocaleTimeString()}`);
      console.log('📋 Staff Panel: Orders data:', data?.map(o => ({ 
        id: o.id, 
        order_number: o.order_number,
        status: o.status, 
        payment_status: o.payment_status,
        total: o.total_amount 
      })));
      setOrders(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Unexpected error fetching orders:', error);
      toast.error('Unexpected error occurred');
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          *,
          profiles (
            full_name,
            email
          )
        `
        )
        .in('status', ['pending', 'confirmed'])
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to fetch bookings');
        return;
      }

      console.log(`Fetched ${data?.length || 0} bookings at ${new Date().toLocaleTimeString()}`);
      setBookings(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Unexpected error fetching bookings:', error);
      toast.error('Unexpected error occurred');
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchOrders(), fetchBookings()]);
  };

  const setupRealtime = () => {
    console.log('Setting up real-time subscriptions...');
    let connectedCount = 0;
    
    // Orders subscription with detailed logging
    const orderSub = supabase
      .channel('staff-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Orders real-time update:', payload);
          setLastUpdate(new Date());
          fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log('Orders subscription status:', status);
        if (status === 'SUBSCRIBED') {
          connectedCount++;
          if (connectedCount === 3) {
            setRealtimeConnected(true);
            toast.success('Real-time updates connected');
          }
        }
      });

    // Bookings subscription with detailed logging
    const bookingSub = supabase
      .channel('staff-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('Bookings real-time update:', payload);
          setLastUpdate(new Date());
          fetchBookings();
        }
      )
      .subscribe((status) => {
        console.log('Bookings subscription status:', status);
        if (status === 'SUBSCRIBED') {
          connectedCount++;
          if (connectedCount === 3) {
            setRealtimeConnected(true);
            toast.success('Real-time updates connected');
          }
        }
      });

    // Order items subscription for real-time menu updates
    const orderItemsSub = supabase
      .channel('staff-order-items-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        (payload) => {
          console.log('Order items real-time update:', payload);
          setLastUpdate(new Date());
          fetchOrders(); // Refresh orders when items change
        }
      )
      .subscribe((status) => {
        console.log('Order items subscription status:', status);
        if (status === 'SUBSCRIBED') {
          connectedCount++;
          if (connectedCount === 3) {
            setRealtimeConnected(true);
            toast.success('Real-time updates connected');
          }
        }
      });

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      setRealtimeConnected(false);
      orderSub.unsubscribe();
      bookingSub.unsubscribe();
      orderItemsSub.unsubscribe();
    };
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order status');
      console.error('Order update error:', error);
    } else {
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      // Don't refetch, let real-time handle it
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: string
  ) => {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to update booking status');
      console.error('Booking update error:', error);
    } else {
      toast.success(`Booking #${bookingId} status updated to ${newStatus}`);
      // Don't refetch, let real-time handle it
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

  const formatDateTime = (date: string | null, time?: string) => {
    if (!date) return 'Unknown date';
    const dateObj = new Date(`${date}${time ? `T${time}` : ''}`);
    return dateObj.toLocaleString('en-ZA', {
      dateStyle: 'medium',
      timeStyle: time ? 'short' : undefined,
    });
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-400';
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
          
          {/* Real-time Status Indicator */}
          <div className="flex justify-center items-center mt-3 space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-sm text-gray-400">
                {realtimeConnected ? 'Real-time connected' : 'Connecting...'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-neonCyan">Order Management</CardTitle>
                  <CardDescription>
                    Manage incoming orders and update their status
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchOrders}
                  variant="outline"
                  size="sm"
                  className="text-neonCyan border-neonCyan hover:bg-neonCyan hover:text-black"
                >
                  Refresh
                </Button>
              </div>
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
                            {order.profiles?.full_name || 'Guest'} •{' '}
                            {formatDateTime(order.created_at)}
                          </p>
                          <p className="text-sm text-gray-400">
                            Order #{order.order_number || order.id.slice(0, 8)}{' '}
                            • R{(order.total_amount || 0).toFixed(2)}
                          </p>
                        </div>
                        <Badge
                          className={`${getStatusColor(order.status)} text-white`}
                        >
                          {order.status || 'unknown'}
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-neonPink">
                    Booking Management
                  </CardTitle>
                  <CardDescription>
                    Manage table and golf simulator bookings
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchBookings}
                  variant="outline"
                  size="sm"
                  className="text-neonPink border-neonPink hover:bg-neonPink hover:text-black"
                >
                  Refresh
                </Button>
              </div>
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
                            Table Booking #{booking.id.slice(0, 8)}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {booking.profiles?.full_name || booking.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatDateTime(booking.booking_date, booking.booking_time)} •{' '}
                            {booking.party_size} people
                          </p>
                        </div>
                        <Badge
                          className={`${getStatusColor(booking.status)} text-white`}
                        >
                          {booking.status || 'unknown'}
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
