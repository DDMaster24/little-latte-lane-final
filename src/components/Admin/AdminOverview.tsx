'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, ShoppingBag, Users, TrendingUp, 
  Clock, Star, CheckCircle, 
  Activity, CreditCard,
  ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';

interface OverviewStats {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  pendingOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  popularItems: Array<{ name: string; orders: number }>;
  recentActivity: Array<{ time: string; action: string; type: 'order' | 'payment' | 'user' }>;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    todayRevenue: 0,
    todayOrders: 0,
    popularItems: [],
    recentActivity: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls to fetch real data
    const fetchStats = async () => {
      try {
        // Simulated data - replace with actual Supabase queries
        setTimeout(() => {
          setStats({
            totalRevenue: 145720.50,
            totalOrders: 1847,
            activeUsers: 392,
            pendingOrders: 12,
            averageOrderValue: 78.95,
            todayRevenue: 2840.75,
            todayOrders: 23,
            popularItems: [
              { name: "Margherita Pizza", orders: 156 },
              { name: "Chicken Alfredo", orders: 134 },
              { name: "Caesar Salad", orders: 98 },
              { name: "Beef Burger", orders: 87 }
            ],
            recentActivity: [
              { time: "2 mins ago", action: "New order #LL1089 - R285.50", type: "order" },
              { time: "5 mins ago", action: "Payment completed for order #LL1088", type: "payment" },
              { time: "8 mins ago", action: "New user registration: john@example.com", type: "user" },
              { time: "12 mins ago", action: "Order #LL1087 marked as completed", type: "order" },
              { time: "15 mins ago", action: "Payment failed for order #LL1086", type: "payment" }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700/50 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `R${stats.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      changeType: "increase" as const,
      icon: DollarSign,
      color: "neonCyan",
      subValue: `Today: R${stats.todayRevenue.toLocaleString()}`
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "+8.2%",
      changeType: "increase" as const,
      icon: ShoppingBag,
      color: "neonPink",
      subValue: `Today: ${stats.todayOrders} orders`
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      change: "+15.3%",
      changeType: "increase" as const,
      icon: Users,
      color: "green-500",
      subValue: "This month"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders.toString(),
      change: stats.pendingOrders > 10 ? "High" : "Normal",
      changeType: stats.pendingOrders > 10 ? "decrease" : "increase" as const,
      icon: Clock,
      color: stats.pendingOrders > 10 ? "yellow-500" : "blue-500",
      subValue: "Needs attention"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
          <p className="text-gray-400">Your restaurant&apos;s performance at a glance</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-neonCyan/30 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${stat.color}/20`}>
                    <Icon className={`h-5 w-5 text-${stat.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {stat.changeType === 'increase' ? (
                      <ArrowUp className="h-3 w-3 text-green-400" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-400" />
                    )}
                    <span className={stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subValue}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neonCyan" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300">Average Order Value</span>
              <span className="text-white font-semibold">R{stats.averageOrderValue}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300">Orders This Week</span>
              <span className="text-white font-semibold">147</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300">Customer Satisfaction</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">4.8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-neonPink" />
              Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.popularItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neonPink/20 rounded-full flex items-center justify-center">
                    <span className="text-neonPink font-bold text-sm">{index + 1}</span>
                  </div>
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{item.orders} orders</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => {
              const getActivityIcon = (type: string) => {
                switch (type) {
                  case 'order': return <ShoppingBag className="h-4 w-4 text-neonCyan" />;
                  case 'payment': return <CreditCard className="h-4 w-4 text-neonPink" />;
                  case 'user': return <Users className="h-4 w-4 text-green-500" />;
                  default: return <Activity className="h-4 w-4 text-gray-400" />;
                }
              };

              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="p-2 bg-gray-600/50 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{activity.action}</p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-gradient-to-r from-neonCyan/10 via-purple-500/10 to-neonPink/10 border border-neonCyan/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-neonCyan" />
            System Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Core Systems</p>
                <p className="text-green-400 text-sm">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Database</p>
                <p className="text-green-400 text-sm">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Payment Gateway</p>
                <p className="text-green-400 text-sm">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
