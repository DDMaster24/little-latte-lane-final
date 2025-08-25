'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, UserPlus, Shield, Settings, Search, Filter,
  Mail, Phone, Calendar, MoreHorizontal, Crown,
  UserCheck, Ban, Eye, Edit
} from 'lucide-react';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('customers');

  const userStats = [
    { title: "Total Customers", value: "1,247", icon: Users, color: "neonCyan" },
    { title: "Staff Members", value: "12", icon: Shield, color: "neonPink" },
    { title: "Active Users", value: "892", icon: UserCheck, color: "green-500" },
    { title: "New This Month", value: "64", icon: UserPlus, color: "yellow-500" }
  ];

  const mockUsers = [
    {
      id: "USR-001",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+27 82 123 4567",
      role: "customer",
      status: "active",
      joinDate: "2024-12-15",
      lastLogin: "2 hours ago",
      totalOrders: 23,
      totalSpent: "R2,450"
    },
    {
      id: "STF-001",
      name: "Sarah Johnson",
      email: "sarah.j@littlelatte.co.za",
      phone: "+27 83 456 7890",
      role: "staff",
      status: "active",
      joinDate: "2024-06-10",
      lastLogin: "Active now",
      permissions: ["orders", "bookings"],
      department: "Kitchen"
    },
    {
      id: "ADM-001",
      name: "Mike Davis",
      email: "mike.d@littlelatte.co.za",
      phone: "+27 84 789 0123",
      role: "admin",
      status: "active",
      joinDate: "2024-01-01",
      lastLogin: "1 hour ago",
      permissions: ["all"],
      department: "Management"
    },
    {
      id: "USR-002",
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      phone: "+27 85 234 5678",
      role: "customer",
      status: "inactive",
      joinDate: "2024-11-20",
      lastLogin: "2 weeks ago",
      totalOrders: 5,
      totalSpent: "R680"
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'staff': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'customer': return 'text-green-400 bg-green-400/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'inactive': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'banned': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'staff': return <Shield className="h-4 w-4" />;
      case 'customer': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    if (activeTab === 'customers') return user.role === 'customer';
    if (activeTab === 'staff') return user.role === 'staff' || user.role === 'admin';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
          <p className="text-gray-400">Manage customers, staff, and user permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-gradient-to-r from-neonCyan to-blue-600 hover:from-neonCyan/80 hover:to-blue-600/80">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
          <Button className="bg-gradient-to-r from-neonPink to-purple-600 hover:from-neonPink/80 hover:to-purple-600/80">
            <Shield className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {userStats.map((stat, index) => {
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

      {/* User Management Interface */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl">User Directory</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
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
          {/* User Type Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'customers', label: 'Customers', count: 1247 },
              { id: 'staff', label: 'Staff & Admins', count: 13 },
              { id: 'all', label: 'All Users', count: 1260 }
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

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-gray-700/30 border-gray-600/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-neonCyan to-neonPink rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)} flex items-center gap-1`}>
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Last: {user.lastLogin}</span>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Contact</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-gray-300 text-sm">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-300 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Member Since</p>
                      <div className="flex items-center gap-1 text-white">
                        <Calendar className="h-4 w-4" />
                        <span>{user.joinDate}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        {user.role === 'customer' ? 'Order History' : 'Department'}
                      </p>
                      {user.role === 'customer' ? (
                        <div className="space-y-1 text-white">
                          <p>{user.totalOrders} orders</p>
                          <p className="font-medium">{user.totalSpent} spent</p>
                        </div>
                      ) : (
                        <p className="text-white">{user.department}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        {user.role === 'customer' ? 'Status' : 'Permissions'}
                      </p>
                      {user.role === 'customer' ? (
                        <p className="text-white">Regular Customer</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.permissions?.map((perm, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                              {perm}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-600/50">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {user.status === 'active' && (
                        <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend
                        </Button>
                      )}
                      {user.role !== 'admin' && user.role === 'customer' && (
                        <Button size="sm" className="bg-neonPink hover:bg-neonPink/80">
                          <Shield className="h-4 w-4 mr-2" />
                          Promote
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Development Notice */}
          <div className="mt-8 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-cyan-400" />
              <span className="text-cyan-400 font-medium">Advanced User Management Coming Soon</span>
            </div>
            <p className="text-gray-300 text-sm">
              Enhanced user management features in development: role-based permissions, 
              bulk operations, customer segmentation, and automated user lifecycle management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
