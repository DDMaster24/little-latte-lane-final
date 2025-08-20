'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getStaffOrders, updateOrderStatus } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  ChefHat,
  Package,
  CheckCircle,
  Timer,
  Filter,
  Volume2,
  VolumeX,
  Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  user_id: string | null;
  status: string | null;
  payment_status: string | null;
  total_amount: number | null;
  created_at: string | null;
  updated_at: string | null;
  order_number: string | null;
  special_instructions: string | null;
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

export default function KitchenView() {
  const { profile } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Phase 3 Part 3: Enhanced Kitchen Features
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      console.log('🍳 Kitchen View: Fetching orders...');
      const result = await getStaffOrders();
      
      if (!result.success) {
        console.error('❌ Kitchen View: Error fetching orders:', result.error);
        toast.error('Failed to fetch orders');
        return;
      }

      console.log(`🍳 Kitchen View: Fetched ${result.data.length} orders at ${new Date().toLocaleTimeString()}`);
      
      // Phase 3 Part 3: New order detection and sound notification
      const currentOrderCount = result.data.length;
      if (previousOrderCount > 0 && currentOrderCount > previousOrderCount && soundEnabled) {
        // New order detected - play sound notification
        setNewOrderCount(currentOrderCount - previousOrderCount);
        try {
          // Create audio context for sound notification
          const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          
          toast.success(`🔔 ${currentOrderCount - previousOrderCount} new order(s) received!`, {
            duration: 4000,
            style: {
              background: '#10b981',
              color: 'white',
            },
          });
        } catch (error) {
          console.log('Audio notification not available:', error);
        }
        
        // Reset new order count after 5 seconds
        setTimeout(() => setNewOrderCount(0), 5000);
      }
      
      setPreviousOrderCount(currentOrderCount);
      setOrders(result.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('💥 Kitchen View: Unexpected error:', error);
      toast.error('Unexpected error occurred');
    }
  }, [previousOrderCount, soundEnabled]);

  useEffect(() => {
    if (!profile?.is_staff && !profile?.is_admin) {
      router.push('/');
      return;
    }

    const initializeData = async () => {
      await fetchOrders();
      setLoading(false);
    };

    initializeData();

    // Auto-refresh every 15 seconds for kitchen operations
    const interval = setInterval(fetchOrders, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [profile, router, fetchOrders]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const result = await updateOrderStatus(id, newStatus);
      
      if (!result.success) {
        toast.error('Failed to update order status');
        console.error('❌ Kitchen View: Error updating order:', result.error);
        return;
      }

      toast.success(`Order moved to ${newStatus}`);
      fetchOrders(); // Refresh immediately
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('💥 Kitchen View: Unexpected error updating order:', error);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'preparing':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'ready':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'completed':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      default:
        return 'bg-neonCyan/20 border-neonCyan/50 text-neonCyan';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
        return <ChefHat className="w-4 h-4" />;
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Timer className="w-4 h-4" />;
    }
  };

  const formatOrderTime = (created_at: string | null) => {
    if (!created_at) return 'Unknown time';
    const orderTime = new Date(created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return orderTime.toLocaleTimeString('en-ZA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getQuickActions = (status: string | null) => {
    const actions = [];
    
    if (status === 'confirmed') {
      actions.push({ label: 'Start Cooking', value: 'preparing', color: 'bg-orange-500 hover:bg-orange-600' });
    }
    
    if (status === 'preparing') {
      actions.push({ label: 'Mark Ready', value: 'ready', color: 'bg-green-500 hover:bg-green-600' });
    }
    
    if (status === 'ready') {
      actions.push({ label: 'Complete', value: 'completed', color: 'bg-blue-500 hover:bg-blue-600' });
    }
    
    return actions;
  };

  // Phase 3 Part 3: Kitchen workflow utilities
  const isOrderUrgent = (order: Order) => {
    if (!order.created_at) return false;
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    // Orders are urgent if they've been waiting more than 20 minutes or are marked as ready
    return diffMinutes > 20 || order.status === 'ready';
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Filter by urgency
    if (showOnlyUrgent) {
      filtered = filtered.filter(order => isOrderUrgent(order));
    }
    
    return filtered;
  };

  const getOrderPriorityColor = (order: Order) => {
    if (isOrderUrgent(order)) {
      return 'border-red-500 bg-red-50/95 shadow-red-200';
    }
    return 'bg-yellow-100/95 border-yellow-300/50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-neonCyan mx-auto mb-4" />
          <p className="text-neonText">Loading kitchen view...</p>
        </div>
      </div>
    );
  }

  if (!profile?.is_staff && !profile?.is_admin) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center">
        <div className="text-center">
          <p className="text-neonPink text-xl">Access Denied</p>
          <p className="text-gray-400">Staff privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-neonText">
      {/* Full-Screen Header - Enhanced with Kitchen Controls */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-neonCyan/30 sticky top-0 z-50">
        <div className="max-w-full px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/staff')}
                variant="ghost"
                className="text-neonCyan hover:text-neonPink"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Staff Panel
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-neonCyan flex items-center gap-2">
                  Kitchen View
                  {newOrderCount > 0 && (
                    <Badge className="bg-red-500 text-white animate-pulse">
                      +{newOrderCount} NEW
                    </Badge>
                  )}
                </h1>
                <p className="text-neonText/70 text-sm">Full-screen order management</p>
              </div>
            </div>
            
            {/* Kitchen Controls */}
            <div className="flex items-center space-x-4">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-gray-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="confirmed">⏱️ Confirmed</SelectItem>
                  <SelectItem value="preparing">👨‍🍳 Preparing</SelectItem>
                  <SelectItem value="ready">✅ Ready</SelectItem>
                </SelectContent>
              </Select>

              {/* Urgent Orders Toggle */}
              <Button
                onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
                variant={showOnlyUrgent ? "default" : "outline"}
                className={`${showOnlyUrgent ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-gray-300'}`}
              >
                <Bell className="w-4 h-4 mr-2" />
                Urgent Only
              </Button>

              {/* Sound Toggle */}
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>

              {lastUpdate && (
                <div className="text-sm text-gray-400">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              
              <Button
                onClick={fetchOrders}
                disabled={loading}
                className="bg-neonPink hover:bg-neonPink/80 text-black font-medium px-4 py-2 rounded-lg transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid - Enhanced with Filtering and Priority */}
      <div className="p-6">
        {getFilteredOrders().length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="h-16 w-16 mx-auto mb-6 text-gray-400 opacity-50" />
            <h3 className="text-xl text-gray-400 mb-2">
              {statusFilter === 'all' ? 'No Active Orders' : `No ${statusFilter} Orders`}
            </h3>
            <p className="text-gray-500">
              {showOnlyUrgent ? 'No urgent orders at this time' : 'Orders will appear here as they come in'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {getFilteredOrders().map((order, index) => (
              <div
                key={order.id}
                className={`group relative aspect-square backdrop-blur-sm border rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1 ${getOrderPriorityColor(order)}`}
                style={{
                  background: isOrderUrgent(order) 
                    ? 'linear-gradient(135deg, #fef2f2 0%, #fca5a5 100%)'
                    : 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
                  boxShadow: isOrderUrgent(order)
                    ? '0 4px 12px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(252, 211, 77, 0.3)',
                }}
              >
                {/* Priority Indicator */}
                {isOrderUrgent(order) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                    !
                  </div>
                )}

                {/* Position Number - Top Left Corner */}
                <div className={`absolute -top-2 -left-2 w-8 h-8 ${isOrderUrgent(order) ? 'bg-red-600' : 'bg-red-500'} text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg`}>
                  {index + 1}
                </div>

                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="text-gray-900">
                    <h4 className="font-bold text-lg leading-tight">
                      Order #{order.order_number || order.id.slice(0, 8)}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {formatOrderTime(order.created_at)}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-xs flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    {order.status || 'pending'}
                  </Badge>
                </div>

                {/* Customer Info */}
                <div className="mb-3 text-gray-800">
                  <p className="text-sm font-medium">
                    {order.profiles?.full_name || order.profiles?.email?.split('@')[0] || 'Walk-in Customer'}
                  </p>
                  <p className="text-xs text-gray-600">
                    Total: R{order.total_amount?.toFixed(2) || '0.00'}
                  </p>
                </div>

                {/* Order Items */}
                <div className="mb-4 flex-1">
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-800">
                        <span className="font-medium">{item.quantity}x</span>{' '}
                        <span className="text-gray-700">
                          {item.menu_items?.name || 'Unknown Item'}
                        </span>
                        {item.special_instructions && (
                          <p className="text-xs text-gray-600 italic ml-4">
                            Note: {item.special_instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {order.special_instructions && (
                    <div className="mt-2 p-2 bg-yellow-200/50 rounded text-xs text-gray-700">
                      <strong>Special:</strong> {order.special_instructions}
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="space-y-2">
                  {getQuickActions(order.status).map((action, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleUpdateStatus(order.id, action.value)}
                      className={`w-full ${action.color} text-white text-xs py-2 font-medium transition-all duration-300 hover:shadow-lg`}
                    >
                      {action.label}
                    </Button>
                  ))}
                  
                  {/* Full Status Selector for Complex Changes */}
                  <Select
                    onValueChange={(value) => handleUpdateStatus(order.id, value)}
                    defaultValue={order.status || 'confirmed'}
                  >
                    <SelectTrigger className="w-full text-xs bg-gray-800 text-white border-gray-600">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="confirmed">⏱️ Confirmed</SelectItem>
                      <SelectItem value="preparing">👨‍🍳 Preparing</SelectItem>
                      <SelectItem value="ready">✅ Ready</SelectItem>
                      <SelectItem value="completed">🎉 Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
