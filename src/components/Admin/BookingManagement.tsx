'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Clock, Users, MapPin, Phone, Mail,
  Search, Filter, Plus, Edit, CheckCircle,
  AlertTriangle, XCircle, GamepadIcon
} from 'lucide-react';

export default function BookingManagement() {
  const [activeView, setActiveView] = useState('today');

  const bookingStats = [
    { title: "Today&apos;s Bookings", value: "18", icon: Calendar, color: "neonCyan" },
    { title: "Table Reservations", value: "12", icon: Users, color: "green-500" },
    { title: "Golf Bookings", value: "6", icon: GamepadIcon, color: "neonPink" },
    { title: "Pending Confirmations", value: "4", icon: Clock, color: "yellow-500" }
  ];

  const mockBookings = [
    {
      id: "TBL-001",
      type: "table",
      customerName: "Alice Brown",
      phone: "+27 82 555 0123",
      email: "alice@email.com",
      date: "2025-01-19",
      time: "19:00",
      duration: "2 hours",
      guests: 4,
      table: "Table 12",
      status: "confirmed",
      specialRequests: "Birthday celebration"
    },
    {
      id: "GLF-002",
      type: "golf",
      customerName: "Robert Wilson",
      phone: "+27 83 555 0456",
      email: "robert@email.com",
      date: "2025-01-19",
      time: "15:30",
      duration: "1 hour",
      guests: 2,
      bay: "Bay 3",
      status: "pending",
      specialRequests: "Corporate team building"
    },
    {
      id: "TBL-003",
      type: "table",
      customerName: "Emma Taylor",
      phone: "+27 84 555 0789",
      email: "emma@email.com",
      date: "2025-01-19",
      time: "20:30",
      duration: "1.5 hours",
      guests: 6,
      table: "Table 8",
      status: "confirmed",
      specialRequests: "Anniversary dinner"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'cancelled': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'completed': return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'golf' ? <GamepadIcon className="h-4 w-4" /> : <Users className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'golf' ? 'text-neonPink' : 'text-neonCyan';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Booking Management</h2>
          <p className="text-gray-400">Manage table reservations and virtual golf bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-gradient-to-r from-neonCyan to-blue-600 hover:from-neonCyan/80 hover:to-blue-600/80">
            <Plus className="h-4 w-4 mr-2" />
            New Table Booking
          </Button>
          <Button className="bg-gradient-to-r from-neonPink to-purple-600 hover:from-neonPink/80 hover:to-purple-600/80">
            <Plus className="h-4 w-4 mr-2" />
            New Golf Booking
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {bookingStats.map((stat, index) => {
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

      {/* Booking Management Interface */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl">Booking Schedule</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
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
          {/* View Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'today', label: 'Today', count: 18 },
              { id: 'tomorrow', label: 'Tomorrow', count: 24 },
              { id: 'week', label: 'This Week', count: 156 },
              { id: 'pending', label: 'Pending', count: 4 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeView === tab.id
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

          {/* Bookings List */}
          <div className="space-y-4">
            {mockBookings.map((booking) => (
              <Card key={booking.id} className="bg-gray-700/30 border-gray-600/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 ${getTypeColor(booking.type)}`}>
                        {getTypeIcon(booking.type)}
                        <span className="text-white font-medium">{booking.id}</span>
                        <span className="text-sm capitalize">({booking.type})</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Customer</p>
                      <p className="text-white font-medium">{booking.customerName}</p>
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{booking.email}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Date & Time</p>
                      <div className="flex items-center gap-1 text-white">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <Clock className="h-4 w-4" />
                        <span>{booking.time} ({booking.duration})</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Details</p>
                      <div className="flex items-center gap-1 text-white">
                        <Users className="h-4 w-4" />
                        <span>{booking.guests} guests</span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.type === 'golf' ? booking.bay : booking.table}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Special Requests</p>
                      <p className="text-gray-300 text-sm">{booking.specialRequests || 'None'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-600/50">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Customer
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button size="sm" className="bg-neonCyan hover:bg-neonCyan/80">
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Development Notice */}
          <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-purple-400" />
              <span className="text-purple-400 font-medium">Enhanced Features In Development</span>
            </div>
            <p className="text-gray-300 text-sm">
              Advanced booking management features coming soon: automated confirmations, 
              calendar integration, waitlist management, and customer communication automation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
