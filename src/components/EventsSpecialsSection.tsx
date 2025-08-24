'use client';

import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Gift, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';

type Event = {
  id: string; // Changed to string for UUID
  title: string;
  description: string;
  type: 'event' | 'special' | 'news';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
};

export default function EventsSpecialsSection() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchEvents();

    // Subscribe to real-time updates
    const eventsSubscription = supabase
      .channel('events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        fetchEvents
      )
      .subscribe();

    return () => {
      eventsSubscription.unsubscribe();
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0]) // Only show current/future events
        .order('start_date', { ascending: true })
        .limit(6); // Show max 6 events

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        // Map database fields to interface structure
        const mappedEvents = data?.map(event => ({
          ...event,
          type: event.event_type as 'event' | 'special' | 'news' || 'event'
        })) || [];
        setEvents(mappedEvents as Event[]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
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

  if (loading) {
    return (
      <section className="bg-darkBg py-12 px-6 text-center shadow-neon rounded-lg m-4 animate-fade-in">
        <div className="animate-pulse">
          <h2 className="text-3xl font-bold mb-8 bg-neon-gradient">
            Loading Events & Specials...
          </h2>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="bg-darkBg py-12 px-6 text-center shadow-neon rounded-lg m-4 animate-fade-in">
        <h2 className="text-3xl font-bold mb-8 bg-neon-gradient">
          Events & Specials
        </h2>
        <p className="text-neonText text-lg">
          No current events or specials. Check back soon for exciting updates!
        </p>
        {profile?.is_admin && (
          <p className="text-neon-blue text-sm mt-4">
            Admin: Use the Admin Panel to add events and specials
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="container-responsive section-padding-sm">
      <div className="bg-darkBg shadow-neon rounded-xl overflow-hidden animate-fade-in">
        <div className="text-center py-8 xs:py-12 px-6">
          <h2 className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent">
            🎉 Events & Specials
          </h2>
        </div>

        <div className="px-4 xs:px-6 sm:px-8 pb-8 xs:pb-12">
          <div className="grid-responsive-3 max-w-6xl mx-auto">
            {events.map((event) => (
              <Card
                key={event.id}
            className={`bg-black/50 backdrop-blur-md border-2 ${getEventColor(event.type)} hover:shadow-neon transition-all duration-300 transform hover:scale-105`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-2 ${getEventColor(event.type)}`}
                >
                  {getEventIcon(event.type)}
                  <span className="text-xs uppercase font-semibold tracking-wider">
                    {event.type}
                  </span>
                </div>
                <div className="text-xs text-neonText">
                  {formatDate(event.start_date)}
                  {event.end_date && event.end_date !== event.start_date && (
                    <> - {formatDate(event.end_date)}</>
                  )}
                </div>
              </div>
              <CardTitle
                className={`text-lg font-bold ${getEventColor(event.type)}`}
              >
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neonText text-sm leading-relaxed">
                {event.description}
              </p>
              {event.type === 'special' && (
                <Button
                  className="mt-4 w-full bg-neon-green text-black hover:bg-neon-green/80 font-semibold"
                  size="sm"
                >
                  Claim Special
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {profile?.is_admin && (
        <div className="mt-8 text-center">
          <Button
            className="bg-neon-blue text-black hover:bg-neon-blue/80"
            onClick={() => (window.location.href = '/admin')}
          >
            Manage Events & Specials
          </Button>
        </div>
      )}
        </div>
      </div>
    </section>
  );
}
