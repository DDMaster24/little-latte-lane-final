'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthRequiredPrompt from '@/components/AuthRequiredPrompt';
import { supabase } from '@/lib/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Clock,
  Receipt,
} from 'lucide-react';

interface Order {
  id: string;  // UUID in database
  status: string | null;
  total_amount: number | null;  // Database field name
  created_at: string | null;
  special_instructions?: string | null;
  payment_status: string | null;
  order_items: {
    menu_item_id: string | null;  // UUID in database
    quantity: number;
    price: number;  // Database field name
    menu_items?: { name: string } | null;
  }[];
}

interface ProfileUpdate {
  full_name: string;
  phone: string;
  address: string;
}

export default function AccountPage() {
  const { session, profile, user, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileUpdate>({
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    },
  });

  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    try {
      // Fetch orders with menu item details
      const { data: orderData } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            menu_item_id,
            quantity,
            price,
            menu_items (name)
          )
        `
        )
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setOrders(orderData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchData();

      // Set up real-time subscriptions
      const orderSub = supabase
        .channel('user-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${session.user.id}`,
          },
          fetchData
        )
        .subscribe();

      return () => {
        orderSub.unsubscribe();
      };
    }

    // Return undefined for no cleanup needed
    return;
  }, [session, fetchData]);

  // Update form defaults when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile, form]);

  const handleProfileUpdate = async (data: ProfileUpdate) => {
    if (!session) {
      toast.error('No session found');
      return;
    }
    setIsSaving(true);

    try {
      console.log('🔄 Starting profile update...');
      console.log('- User ID:', session.user.id);
      console.log('- Update data:', data);

      const { data: updateResult, error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name || null,
          phone: data.phone || null,
          address: data.address || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }

      console.log('✅ Update successful:', updateResult);

      // Refresh profile data to show updates immediately
      console.log('🔄 Refreshing profile...');
      await refreshProfile();

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('❌ Profile update error:', error);
      toast.error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500 text-yellow-50';
      case 'confirmed':
        return 'bg-blue-500 text-blue-50';
      case 'preparing':
        return 'bg-orange-500 text-orange-50';
      case 'ready':
        return 'bg-green-500 text-green-50';
      case 'completed':
        return 'bg-gray-500 text-gray-50';
      case 'cancelled':
        return 'bg-red-500 text-red-50';
      default:
        return 'bg-gray-400 text-gray-50';
    }
  };

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    const date = new Date(timeStr ? `${dateStr}T${timeStr}` : dateStr);
    return date.toLocaleString('en-ZA', {
      dateStyle: 'medium',
      timeStyle: timeStr ? 'short' : 'short',
    });
  };

  // Show auth prompt if no session
  if (!session) {
    return (
      <AuthRequiredPrompt
        title="Account Access Required"
        message="Please sign in to view and manage your account information, order history, and personal details."
        feature="account"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
            </div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-2">
            My Account
          </h1>
          <p className="text-gray-400">
            Welcome back,{' '}
            {profile?.full_name || user?.email?.split('@')[0] || 'Customer'}!
          </p>
        </div>

        {/* Navigation Tabs - Moved to top */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'profile', label: 'Profile Information', icon: User },
            { id: 'orders', label: 'Order History', icon: Receipt },
            { id: 'update', label: 'Update Account', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-neonCyan text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-neonCyan flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your current account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Profile Picture Section */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-4 border-neonCyan shadow-lg">
                    <span className="text-black font-bold text-4xl">
                      {(profile?.full_name || user?.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Info Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-700 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-neonCyan" />
                    <div>
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="text-white font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-neonPink" />
                    <div>
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="text-white font-medium">
                        {profile?.full_name || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="text-white font-medium">
                        {profile?.phone || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-white font-medium">
                        {profile?.address || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`${profile?.is_admin ? 'border-red-500 text-red-400' : profile?.is_staff ? 'border-yellow-500 text-yellow-400' : 'border-green-500 text-green-400'} h-fit`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {profile?.is_admin
                        ? 'Administrator'
                        : profile?.is_staff
                          ? 'Staff Member'
                          : 'Customer'}
                    </Badge>
                    <div>
                      <p className="text-sm text-gray-400">Account Role</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Account Type</p>
                      <p className="text-white font-medium">
                        {profile?.is_admin
                          ? 'Administrator'
                          : profile?.is_staff
                            ? 'Staff Member'
                            : 'Customer'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-white font-medium">
                        {profile?.created_at 
                          ? new Date(profile.created_at).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'update' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-yellow-500 flex items-center gap-2">
                <User className="h-5 w-5" />
                Update Account Information
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Update Form */}
              <form
                onSubmit={form.handleSubmit(handleProfileUpdate)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="full_name"
                      className="text-gray-300 flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      {...form.register('full_name')}
                      placeholder="Enter your full name"
                      className="bg-gray-700 border-gray-600 text-white focus:border-neonCyan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-gray-300 flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register('phone')}
                      placeholder="Enter your phone number"
                      className="bg-gray-700 border-gray-600 text-white focus:border-neonPink"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-gray-300 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    {...form.register('address')}
                    placeholder="Enter your full address"
                    className="bg-gray-700 border-gray-600 text-white focus:border-yellow-500"
                  />
                  <p className="text-xs text-gray-400">
                    Your address will be auto-filled during checkout
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="neon-button w-full md:w-auto"
                >
                  {isSaving ? 'Saving...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'orders' && (
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-neonPink flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order History
              </CardTitle>
              <CardDescription>
                View your recent orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No orders yet</p>
                  <p className="text-sm text-gray-500">
                    Your order history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-600 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">
                            Order #{order.id}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {order.created_at ? formatDateTime(order.created_at) : 'Date unknown'}
                            • Pickup
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`${getStatusColor(order.status || 'pending')} mb-2`}
                          >
                            {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Unknown'}
                          </Badge>
                          <p className="text-lg font-bold text-white">
                            R{order.total_amount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-300">
                          Items:
                        </p>
                        {order.order_items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm bg-gray-700 p-2 rounded"
                          >
                            <span className="text-gray-300">
                              {item.menu_items?.name ||
                                `Item #${item.menu_item_id}`}{' '}
                              × {item.quantity}
                            </span>
                            <span className="text-white">
                              R{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.special_instructions && (
                        <div className="bg-gray-700 p-3 rounded">
                          <p className="text-sm font-medium text-gray-300">
                            Special Instructions:
                          </p>
                          <p className="text-sm text-gray-400">
                            {order.special_instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
