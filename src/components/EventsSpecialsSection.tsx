'use client';

import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Gift, Zap, Edit, Plus, Trash2, Palette } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';

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
};

export default function EventsSpecialsSection() {
  const { profile, loading: authLoading } = useAuth();
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
    show_buttons: true
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingSettings, setEditingSettings] = useState(false);
  const supabase = getSupabaseClient();

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events.filter((event: Event) => event.is_active));
        setSettings(data.settings);
      } else {
        console.error('Error fetching events:', data.error);
      }
    } catch (err) {
      console.error('Unexpected error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to real-time updates
    const eventsSubscription = supabase
      .channel('events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        fetchData
      )
      .subscribe();

    const settingsSubscription = supabase
      .channel('events_section_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events_section_settings' },
        fetchData
      )
      .subscribe();

    return () => {
      eventsSubscription.unsubscribe();
      settingsSubscription.unsubscribe();
    };
  }, [fetchData, supabase]);

  const getEventIcon = (type: string) => {
    if (!settings.show_icons) return null;
    
    switch (type) {
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'special':
        return <Gift className="h-5 w-5" />;
      case 'news':
        return <Zap className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'border-neon-blue text-neon-blue';
      case 'special':
        return 'border-neon-green text-neon-green';
      case 'news':
        return 'border-neon-pink text-neon-pink';
      default:
        return 'border-neon-cyan text-neon-cyan';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    try {
      const response = await fetch('/api/events', {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event',
          id: editingEvent?.id,
          ...eventData
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchData();
        setEditingEvent(null);
        setIsEditing(false);
      } else {
        console.error('Error saving event:', data.error);
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchData();
      } else {
        console.error('Error deleting event:', data.error);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleSaveSettings = async (settingsData: Partial<SectionSettings>) => {
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'settings',
          ...settingsData
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
        setEditingSettings(false);
      } else {
        console.error('Error saving settings:', data.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (loading) {
    return (
      <section 
        className="py-12 px-6 text-center shadow-neon rounded-lg m-4 animate-fade-in"
        style={{ backgroundColor: settings.section_background_color }}
        data-editable="events-section"
      >
        <div className="animate-pulse">
          <h2 
            className={`text-3xl font-bold mb-8 ${settings.title_gradient} bg-clip-text text-transparent`}
            data-editable="events-section-title"
          >
            Loading Events & Specials...
          </h2>
        </div>
      </section>
    );
  }

  const eventsToShow = events.slice(0, settings.max_events_display);

  if (eventsToShow.length === 0) {
    return (
      <section 
        className="py-12 px-6 text-center shadow-neon rounded-lg m-4 animate-fade-in relative"
        style={{ 
          backgroundColor: settings.section_background_color,
          backgroundImage: settings.section_background_image ? `url(${settings.section_background_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        data-editable="events-section"
      >
        {/* Admin Controls */}
        {profile?.is_admin === true && !authLoading && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingSettings(true)}
              className="bg-black/50 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black"
            >
              <Palette className="h-4 w-4 mr-1" />
              Edit Section
            </Button>
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              className="bg-neonCyan text-black hover:bg-neonCyan/80"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
        )}

        <h2 
          className={`text-3xl font-bold mb-4 ${settings.title_gradient} bg-clip-text text-transparent`}
          style={{ color: settings.title_gradient.includes('gradient') ? undefined : settings.section_text_color }}
          data-editable="events-section-title"
        >
          {settings.section_title}
        </h2>
        
        <p 
          className="text-lg mb-4"
          style={{ color: settings.section_text_color }}
          data-editable="events-section-subtitle"
        >
          {settings.section_subtitle}
        </p>
        
        <p 
          className="text-lg"
          style={{ color: settings.section_text_color }}
          data-editable="events-no-content-message"
        >
          No current events or specials. Check back soon for exciting updates!
        </p>
        
        {profile?.is_admin === true && !authLoading && (
          <p 
            className="text-neon-blue text-sm mt-4"
            data-editable="events-admin-hint"
          >
            Admin: Use the buttons above to customize this section and add events
          </p>
        )}
      </section>
    );
  }

  return (
    <>
      <section 
        className="container-responsive section-padding-sm relative"
        data-editable="events-section-container"
      >
        <div 
          className="shadow-neon rounded-xl overflow-hidden animate-fade-in relative"
          style={{ 
            backgroundColor: settings.section_background_color,
            backgroundImage: settings.section_background_image ? `url(${settings.section_background_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          data-editable="events-section-background"
        >
          {/* Admin Controls */}
          {profile?.is_admin === true && !authLoading && (
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingSettings(true)}
                className="bg-black/50 border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black"
              >
                <Palette className="h-4 w-4 mr-1" />
                Edit Section
              </Button>
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="bg-neonCyan text-black hover:bg-neonCyan/80"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
            </div>
          )}

          <div className="text-center py-8 xs:py-12 px-6">
            <h2 
              className={`text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold ${settings.title_gradient} bg-clip-text text-transparent mb-4`}
              style={{ color: settings.title_gradient.includes('gradient') ? undefined : settings.section_text_color }}
              data-editable="events-section-title"
            >
              {settings.section_title}
            </h2>
            
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: settings.section_text_color }}
              data-editable="events-section-subtitle"
            >
              {settings.section_subtitle}
            </p>
          </div>

          <div className="px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12">
            <div className={`max-w-6xl mx-auto ${
              settings.layout_style === 'grid' ? 'grid-responsive-3' :
              settings.layout_style === 'list' ? 'space-y-4' :
              'flex overflow-x-auto gap-6'
            }`}>
              {eventsToShow.map((event) => (
                <Card
                  key={event.id}
                  className={`backdrop-blur-md border-2 ${getEventColor(event.event_type)} hover:shadow-neon transition-all duration-300 transform hover:scale-105 relative`}
                  style={{ 
                    backgroundColor: event.background_color || '#000000aa',
                    backgroundImage: event.background_image ? `url(${event.background_image})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  data-editable="event-card"
                >
                  {/* Admin Controls for Each Event */}
                  {profile?.is_admin === true && !authLoading && (
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingEvent(event);
                          setIsEditing(true);
                        }}
                        className="h-6 w-6 p-0 bg-black/50 text-white hover:bg-neonCyan hover:text-black"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="h-6 w-6 p-0 bg-black/50 text-white hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center gap-2 ${getEventColor(event.event_type)}`}
                      >
                        {getEventIcon(event.event_type)}
                        <span className="text-xs uppercase font-semibold tracking-wider">
                          {event.event_type}
                        </span>
                      </div>
                      {settings.show_dates && (
                        <div 
                          className="text-xs"
                          style={{ color: event.text_color || settings.section_text_color }}
                        >
                          {formatDate(event.start_date)}
                          {event.end_date && event.end_date !== event.start_date && (
                            <> - {formatDate(event.end_date)}</>
                          )}
                        </div>
                      )}
                    </div>
                    <CardTitle
                      className={`text-lg font-bold ${getEventColor(event.event_type)}`}
                      style={{ color: event.text_color || undefined }}
                      data-editable="event-title"
                    >
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p 
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: event.text_color || settings.section_text_color }}
                      data-editable="event-description"
                    >
                      {event.description}
                    </p>
                    {settings.show_buttons && event.button_text && (
                      <Button
                        className={`w-full font-semibold ${
                          event.event_type === 'special' 
                            ? 'bg-neon-green text-black hover:bg-neon-green/80' 
                            : 'bg-neon-blue text-black hover:bg-neon-blue/80'
                        }`}
                        size="sm"
                        onClick={() => {
                          if (event.button_link) {
                            window.location.href = event.button_link;
                          }
                        }}
                      >
                        {event.button_text}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {profile?.is_admin === true && !authLoading && (
            <div className="text-center pb-6">
              <Button
                variant="outline"
                className="border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black"
                onClick={() => (window.location.href = '/admin')}
              >
                Manage All Events & Specials
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Event Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            <EventForm
              event={editingEvent}
              onSave={handleSaveEvent}
              onCancel={() => {
                setIsEditing(false);
                setEditingEvent(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Section Settings Modal */}
      {editingSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              Edit Events Section Settings
            </h3>
            <SectionSettingsForm
              settings={settings}
              onSave={handleSaveSettings}
              onCancel={() => setEditingSettings(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Event Form Component
function EventForm({ 
  event, 
  onSave, 
  onCancel 
}: { 
  event?: Event | null; 
  onSave: (data: Partial<Event>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_type: event?.event_type || 'event' as 'event' | 'special' | 'news',
    start_date: event?.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    end_date: event?.end_date?.split('T')[0] || '',
    background_color: event?.background_color || '#1a1a1a',
    text_color: event?.text_color || '#ffffff',
    button_text: event?.button_text || '',
    button_link: event?.button_link || '',
    priority: event?.priority || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          rows={3}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Type</label>
          <select
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value as 'event' | 'special' | 'news' })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          >
            <option value="event">Event</option>
            <option value="special">Special</option>
            <option value="news">News</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">Priority</label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
            min="0"
            max="10"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Start Date</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">End Date (Optional)</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Background Color</label>
          <input
            type="color"
            value={formData.background_color}
            onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
            className="w-full h-10 bg-gray-800 border border-gray-600 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">Text Color</label>
          <input
            type="color"
            value={formData.text_color}
            onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
            className="w-full h-10 bg-gray-800 border border-gray-600 rounded"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Button Text</label>
          <input
            type="text"
            value={formData.button_text}
            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
            placeholder="e.g., Learn More"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">Button Link</label>
          <input
            type="text"
            value={formData.button_link}
            onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
            placeholder="e.g., /menu or https://..."
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          className="bg-neonCyan text-black hover:bg-neonCyan/80"
        >
          {event ? 'Update Event' : 'Create Event'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Section Settings Form Component
function SectionSettingsForm({ 
  settings, 
  onSave, 
  onCancel 
}: { 
  settings: SectionSettings; 
  onSave: (data: Partial<SectionSettings>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Section Title</label>
          <input
            type="text"
            value={formData.section_title}
            onChange={(e) => setFormData({ ...formData, section_title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">Layout Style</label>
          <select
            value={formData.layout_style}
            onChange={(e) => setFormData({ ...formData, layout_style: e.target.value as 'grid' | 'carousel' | 'list' })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
            <option value="carousel">Carousel</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white mb-1">Section Subtitle</label>
        <input
          type="text"
          value={formData.section_subtitle}
          onChange={(e) => setFormData({ ...formData, section_subtitle: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Background Color</label>
          <input
            type="color"
            value={formData.section_background_color}
            onChange={(e) => setFormData({ ...formData, section_background_color: e.target.value })}
            className="w-full h-10 bg-gray-800 border border-gray-600 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-1">Text Color</label>
          <input
            type="color"
            value={formData.section_text_color}
            onChange={(e) => setFormData({ ...formData, section_text_color: e.target.value })}
            className="w-full h-10 bg-gray-800 border border-gray-600 rounded"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white mb-1">Max Events to Display</label>
        <input
          type="number"
          value={formData.max_events_display}
          onChange={(e) => setFormData({ ...formData, max_events_display: parseInt(e.target.value) || 6 })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
          min="1"
          max="12"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white mb-2">Display Options</label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              checked={formData.show_icons}
              onChange={(e) => setFormData({ ...formData, show_icons: e.target.checked })}
              className="mr-2"
            />
            Show Icons
          </label>
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              checked={formData.show_dates}
              onChange={(e) => setFormData({ ...formData, show_dates: e.target.checked })}
              className="mr-2"
            />
            Show Dates
          </label>
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              checked={formData.show_buttons}
              onChange={(e) => setFormData({ ...formData, show_buttons: e.target.checked })}
              className="mr-2"
            />
            Show Buttons
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          className="bg-neonCyan text-black hover:bg-neonCyan/80"
        >
          Save Settings
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
