'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Truck, Package, AlertCircle } from 'lucide-react';

interface Order {
  id: number;
  total: number;
  status: string;
  payment_status?: string;
  delivery_type: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  draft: { color: 'bg-gray-500', icon: Clock, text: 'Payment Pending' }, // Should not show to customers
  confirmed: {
    color: 'bg-blue-500',
    icon: CheckCircle,
    text: 'Payment Confirmed - Order Received',
  },
  preparing: {
    color: 'bg-orange-500',
    icon: Package,
    text: 'Kitchen is Preparing Your Order',
  },
  ready: {
    color: 'bg-green-500',
    icon: Truck,
    text: 'Ready for Pickup/Delivery',
  },
  completed: {
    color: 'bg-gray-500',
    icon: CheckCircle,
    text: 'Order Completed',
  },
  cancelled: {
    color: 'bg-red-500',
    icon: AlertCircle,
    text: 'Order Cancelled',
  },
};

export default function OrderTracking() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadOrders();
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrders = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', profile.id)
        .neq('status', 'draft') // Exclude draft orders (unpaid)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return (
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.confirmed
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-black/50 backdrop-blur-md border-neon-blue/50">
          <CardContent className="text-center p-8">
            <p className="text-neon-blue">Please log in to view your orders.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
          <p className="text-neon-green">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-black/50 backdrop-blur-md border-neon-green/50">
        <CardHeader>
          <CardTitle className="text-neon-green flex items-center gap-2">
            <Package className="h-6 w-6" />
            Your Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neon-blue mb-4">No orders found</p>
              <Button
                onClick={() => (window.location.href = '/menu')}
                className="bg-neon-green text-black hover:bg-neon-green/80"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={order.id}
                    className="bg-black/30 border-neon-blue/30"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-neon-green font-semibold">
                            Order #{order.id}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-neon-blue font-semibold">
                            R{order.total.toFixed(2)}
                          </p>
                          <Badge
                            className={`${statusInfo.color} text-white text-xs`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.text}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="text-neon-blue ml-2 capitalize">
                            {order.delivery_type}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Payment:</span>
                          <span className="text-neon-blue ml-2 capitalize">
                            {order.payment_status || 'Pending'}
                          </span>
                        </div>
                      </div>

                      {order.status === 'ready' && (
                        <div className="mt-3 p-2 bg-green-900/20 border border-green-500/30 rounded">
                          <p className="text-green-300 text-sm">
                            🎉 Your order is ready! Please come for{' '}
                            {order.delivery_type === 'delivery'
                              ? 'delivery'
                              : 'pickup'}
                            .
                          </p>
                        </div>
                      )}

                      {order.status === 'preparing' && (
                        <div className="mt-3 p-2 bg-orange-900/20 border border-orange-500/30 rounded">
                          <p className="text-orange-300 text-sm">
                            👨‍🍳 Your order is being prepared. Estimated time:
                            15-20 minutes.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
