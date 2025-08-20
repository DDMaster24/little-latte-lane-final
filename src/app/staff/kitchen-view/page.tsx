'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getStaffOrders, updateOrderStatus } from '@/app/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  user_id: string | null;
  status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  created_at: string | null;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    menu_item_id: string | null;
    menu_items: {
      name: string;
      category_id: string | null;
    } | null;
  }[];
}

interface StockRequest {
  item_id: number;
  message: string;
}

export default function KitchenDashboard() {
  const { profile } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const requestForm = useForm<StockRequest>();

  const fetchOrders = useCallback(async () => {
    try {
      console.log('🍳 Kitchen: Fetching orders via server action...');
      const result = await getStaffOrders();
      
      if (!result.success) {
        console.error('❌ Kitchen: Error fetching orders:', result.error);
        toast.error('Failed to fetch orders');
        return;
      }

      console.log(`🍳 Kitchen: Fetched ${result.data.length} orders`);
      setOrders(result.data as Order[]); // Type assertion for compatibility
    } catch (error) {
      console.error('💥 Kitchen: Unexpected error fetching orders:', error);
      toast.error('Unexpected error occurred');
    }
  }, []);

  useEffect(() => {
    if (!profile?.is_staff && !profile?.is_admin) {
      router.push('/');
      return;
    }

    fetchOrders();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [profile, router, fetchOrders]);

  const formatTime = (iso: string | null) => {
    if (!iso) return 'Unknown';
    return new Date(iso).toLocaleString('en-ZA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const result = await updateOrderStatus(id, newStatus);
      
      if (!result.success) {
        toast.error('Failed to update order status');
        console.error('❌ Kitchen: Error updating order:', result.error);
        return;
      }

      toast.success('Order status updated');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('💥 Kitchen: Unexpected error updating order:', error);
    }
  };

  const handleStockRequest = async (data: StockRequest) => {
    // TODO: Create server action for stock requests
    toast.error('Stock request feature needs implementation');
    console.log('Stock request data:', data);
  };

  return (
    <div className="min-h-screen bg-darkBg text-neonText p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-darkBg/60 backdrop-blur-md border-2 border-neonCyan/50 rounded-lg p-6">
          <h2 className="text-3xl font-bold text-neonCyan mb-2">Kitchen Dashboard</h2>
          <p className="text-neonText/70">Real-time order management for kitchen staff</p>
        </div>

        {/* Orders */}
        <div className="bg-darkBg/60 backdrop-blur-md border-2 border-neonPink/50 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-neonPink">Active Orders</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No active orders</p>
              <p className="text-sm text-gray-500 mt-2">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="bg-darkBg/30 backdrop-blur-sm rounded-lg">
                <TableHeader>
                  <TableRow className="border-neonCyan/30">
                    <TableHead className="text-neonCyan">Order ID</TableHead>
                    <TableHead className="text-neonCyan">Created</TableHead>
                    <TableHead className="text-neonCyan">Items</TableHead>
                    <TableHead className="text-neonCyan">Total</TableHead>
                    <TableHead className="text-neonCyan">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-neonPink/20 hover:bg-neonPink/5">
                      <TableCell className="font-mono text-xs text-white">
                        #{order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {formatTime(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {order.order_items.map((item, idx) => (
                            <li key={idx} className="text-neonText">
                              <span className="text-neonPink">{item.menu_items?.name || 'Unknown Item'}</span> × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell className="font-semibold text-neonCyan">
                        R{order.total_amount?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Select
                          onValueChange={(value) =>
                            handleUpdateStatus(order.id, value)
                          }
                          defaultValue={order.status || 'confirmed'}
                        >
                          <SelectTrigger className="text-xs text-neonPink bg-darkBg/80 backdrop-blur-sm border-neonPink/50 focus:border-neonCyan focus:ring-neonCyan/20">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-darkBg/95 backdrop-blur-lg border-neonPink/50">
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Stock Request - Temporarily disabled */}
        <div className="bg-darkBg/60 backdrop-blur-md border-2 border-purple-400/50 rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-purple-400">Request Stock</h3>
          <p className="text-purple-400/70 text-sm">Feature temporarily disabled - needs server action implementation</p>
          <form
            onSubmit={requestForm.handleSubmit(handleStockRequest)}
            className="flex flex-col sm:flex-row gap-4 opacity-50"
          >
            <Input
              type="number"
              placeholder="Item ID"
              disabled
              {...requestForm.register('item_id', { valueAsNumber: true })}
              className="bg-darkBg/80 backdrop-blur-sm border-purple-400/50 text-purple-400 placeholder:text-purple-400/50 focus:border-neonCyan focus:ring-neonCyan/20"
            />
            <Input 
              placeholder="Message" 
              disabled
              {...requestForm.register('message')} 
              className="bg-darkBg/80 backdrop-blur-sm border-purple-400/50 text-purple-400 placeholder:text-purple-400/50 focus:border-neonCyan focus:ring-neonCyan/20"
            />
            <Button 
              type="submit"
              disabled
              className="bg-purple-400 text-black hover:bg-purple-400/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 font-medium"
            >
              Request Stock
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}