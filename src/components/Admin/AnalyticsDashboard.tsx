'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, DollarSign, Users, 
  Download, RefreshCw,
  PieChart, Target, Clock, Award,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7d');

  const analyticsStats = [
    { 
      title: "Total Revenue", 
      value: "R45,230", 
      change: "+12.5%", 
      trend: "up", 
      icon: DollarSign, 
      color: "neonCyan" 
    },
    { 
      title: "Total Orders", 
      value: "1,247", 
      change: "+8.2%", 
      trend: "up", 
      icon: BarChart3, 
      color: "green-500" 
    },
    { 
      title: "Avg Order Value", 
      value: "R142", 
      change: "-2.1%", 
      trend: "down", 
      icon: Target, 
      color: "yellow-500" 
    },
    { 
      title: "Customer Growth", 
      value: "892", 
      change: "+15.7%", 
      trend: "up", 
      icon: Users, 
      color: "neonPink" 
    }
  ];

  const topItems = [
    { name: "Margherita Pizza", orders: 89, revenue: "R8,900", growth: "+5%" },
    { name: "Beef Burger", orders: 76, revenue: "R7,600", growth: "+12%" },
    { name: "Caesar Salad", orders: 54, revenue: "R4,320", growth: "-3%" },
    { name: "Craft Beer", orders: 123, revenue: "R6,150", growth: "+8%" },
    { name: "Chocolate Cake", orders: 32, revenue: "R2,560", growth: "+18%" }
  ];

  const revenueData = [
    { day: "Mon", amount: 4200 },
    { day: "Tue", amount: 3800 },
    { day: "Wed", amount: 5200 },
    { day: "Thu", amount: 4900 },
    { day: "Fri", amount: 6800 },
    { day: "Sat", amount: 8900 },
    { day: "Sun", amount: 7200 }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-400" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neonCyan"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" className="border-gray-600 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-neonCyan to-blue-600 hover:from-neonCyan/80 hover:to-blue-600/80">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-${stat.color}/20`}>
                    <Icon className={`h-5 w-5 text-${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 ${getTrendColor(stat.trend)}`}>
                    {getTrendIcon(stat.trend)}
                    <span className="text-sm font-medium">{stat.change}</span>
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

      {/* Charts and Analytics */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-neonCyan" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400 w-12">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-700 rounded-full h-3 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-neonCyan to-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(day.amount / 9000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white font-medium w-20 text-right">R{day.amount}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-neonCyan/10 border border-neonCyan/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-neonCyan font-medium">Weekly Total</span>
                <span className="text-white text-xl font-bold">R41,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Items */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Award className="h-5 w-5 text-neonPink" />
              Top Performing Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{item.name}</span>
                    <span className={`text-sm font-medium ${
                      item.growth.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.growth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.orders} orders</span>
                    <span className="text-neonCyan font-medium">{item.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Customer Insights */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Customer Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">New Customers</span>
                <span className="text-white font-medium">64 this month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Returning Rate</span>
                <span className="text-green-400 font-medium">68%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg. Lifetime Value</span>
                <span className="text-white font-medium">R1,250</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Customer Satisfaction</span>
                <span className="text-neonCyan font-medium">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Lunch Rush</span>
                <span className="text-white font-medium">12:00 - 14:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Dinner Peak</span>
                <span className="text-white font-medium">18:00 - 21:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Busiest Day</span>
                <span className="text-neonPink font-medium">Saturday</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Golf Prime Time</span>
                <span className="text-white font-medium">15:00 - 18:00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Goals */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Monthly Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Revenue Target</span>
                  <span className="text-white font-medium">85%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-neonCyan to-blue-500 h-2 rounded-full w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Order Count</span>
                  <span className="text-white font-medium">92%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full w-[92%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">New Customers</span>
                  <span className="text-white font-medium">78%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-neonPink to-purple-500 h-2 rounded-full w-[78%]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Notice */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <PieChart className="h-6 w-6 text-indigo-400" />
          <span className="text-indigo-400 font-medium text-lg">Advanced Analytics Coming Soon</span>
        </div>
        <p className="text-gray-300 mb-4">
          Enhanced analytics features in development including:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Interactive charts and graphs</li>
            <li>• Custom date range analysis</li>
            <li>• Revenue forecasting</li>
            <li>• Customer segmentation analysis</li>
          </ul>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>• Menu item performance tracking</li>
            <li>• Seasonal trend analysis</li>
            <li>• Cost analysis and profit margins</li>
            <li>• Automated business intelligence reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
