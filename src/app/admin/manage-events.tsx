'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Star,
  Gift,
  Zap,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Database } from '@/types/supabase';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];

export default function ManageEvents() {
  const { profile } = useAuth();
  const supabase = getSupabaseClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'event' as 'event' | 'special' | 'news' | 'promotion',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  useEffect(() => {
    if (profile?.is_admin) {
      fetchEvents();
    }
  }, [profile]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      const eventData: EventInsert = {
        ...formData,
        end_date: formData.end_date || null,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated successfully!');
      } else {
        const { error } = await supabase.from('events').insert([eventData]);

        if (error) throw error;
        toast.success('Event created successfully!');
      }

      await fetchEvents();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      type: (event.event_type || 'special') as 'event' | 'special' | 'news' | 'promotion',
      start_date: event.start_date || '',
      end_date: event.end_date || '',
      is_active: event.is_active || false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Event deleted successfully!');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const toggleActive = async (eventId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq('id', eventId);

      if (error) throw error;
      toast.success(
        `Event ${!isActive ? 'activated' : 'deactivated'} successfully!`
      );
      await fetchEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'event',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    setEditingEvent(null);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'special':
        return <Gift className="h-4 w-4" />;
      case 'news':
        return <Zap className="h-4 w-4" />;
      case 'promotion':
        return <Star className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'text-blue-400';
      case 'special':
        return 'text-green-400';
      case 'news':
        return 'text-pink-400';
      case 'promotion':
        return 'text-purple-400';
      default:
        return 'text-cyan-400';
    }
  };

  if (!profile?.is_admin) {
    return (
      <div className="text-center text-red-400">Access denied. Admin only.</div>
    );
  }

  return (
    <Card className="bg-black/50 backdrop-blur-md border-neon-green/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-neon-green flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Manage Events & Specials
          </CardTitle>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-neon-green text-black hover:bg-neon-green/80"
                onClick={resetForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-neon-green/50 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-neon-green">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-black/70 border-neon-blue/50 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-black/70 border-neon-blue/50 text-white"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(
                        value: 'event' | 'special' | 'news' | 'promotion'
                      ) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="bg-black/70 border-neon-blue/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-neon-blue/50">
                        <SelectItem value="event">📅 Event</SelectItem>
                        <SelectItem value="special">
                          🎁 Special Offer
                        </SelectItem>
                        <SelectItem value="news">⚡ News</SelectItem>
                        <SelectItem value="promotion">🎯 Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="bg-black/70 border-neon-blue/50 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="bg-black/70 border-neon-blue/50 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="border-gray-500 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-neon-green text-black hover:bg-neon-green/80"
                  >
                    {editingEvent ? 'Update' : 'Create'} Event
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green mx-auto"></div>
            <p className="text-neon-green mt-2">Loading events...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-neon-green/30">
                  <TableHead className="text-neon-green">Type</TableHead>
                  <TableHead className="text-neon-green">Title</TableHead>
                  <TableHead className="text-neon-green">Description</TableHead>
                  <TableHead className="text-neon-green">Dates</TableHead>
                  <TableHead className="text-neon-green">Status</TableHead>
                  <TableHead className="text-neon-green">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} className="border-neon-green/20">
                    <TableCell>
                      <div
                        className={`flex items-center gap-2 ${getEventColor(event.event_type || 'special')}`}
                      >
                        {getEventIcon(event.event_type || 'special')}
                        <span className="capitalize">{event.event_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {event.title}
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-xs truncate">
                      {event.description}
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">
                      {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'No date'}
                      {event.end_date && (
                        <> - {new Date(event.end_date).toLocaleDateString()}</>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(event.id, event.is_active || false)}
                        className={
                          event.is_active ? 'text-green-400' : 'text-gray-500'
                        }
                      >
                        {event.is_active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {events.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events created yet. Add your first event above!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
