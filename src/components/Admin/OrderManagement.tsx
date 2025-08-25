'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, Clock, CheckCircle, AlertTriangle, 
  Search, Filter, Eye, MessageSquare, DollarSign,
  Users, Truck, Calendar, MoreHorizontal
} from 'lucide-react';

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState('pending');

  const orderStats = [
    { title: "Pending Orders", value: "23", icon: Clock, color: "yellow-500" },
    { title: "In Progress", value: "12", icon: ShoppingCart, color: "blue-500" },
    { title: "Completed Today", value: "89", icon: CheckCircle, color: "green-500" },
    { title: "Total Revenue", value: "R12,450", icon: DollarSign, color: "neonCyan" }
  ];

  const mockOrders = [
    {
      id: "ORD-2025-001",
      customer: "John Smith",
      phone: "+27 82 123 4567",
      items: ["Margherita Pizza", "Coca Cola"],
      total: "R295.00",
      status: "pending",
      time: "10 mins ago",
      type: "delivery"
    },
    {
      id: "ORD-2025-002", 
      customer: "Sarah Johnson",
      phone: "+27 83 456 7890",
      items: ["Beef Burger", "Fries", "Beer"],
      total: "R185.00",
      status: "preparing",
      time: "15 mins ago",
      type: "pickup"
    },
    {
      id: "ORD-2025-003",
      customer: "Mike Davis",
      phone: "+27 84 789 0123",
      items: ["Caesar Salad", "Iced Tea"],
      total: "R125.00",
      status: "ready",
      time: "20 mins ago",
      type: "dine-in"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'preparing': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'ready': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'completed': return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'pickup': return <ShoppingCart className="h-4 w-4" />;
      case 'dine-in': return <Users className="h-4 w-4" />;
      default: return <ShoppingCart className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Order Management</h2>
          <p className="text-gray-400">Track and manage all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-gradient-to-r from-neonCyan to-blue-600 hover:from-neonCyan/80 hover:to-blue-600/80">
            <Calendar className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {orderStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${stat.color}/20`}>
                    <Icon className={`h-5 w-5 text-${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Management Interface */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl">Order Queue</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neonCyan"
                />
              </div>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Order Status Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'pending', label: 'Pending', count: 23 },
              { id: 'preparing', label: 'Preparing', count: 12 },
              { id: 'ready', label: 'Ready', count: 5 },
              { id: 'completed', label: 'Completed', count: 89 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.label}
                <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <Card key={order.id} className="bg-gray-700/30 border-gray-600/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(order.type)}
                        <span className="text-white font-medium">{order.id}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">{order.time}</span>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Customer</p>
                      <p className="text-white font-medium">{order.customer}</p>
                      <p className="text-gray-400 text-sm">{order.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Items</p>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <p key={index} className="text-gray-300 text-sm">• {item}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total</p>
                      <p className="text-white font-bold text-lg">{order.total}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600/50">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button size="sm" className="bg-neonCyan hover:bg-neonCyan/80">
                          Complete Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Development Notice */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 font-medium">Advanced Features Coming Soon</span>
            </div>
            <p className="text-gray-300 text-sm">
              Full order management system in development. Will include real-time order tracking, 
              customer notifications, kitchen display integration, and comprehensive reporting.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
