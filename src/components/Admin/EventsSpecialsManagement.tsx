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
  Star, Calendar, Gift, Zap, Plus, Edit, Trash2, 
  Eye, EyeOff, Settings, Save, RotateCcw 
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getSupabaseClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

type Event = {
  id: string;
  title: string;
  description: string;
  event_type: 'event' | 'special' | 'news';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  background_image?: string;
  background_color?: string;
  text_color?: string;
  button_text?: string;
  button_link?: string;
  priority?: number;
  display_order?: number;
  created_at: string;
};

type SectionSettings = {
  id?: string;
  section_title: string;
  section_subtitle: string;
  section_background_image?: string;
  section_background_color: string;
  section_text_color: string;
  title_gradient: string;
  max_events_display: number;
  layout_style: 'grid' | 'carousel' | 'list';
  show_icons: boolean;
  show_dates: boolean;
  show_buttons: boolean;
  section_enabled: boolean; // This is the key field for enabling/disabling
};

export default function EventsSpecialsManagement() {
  const { profile } = useAuth();
  const supabase = getSupabaseClient();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [settings, setSettings] = useState<SectionSettings>({
    section_title: 'Events & Specials',
    section_subtitle: 'Stay updated with our latest happenings',
    section_background_color: '#0f0f0f',
    section_text_color: '#ffffff',
    title_gradient: 'bg-neon-gradient',
    max_events_display: 6,
    layout_style: 'grid',
    show_icons: true,
    show_dates: true,
    show_buttons: true,
    section_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showNewEventForm, setShowNewEventForm] = useState(false);

  // Fetch events and settings
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events || []);
        setSettings(prev => ({ ...prev, ...data.settings }));
      } else {
        toast.error('Failed to load events and settings');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save section settings (including enable/disable)
  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'settings',
          settings
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  // Toggle event active status
  const toggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event',
          id: eventId,
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, is_active: !currentStatus }
            : event
        ));
        toast.success(`Event ${!currentStatus ? 'enabled' : 'disabled'}`);
      } else {
        toast.error('Failed to update event status');
      }
    } catch (error) {
      console.error('Error toggling event:', error);
      toast.error('Error updating event');
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId })
      });

      if (response.ok) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Error deleting event');
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'special': return <Gift className="h-4 w-4" />;
      case 'news': return <Zap className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'event': return 'border-blue-500 text-blue-400';
      case 'special': return 'border-green-500 text-green-400';
      case 'news': return 'border-pink-500 text-pink-400';
      default: return 'border-cyan-500 text-cyan-400';
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
          <h1 className="text-2xl font-bold text-white">Events & Specials Management</h1>
          <p className="text-gray-400">Manage homepage Events section and individual events</p>
        </div>
        <Button
          onClick={() => setShowNewEventForm(true)}
          className="bg-neonCyan hover:bg-neonCyan/80 text-black font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Section Control Card */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-neonCyan" />
            Homepage Section Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Section */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-white">Events Section Status</h3>
              <p className="text-gray-400 text-sm">
                Toggle the entire Events & Specials section on the homepage
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

          {/* Section Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section-title" className="text-white">Section Title</Label>
              <Input
                id="section-title"
                value={settings.section_title}
                onChange={(e) => setSettings(prev => ({ ...prev, section_title: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-subtitle" className="text-white">Section Subtitle</Label>
              <Input
                id="section-subtitle"
                value={settings.section_subtitle}
                onChange={(e) => setSettings(prev => ({ ...prev, section_subtitle: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-events" className="text-white">Max Events to Display</Label>
              <Input
                id="max-events"
                type="number"
                min="1"
                max="12"
                value={settings.max_events_display}
                onChange={(e) => setSettings(prev => ({ ...prev, max_events_display: parseInt(e.target.value) }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="layout-style" className="text-white">Layout Style</Label>
              <select
                id="layout-style"
                value={settings.layout_style}
                onChange={(e) => setSettings(prev => ({ ...prev, layout_style: e.target.value as 'grid' | 'carousel' | 'list' }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              >
                <option value="grid">Grid</option>
                <option value="carousel">Carousel</option>
                <option value="list">List</option>
              </select>
            </div>
          </div>

          {/* Display Options */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.show_icons}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_icons: checked }))}
              />
              <Label className="text-white">Show Icons</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.show_dates}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_dates: checked }))}
              />
              <Label className="text-white">Show Dates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.show_buttons}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_buttons: checked }))}
              />
              <Label className="text-white">Show Buttons</Label>
            </div>
          </div>

          {/* Save Settings */}
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => fetchData()}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-neonCyan hover:bg-neonCyan/80 text-black font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-neonPink" />
            Events & Specials ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No Events Yet</h3>
              <p className="text-gray-500 mb-4">Create your first event to get started</p>
              <Button
                onClick={() => setShowNewEventForm(true)}
                className="bg-neonCyan hover:bg-neonCyan/80 text-black font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`flex items-center gap-2 ${getEventColor(event.event_type)}`}>
                      {getEventIcon(event.event_type)}
                      <Badge variant="outline" className={getEventColor(event.event_type)}>
                        {event.event_type}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">{event.title}</h4>
                      <p className="text-gray-400 text-sm truncate">{event.description}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(event.start_date).toLocaleDateString()}
                        {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Badge variant={event.is_active ? "default" : "secondary"}>
                      {event.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => toggleEventStatus(event.id, event.is_active)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      {event.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={() => setEditingEvent(event)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteEvent(event.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
