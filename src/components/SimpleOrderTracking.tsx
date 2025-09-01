'use client';

import React from 'react';
import Link from 'next/link';
import { getOrderStatusDisplay, getOrderProgress, type SimpleOrderStatus } from '@/lib/orderStatusNotifications';

interface Order {
  id: string;
  order_number: string | null;
  status: SimpleOrderStatus;
  total_amount: number;
  created_at: string;
  estimated_ready_time?: string;
  delivery_method?: string;
  order_items?: Array<{
    quantity: number;
    menu_items?: {
      name: string;
    } | null;
  }>;
}

interface SimpleOrderTrackingProps {
  orders: Order[];
}

export default function SimpleOrderTracking({ orders }: SimpleOrderTrackingProps) {
  const activeOrders = orders.filter(order => 
    order.status !== 'completed' && order.status !== 'cancelled'
  );
  
  const recentOrders = orders.filter(order => 
    order.status === 'completed' || order.status === 'cancelled'
  ).slice(0, 3);

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
        <p className="text-gray-400 mb-4">Ready to try our delicious food?</p>
        <Link 
          href="/menu" 
          className="inline-block bg-neon-gradient text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            🔥 Active Orders
            <span className="bg-neonCyan text-black text-xs px-2 py-1 rounded-full">
              {activeOrders.length}
            </span>
          </h3>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} isActive={true} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">📋 Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} isActive={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, isActive }: { order: Order; isActive: boolean }) {
  const statusInfo = getOrderStatusDisplay(order.status);
  const progress = getOrderProgress(order.status);
  
  const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const firstItem = order.order_items?.[0]?.menu_items?.name || 'Unknown Item';
  const itemsText = itemCount > 1 ? `${firstItem} + ${itemCount - 1} more` : firstItem;

  return (
    <div className={`relative p-6 rounded-xl border ${
      isActive 
        ? 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-neonCyan shadow-neon' 
        : 'bg-gray-900/60 border-gray-700'
    } backdrop-blur-md`}>
      
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">
            Order #{order.order_number || order.id.slice(0, 8)}
          </h4>
          <p className="text-gray-400 text-sm">
            {new Date(order.created_at).toLocaleDateString()} • {itemsText}
          </p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
            order.status === 'ready' ? 'bg-green-500/20 text-green-400' :
            order.status === 'making' ? 'bg-orange-500/20 text-orange-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            <span>{statusInfo.icon}</span>
            {statusInfo.label}
          </div>
          <p className="text-neonCyan font-semibold mt-1">
            R{order.total_amount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Progress Bar (Active Orders Only) */}
      {isActive && order.status !== 'cancelled' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-neon-gradient h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Description */}
      <p className="text-gray-300 text-sm mb-3">
        {statusInfo.description}
      </p>

      {/* Estimated Ready Time */}
      {order.estimated_ready_time && order.status === 'making' && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-orange-400">
            <span>⏰</span>
            <span className="text-sm font-medium">
              Estimated ready: {order.estimated_ready_time}
            </span>
          </div>
        </div>
      )}

      {/* Delivery Method */}
      {order.delivery_method && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{order.delivery_method === 'delivery' ? '🚗' : '🏪'}</span>
          <span>{order.delivery_method === 'delivery' ? 'Delivery' : 'Collection'}</span>
        </div>
      )}

      {/* Ready for Collection Alert */}
      {order.status === 'ready' && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎉</div>
            <div>
              <h5 className="text-green-400 font-semibold">Ready for {order.delivery_method === 'delivery' ? 'Delivery' : 'Collection'}!</h5>
              <p className="text-sm text-gray-300">
                {order.delivery_method === 'delivery' 
                  ? 'Our driver will be with you shortly.' 
                  : 'Please come to Little Latte Lane to collect your order.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
