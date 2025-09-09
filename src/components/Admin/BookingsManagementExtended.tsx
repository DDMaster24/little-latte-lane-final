'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Settings, Save, RotateCcw, 
  Clock, Users
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getSupabaseClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

type BookingsSettings = {
  id?: string;
  section_enabled: boolean;
  section_title: string;
  section_description: string;
  button_text: string;
  background_color: string;
  text_color: string;
  title_gradient: string;
  show_virtual_golf: boolean;
  virtual_golf_enabled: boolean;
  virtual_golf_description: string;
  booking_hours_start: string;
  booking_hours_end: string;
  max_party_size: number;
  booking_duration_minutes: number;
  advance_booking_days: number;
  require_food_order: boolean;
  created_at?: string;
  updated_at?: string;
};

type BookingRecord = {
  id: string;
  booking_date: string;
  booking_time: string;
  party_size: number;
  profiles: {
    full_name: string | null;
    email: string | null;
  };
};

export default function BookingsManagementExtended() {
  const { profile } = useAuth();
  const supabase = getSupabaseClient();
  
  const [settings, setSettings] = useState<BookingsSettings>({
    section_enabled: true,
    section_title: 'Make a Booking',
    section_description: 'Book the virtual golf simulator and optionally pre-order food. Choose your time slot and we\'ll have everything ready.',
    button_text: 'Book Now',
    background_color: '#0f0f0f',
    text_color: '#ffffff',
    title_gradient: 'bg-neon-gradient',
    show_virtual_golf: true,
    virtual_golf_enabled: false,
    virtual_golf_description: 'Virtual Golf Coming Soon! 🏌️‍♂️\n\nWe\'re putting the finishing touches on our state-of-the-art virtual golf simulator. Stay tuned for an amazing golf experience!',
    booking_hours_start: '09:00',
    booking_hours_end: '21:00',
    max_party_size: 6,
    booking_duration_minutes: 60,
    advance_booking_days: 30,
    require_food_order: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recentBookings, setRecentBookings] = useState<BookingRecord[]>([]);

  // Fetch bookings settings
  const fetchSettings = useCallback(async () => {
    try {
      // In a real implementation, you'd fetch from a bookings_settings table
      // For now, we'll use theme_settings with a specific category
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('category', 'bookings_section')
        .like('setting_key', 'homepage-%');

      if (error) {
        console.error('Error fetching bookings settings:', error);
      } else if (data && data.length > 0) {
        // Parse settings from database
        const dbSettings = data.reduce((acc: Record<string, unknown>, item: { setting_key: string; setting_value: unknown }) => {
          // Remove the homepage- prefix to get the actual setting key
          const cleanKey = item.setting_key.replace('homepage-', '');
          acc[cleanKey] = item.setting_value;
          return acc;
        }, {});
        
        setSettings(prev => ({ ...prev, ...dbSettings }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Fetch recent bookings for display
  const fetchRecentBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          booking_date, 
          booking_time, 
          party_size,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setRecentBookings(data || []);
      }
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
    fetchRecentBookings();
  }, [fetchSettings, fetchRecentBookings]);

  // Save settings to database
  const saveSettings = async () => {
    setSaving(true);
    try {
      // Convert settings object to individual theme_settings entries with homepage prefix
      const settingsEntries = Object.entries(settings).map(([key, value]) => ({
        setting_key: `homepage-${key}`,
        setting_value: String(value),
        category: 'bookings_section',
        setting_type: typeof value === 'boolean' ? 'boolean' : 
                     typeof value === 'number' ? 'number' : 'text'
      }));

      // Use upsert to insert or update each setting
      for (const entry of settingsEntries) {
        const { error } = await supabase
          .from('theme_settings')
          .upsert({
            ...entry,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'setting_key'
          });

        if (error) {
          console.error('Error saving setting:', entry.setting_key, error);
          throw error;
        }
      }

      toast.success('Bookings settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (!profile?.is_admin) {
    return (
      <div className="text-center text-red-400 p-8">
        Access denied. Admin only.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neonCyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings Management</h1>
          <p className="text-gray-400">Manage homepage Bookings section and booking settings</p>
        </div>
      </div>

      {/* Section Control Card */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Homepage Section Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Section */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-white">Bookings Section Status</h3>
              <p className="text-gray-400 text-sm">
                Toggle the entire Bookings section on the homepage
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={settings.section_enabled ? "default" : "secondary"}>
                {settings.section_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              <Switch
                checked={settings.section_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, section_enabled: checked }))
                }
              />
            </div>
          </div>

          {/* Section Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section-title" className="text-white">Section Title</Label>
              <Input
                id="section-title"
                value={settings.section_title}
                onChange={(e) => setSettings(prev => ({ ...prev, section_title: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Make a Booking"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button-text" className="text-white">Button Text</Label>
              <Input
                id="button-text"
                value={settings.button_text}
                onChange={(e) => setSettings(prev => ({ ...prev, button_text: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Book Now"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-description" className="text-white">Section Description</Label>
            <Textarea
              id="section-description"
              value={settings.section_description}
              onChange={(e) => setSettings(prev => ({ ...prev, section_description: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
              rows={3}
              placeholder="Book the virtual golf simulator and optionally pre-order food..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Virtual Golf Settings */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-400" />
            Virtual Golf Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Virtual Golf Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-white">Virtual Golf System</h3>
              <p className="text-gray-400 text-sm">
                Enable or disable the virtual golf booking system
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={settings.virtual_golf_enabled ? "default" : "secondary"}>
                {settings.virtual_golf_enabled ? 'Available' : 'Coming Soon'}
              </Badge>
              <Switch
                checked={settings.virtual_golf_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, virtual_golf_enabled: checked }))
                }
              />
            </div>
          </div>

          {/* Golf Description */}
          <div className="space-y-2">
            <Label htmlFor="golf-description" className="text-white">Virtual Golf Description</Label>
            <Textarea
              id="golf-description"
              value={settings.virtual_golf_description}
              onChange={(e) => setSettings(prev => ({ ...prev, virtual_golf_description: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
              rows={4}
              placeholder="Description for virtual golf section..."
            />
          </div>

          {/* Booking Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours-start" className="text-white flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Opening Time
              </Label>
              <Input
                id="hours-start"
                type="time"
                value={settings.booking_hours_start}
                onChange={(e) => setSettings(prev => ({ ...prev, booking_hours_start: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-end" className="text-white flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Closing Time
              </Label>
              <Input
                id="hours-end"
                type="time"
                value={settings.booking_hours_end}
                onChange={(e) => setSettings(prev => ({ ...prev, booking_hours_end: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-party" className="text-white flex items-center gap-2">
                <Users className="h-4 w-4" />
                Max Party Size
              </Label>
              <Input
                id="max-party"
                type="number"
                min="1"
                max="10"
                value={settings.max_party_size}
                onChange={(e) => setSettings(prev => ({ ...prev, max_party_size: parseInt(e.target.value) }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">Booking Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="30"
                max="180"
                step="15"
                value={settings.booking_duration_minutes}
                onChange={(e) => setSettings(prev => ({ ...prev, booking_duration_minutes: parseInt(e.target.value) }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance-days" className="text-white">Advance Booking (days)</Label>
              <Input
                id="advance-days"
                type="number"
                min="1"
                max="90"
                value={settings.advance_booking_days}
                onChange={(e) => setSettings(prev => ({ ...prev, advance_booking_days: parseInt(e.target.value) }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={settings.require_food_order}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require_food_order: checked }))}
              />
              <Label className="text-white">Require Food Order</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-neonPink" />
            Recent Bookings ({recentBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No Recent Bookings</h3>
              <p className="text-gray-500">Bookings will appear here once customers start booking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking: BookingRecord) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{booking.booking_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{booking.party_size} people</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{booking.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-gray-400 text-xs">{booking.profiles?.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end space-x-2">
        <Button
          onClick={() => fetchSettings()}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
