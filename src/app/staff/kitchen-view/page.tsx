'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getSupabaseClient } from '@/lib/supabase-client';
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
      id: string;
      name: string;
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
  const supabase = getSupabaseClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const requestForm = useForm<StockRequest>();

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        status,
        payment_status,
        total_amount,
        created_at,
        order_items (
          id,
          quantity,
          price,
          menu_item_id,
          menu_items (
            id,
            name
          )
        )
      `)
      .in('status', ['confirmed', 'preparing', 'ready'])
      .eq('payment_status', 'paid')
      .neq('status', 'draft') // EXCLUDE draft orders - not visible to kitchen until payment confirmed
      .order('created_at', { ascending: true });
    
    console.log('🍳 Kitchen orders fetched:', data?.length || 0);
    setOrders(data || []);
  }, [supabase]);

  useEffect(() => {
    if (!profile?.is_staff && !profile?.is_admin) {
      router.push('/');
      return;
    }

    fetchOrders();

    const orderSub = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        fetchOrders
      )
      .subscribe();

    return () => {
      void orderSub.unsubscribe();
    };
  }, [profile, router, fetchOrders, supabase]);

  const formatTime = (iso: string | null) => {
    if (!iso) return 'Unknown time';
    return new Date(iso).toLocaleString('en-ZA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) {
      toast.error('Failed to update order');
    } else {
      toast.success('Order status updated');
      fetchOrders();
    }
  };

  const handleStockRequest = async (data: StockRequest) => {
    if (!data.item_id || !data.message.trim()) {
      toast.error('Please fill out all fields');
      return;
    }

    const { error } = await supabase
      .from('staff_requests')
      .insert({ ...data, staff_id: profile!.id }); // profile.id is now safely available

    if (error) {
      toast.error('Request failed');
    } else {
      toast.success('Request sent');
      requestForm.reset();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-neonText">Kitchen Dashboard</h2>

      {/* Orders */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Active Orders</h3>
        {orders.length === 0 ? (
          <p className="text-muted text-sm">No orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatTime(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <ul className="text-sm list-disc list-inside">
                      {order.order_items.map((item, idx) => (
                        <li key={idx}>
                          {item.menu_items?.name || 'Unknown Item'} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="font-semibold">
                    R{order.total_amount?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) =>
                        handleUpdateStatus(order.id, value)
                      }
                      defaultValue={order.status || 'confirmed'}
                    >
                      <SelectTrigger className="text-xs text-white bg-gray-800">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
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
        )}
      </div>

      {/* Stock Request */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Request Stock</h3>
        <form
          onSubmit={requestForm.handleSubmit(handleStockRequest)}
          className="flex flex-col sm:flex-row gap-2"
        >
          <Input
            type="number"
            placeholder="Item ID"
            {...requestForm.register('item_id', { valueAsNumber: true })}
          />
          <Input placeholder="Message" {...requestForm.register('message')} />
          <Button type="submit">Request</Button>
        </form>
      </div>
    </div>
  );
}
