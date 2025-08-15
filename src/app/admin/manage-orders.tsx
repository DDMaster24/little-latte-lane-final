'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Added this import for proper typing of real-time payload
import { useAuth } from '@/components/AuthProvider';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVerticalIcon } from 'lucide-react';
import { updateOrderStatus } from './actions';
import toast from 'react-hot-toast';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Array<{
    menu_items: { name: string; price: number };
    quantity: number;
  }>;
  profiles: { full_name: string };
};


const statusOptions = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
  'cancelled',
] as const;

export default function ManageOrders() {
  const supabase = createClientComponentClient<Database>();
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile || profile.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      // Fetch all orders with joins
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            menu_items:menu_item_id (name, price)
          ),
          profiles!user_id (username),
          assigned_staff:profiles!assigned_staff_id (username)
        `
        )
        .order('created_at', { ascending: false });

      if (ordersError) {
        setError(`Error fetching orders: ${ordersError.message}`);
        setIsLoading(false);
        return;
      }

      setOrders(ordersData || []);
      setIsLoading(false);
    };

    fetchData();

    // Real-time subscription for orders with proper typing
    const ordersSubscription = supabase
      .channel('orders-channel')
      .on<Database['public']['Tables']['orders']['Row']>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (
          payload: RealtimePostgresChangesPayload<
            Database['public']['Tables']['orders']['Row']
          >
        ) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new order with joins
            supabase
              .from('orders')
              .select(
                `
                *,
                order_items (
                  *,
                  menu_items:menu_item_id (name, price)
                ),
                profiles!user_id (username),
                assigned_staff:profiles!assigned_staff_id (username)
              `
              )
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) setOrders((prev) => [data, ...prev]);
              });
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) =>
              prev.filter((order) => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, [authLoading, profile, router, supabase]);

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const handleUpdateStatus = async (
    id: string,
    newStatus: (typeof statusOptions)[number]
  ) => {
    const response = await updateOrderStatus(id, newStatus);
    if (response.success) {
      toast.success('Order status updated');
    } else {
      toast.error('Failed to update status');
    }
    // No need for fetchOrders; real-time will handle
  };


  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-neonText">
          <Skeleton className="h-8 w-48 bg-neon-green/20" />
        </h2>
        <Skeleton className="h-64 w-full bg-neon-green/20" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900/50 border-red-500">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neonText">Manage Orders</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] bg-black/70 border-neon-blue/50 text-neon-blue">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-neon-blue/50">
            <SelectItem value="all">All</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ').charAt(0).toUpperCase() +
                  status.replace('_', ' ').slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-neon-green/20">
            <TableHead className="text-neon-green">ID</TableHead>
            <TableHead className="text-neon-green">User</TableHead>
            <TableHead className="text-neon-green">Total</TableHead>
            <TableHead className="text-neon-green">Delivery</TableHead>
            <TableHead className="text-neon-green">Date</TableHead>
            <TableHead className="text-neon-green">Items</TableHead>
            <TableHead className="text-neon-green">Status</TableHead>
            <TableHead className="text-neon-green">Assigned Staff</TableHead>
            <TableHead className="text-neon-green">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-gray-400">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow
                key={order.id}
                className="border-b border-neon-green/10 hover:bg-neon-green/5"
              >
                <TableCell>{order.id.toString().slice(0, 8)}...</TableCell>
                <TableCell>{order.profiles.full_name}</TableCell>
                <TableCell>R{order.total_amount?.toFixed(2) ?? '0.00'}</TableCell>
                <TableCell>{order.order_type}</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      {item.quantity}x {item.menu_items.name} (R
                      {item.menu_items.price.toFixed(2)})
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      order.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : order.status === 'confirmed'
                          ? 'bg-orange-500/20 text-orange-300'
                          : order.status === 'preparing'
                            ? 'bg-blue-500/20 text-blue-300'
                            : order.status === 'ready'
                              ? 'bg-purple-500/20 text-purple-300'
                              : order.status === 'completed'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-red-500/20 text-red-300'
                    }
                  >
                    {order.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      order.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : order.status === 'confirmed' ||
                            order.status === 'preparing'
                          ? 'bg-blue-500/20 text-blue-300'
                          : order.status === 'ready'
                            ? 'bg-green-500/20 text-green-300'
                            : order.status === 'completed'
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-red-500/20 text-red-300'
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <EllipsisVerticalIcon className="h-4 w-4 text-neon-green" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black/90 border-neon-green/50">
                      <DropdownMenuItem className="p-0">
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleUpdateStatus(
                              order.id,
                              value as (typeof statusOptions)[number]
                            )
                          }
                        >
                          <SelectTrigger className="w-full bg-transparent border-none text-neon-blue focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-neon-blue/50">
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                Set to{' '}
                                {status
                                  .replace('_', ' ')
                                  .charAt(0)
                                  .toUpperCase() +
                                  status.replace('_', ' ').slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
