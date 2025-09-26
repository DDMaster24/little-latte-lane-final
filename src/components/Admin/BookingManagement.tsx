'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, MessageSquare, Users, Calendar, 
  AlertCircle, ExternalLink, Info
} from 'lucide-react';

export default function BookingManagement() {
  
  const handleOpenEmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Management</h2>
          <p className="text-gray-400">Manage restaurant table bookings and contact form submissions</p>
        </div>
        <Button onClick={handleOpenEmail} className="neon-button">
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Email
        </Button>
      </div>

      {/* Current Status Info */}
      <Card className="bg-blue-800/20 border-blue-400/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Contact Form Submissions</h3>
              <p className="text-gray-300 mb-4">
                Currently, all booking inquiries and contact form submissions from your website are sent directly to 
                <strong className="text-blue-300"> admin@littlelattelane.co.za</strong> via email. 
                You can manage these inquiries through your email client.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleOpenEmail} 
                  variant="outline" 
                  className="border-blue-400/50 text-blue-300 hover:bg-blue-400/10"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Check Email Inbox
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Bookings</p>
                <p className="text-3xl font-bold text-white">-</p>
                <p className="text-xs text-gray-500 mt-1">Check email</p>
              </div>
              <Calendar className="h-12 w-12 text-neonCyan" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-white">-</p>
                <p className="text-xs text-gray-500 mt-1">Check email</p>
              </div>
              <AlertCircle className="h-12 w-12 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Contact Forms</p>
                <p className="text-3xl font-bold text-white">-</p>
                <p className="text-xs text-gray-500 mt-1">Via email</p>
              </div>
              <MessageSquare className="h-12 w-12 text-neonPink" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Inquiries</p>
                <p className="text-3xl font-bold text-white">-</p>
                <p className="text-xs text-gray-500 mt-1">Email based</p>
              </div>
              <Users className="h-12 w-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form Info */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neonPink" />
            How Contact Forms Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Current Process</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neonCyan/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-neonCyan text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Customer fills contact form</p>
                      <p className="text-gray-400 text-sm">On the booking page of your website</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neonCyan/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-neonCyan text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Email sent automatically</p>
                      <p className="text-gray-400 text-sm">To admin@littlelattelane.co.za with all details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neonCyan/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-neonCyan text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">You respond via email</p>
                      <p className="text-gray-400 text-sm">Reply directly to the customer&apos;s inquiry</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Email Contains</h3>
                <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                  <p className="text-gray-300 text-sm">✅ Customer name and email</p>
                  <p className="text-gray-300 text-sm">✅ Phone number (if provided)</p>
                  <p className="text-gray-300 text-sm">✅ Preferred date and time</p>
                  <p className="text-gray-300 text-sm">✅ Party size</p>
                  <p className="text-gray-300 text-sm">✅ Event type (birthday, corporate, etc.)</p>
                  <p className="text-gray-300 text-sm">✅ Special message/requests</p>
                </div>
                
                <div className="mt-4">
                  <Button 
                    onClick={handleOpenEmail} 
                    className="w-full bg-neonPink/20 border border-neonPink/30 text-neonPink hover:bg-neonPink/30"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Check Recent Inquiries
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Enhancement Note */}
      <Card className="bg-orange-800/20 border-orange-400/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-400 mb-2">Future Enhancement</h3>
              <p className="text-gray-300">
                In a future update, we can add a database table to store contact form submissions directly in this dashboard, 
                allowing you to manage inquiries, track response status, and view analytics without relying on email alone.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
