'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Package, 
  ChefHat,
  AlertCircle,
  Calendar,
  DollarSign,
  Hash,
  MessageSquare
} from 'lucide-react';

interface OrderItem {
  id: string;
  menu_item_id: string | null;
  quantity: number;
  price: number | null;
  special_instructions?: string | null;
  menu_items?: {
    name: string;
    category_id: string | null;
  } | null;
}

interface Profile {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface Order {
  id: string;
  user_id: string | null;
  total_amount: number | null;
  status: string | null;
  payment_status: string | null;
  payment_method?: string;
  delivery_method?: string | null;
  delivery_address?: string;
  special_instructions: string | null;
  created_at: string | null;
  updated_at: string | null;
  order_number?: string | null;
  order_items?: OrderItem[];
  profiles?: Profile | null;
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'preparing':
        return 'bg-orange-400/20 text-orange-400 border-orange-400/30';
      case 'ready':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'completed':
      case 'delivered':
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      case 'cancelled':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      default:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'failed':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      default:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-darkBg/95 backdrop-blur-md border-2 border-neonCyan/50 text-neonText mx-4"
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 30px rgba(0, 255, 255, 0.1)'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neonCyan flex items-center gap-3">
            <Package className="h-6 w-6" />
            Order Details: {order.order_number || `#${order.id.slice(0, 8)}...`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status & Timeline */}
          <div className="grid md:grid-cols-2 gap-6">
            <div 
              className="bg-black/40 backdrop-blur-sm border border-neonCyan/30 rounded-lg p-4"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h3 className="text-lg font-semibold text-neonCyan mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Order Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Current Status:</span>
                  <Badge className={getStatusColor(order.status || '')}>
                    {order.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Payment Status:</span>
                  <Badge className={getPaymentStatusColor(order.payment_status || '')}>
                    {order.payment_status || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Delivery Method:</span>
                  <span className="text-neonText">
                    {order.delivery_method === 'delivery' ? 'Delivery' : 
                     order.delivery_method === 'pickup' ? 'Pickup' : 
                     'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            <div 
              className="bg-black/40 backdrop-blur-sm border border-neonPink/30 rounded-lg p-4"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h3 className="text-lg font-semibold text-neonPink mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Order Placed:</span>
                  <span className="text-neonText text-sm">{order.created_at ? formatTime(order.created_at) : 'N/A'}</span>
                </div>
                {order.updated_at && order.updated_at !== order.created_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Last Updated:</span>
                    <span className="text-neonText text-sm">{formatTime(order.updated_at)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Order Date:</span>
                  <span className="text-neonText text-sm">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-ZA') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div 
            className="bg-black/40 backdrop-blur-sm border border-green-400/30 rounded-lg p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Name:</span>
                  <span className="text-neonText">{order.profiles?.full_name || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Email:</span>
                  <span className="text-neonText">{order.profiles?.email || 'Not provided'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Phone:</span>
                  <span className="text-neonText">{order.profiles?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">User ID:</span>
                  <span className="text-neonText text-sm">{order.user_id?.slice(0, 8) || 'N/A'}...</span>
                </div>
              </div>
            </div>
            {order.delivery_method === 'delivery' && order.delivery_address && (
              <div className="mt-3 pt-3 border-t border-gray-600/50">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-gray-300">Delivery Address:</span>
                    <p className="text-neonText mt-1 break-words whitespace-pre-wrap leading-relaxed">{order.delivery_address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div 
            className="bg-black/40 backdrop-blur-sm border border-orange-400/30 rounded-lg p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Order Items ({order.order_items?.length || 0} items)
            </h3>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="border border-gray-600/50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-neonText font-medium">
                        {item.menu_items?.name || 'Unknown Item'}
                      </h4>
                      <p className="text-sm text-gray-400">
                        Quantity: {item.quantity} × R{item.price?.toFixed(2) || '0.00'} = R{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                      </p>
                      {item.special_instructions && (
                        <div className="mt-2 p-2 bg-yellow-400/10 border border-yellow-400/30 rounded">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-yellow-400 text-sm font-medium">Special Instructions:</span>
                              <p className="text-neonText text-sm break-words whitespace-pre-wrap leading-relaxed">{item.special_instructions}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-400 italic">No items found</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div 
            className="bg-black/40 backdrop-blur-sm border border-neonPink/30 rounded-lg p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h3 className="text-lg font-semibold text-neonPink mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-300">Total Amount:</span>
                <span className="text-neonPink font-bold">R{order.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Items Count:</span>
                <span className="text-neonText">{order.order_items?.length || 0} items</span>
              </div>
            </div>
            
            {order.special_instructions && (
              <div className="mt-4 pt-4 border-t border-gray-600/50">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-neonPink mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-neonPink text-sm font-medium">Order Instructions:</span>
                    <p className="text-neonText mt-1 break-words whitespace-pre-wrap leading-relaxed">{order.special_instructions}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Technical Details */}
          <div 
            className="bg-black/40 backdrop-blur-sm border border-gray-400/30 rounded-lg p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h3 className="text-lg font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Technical Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Order ID:</span>
                  <p className="text-neonText font-mono break-all">{order.id}</p>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <p className="text-neonText">{order.created_at ? formatDateTime(order.created_at) : 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">User ID:</span>
                  <p className="text-neonText font-mono break-all">{order.user_id || 'N/A'}</p>
                </div>
                {order.updated_at && (
                  <div>
                    <span className="text-gray-400">Last Updated:</span>
                    <p className="text-neonText">{formatDateTime(order.updated_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={onClose}
              className="bg-neonCyan/20 hover:bg-neonCyan/30 text-neonCyan border border-neonCyan/50"
            >
              Close Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
