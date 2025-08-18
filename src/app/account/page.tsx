'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthRequiredPrompt from '@/components/AuthRequiredPrompt';
import { supabase } from '@/lib/supabaseClient';
import { updateUserProfile } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Clock,
  Receipt,
  Edit2,
  Save,
  X,
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

// Inline editing state
interface EditingField {
  field: 'full_name' | 'phone' | 'address' | null;
  value: string;
  saving: boolean;
}

export default function AccountPage() {
  const { session, profile, user, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Inline editing state
  const [editingField, setEditingField] = useState<EditingField>({
    field: null,
    value: '',
    saving: false,
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

  // Inline editing functions
  const startEditing = (field: 'full_name' | 'phone' | 'address') => {
    const currentValue = field === 'full_name' ? profile?.full_name || '' :
                        field === 'phone' ? profile?.phone || '' :
                        profile?.address || '';
    
    setEditingField({
      field,
      value: currentValue,
      saving: false,
    });
  };

  const cancelEditing = () => {
    setEditingField({
      field: null,
      value: '',
      saving: false,
    });
  };

  const saveField = async () => {
    if (!session || !editingField.field) return;
    
    setEditingField(prev => ({ ...prev, saving: true }));

    try {
      console.log('🔄 Updating field:', editingField.field, 'to:', editingField.value);

      // Use server action to update profile
      const result = await updateUserProfile(
        session.user.id,
        editingField.field,
        editingField.value || null
      );

      if (!result.success) {
        throw new Error(result.error || 'Update failed');
      }

      toast.success(`${editingField.field.replace('_', ' ')} updated successfully!`);
      
      // Refresh profile and exit editing mode
      await refreshProfile();
      cancelEditing();

    } catch (error) {
      console.error('❌ Field update error:', error);
      toast.error(`Failed to update ${editingField.field.replace('_', ' ')}`);
    } finally {
      setEditingField(prev => ({ ...prev, saving: false }));
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
          <p className="text-xs text-gray-500 mt-1">
            User ID: {session?.user?.id} | Email: {session?.user?.email}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'orders', label: 'Order History', icon: Receipt },
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
                My Profile
              </CardTitle>
              <CardDescription>
                Click the edit button next to any field to update your information
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

              {/* Inline Editable Fields */}
              <div className="space-y-6">
                {/* Email (Read-only) */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-neonCyan" />
                    <div>
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="text-white font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gray-500 text-gray-400">
                    Cannot be changed
                  </Badge>
                </div>

                {/* Full Name - Inline Editable */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <User className="h-5 w-5 text-neonPink" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Full Name</p>
                      {editingField.field === 'full_name' ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={editingField.value}
                            onChange={(e) => setEditingField(prev => ({ ...prev, value: e.target.value }))}
                            className="bg-gray-600 border-gray-500 text-white focus:border-neonPink"
                            placeholder="Enter your full name"
                            disabled={editingField.saving}
                          />
                          <Button
                            size="sm"
                            onClick={saveField}
                            disabled={editingField.saving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {editingField.saving ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={editingField.saving}
                            className="border-gray-500 text-gray-400 hover:bg-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-white font-medium">
                          {profile?.full_name || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                  {editingField.field !== 'full_name' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing('full_name')}
                      className="border-neonPink text-neonPink hover:bg-neonPink hover:text-black"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Phone Number - Inline Editable */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Phone className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Phone Number</p>
                      {editingField.field === 'phone' ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={editingField.value}
                            onChange={(e) => setEditingField(prev => ({ ...prev, value: e.target.value }))}
                            className="bg-gray-600 border-gray-500 text-white focus:border-yellow-500"
                            placeholder="Enter your phone number"
                            type="tel"
                            disabled={editingField.saving}
                          />
                          <Button
                            size="sm"
                            onClick={saveField}
                            disabled={editingField.saving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {editingField.saving ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={editingField.saving}
                            className="border-gray-500 text-gray-400 hover:bg-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-white font-medium">
                          {profile?.phone || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                  {editingField.field !== 'phone' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing('phone')}
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Address - Inline Editable */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Address</p>
                      {editingField.field === 'address' ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={editingField.value}
                            onChange={(e) => setEditingField(prev => ({ ...prev, value: e.target.value }))}
                            className="bg-gray-600 border-gray-500 text-white focus:border-purple-400"
                            placeholder="Enter your full address"
                            disabled={editingField.saving}
                          />
                          <Button
                            size="sm"
                            onClick={saveField}
                            disabled={editingField.saving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {editingField.saving ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={editingField.saving}
                            className="border-gray-500 text-gray-400 hover:bg-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-white font-medium">
                          {profile?.address || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                  {editingField.field !== 'address' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing('address')}
                      className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Account Info (Read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
                    <Badge
                      variant="outline"
                      className={`${profile?.is_admin ? 'border-red-500 text-red-400' : profile?.is_staff ? 'border-yellow-500 text-yellow-400' : 'border-green-500 text-green-400'}`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {profile?.is_admin
                        ? 'Administrator'
                        : profile?.is_staff
                          ? 'Staff Member'
                          : 'Customer'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
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
