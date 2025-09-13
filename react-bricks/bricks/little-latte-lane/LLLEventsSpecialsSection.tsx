import React, { useState, useEffect, useCallback } from 'react'
import { Text, RichText, types } from 'react-bricks/frontend'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Star, Gift, Zap } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase-client'

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
  section_enabled?: boolean;
};

//========================================
// Component
//========================================
const LLLEventsSpecialsSection: types.Brick = () => {
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

  if (loading) {
    return (
      <section 
        className="container-responsive section-padding-sm shadow-neon rounded-xl animate-fade-in"
        style={{ backgroundColor: settings.section_background_color }}
      >
        <div className="text-center animate-pulse">
          <Text
            propName="loadingTitle"
            placeholder="Loading Events & Specials..."
            renderBlock={(props) => (
              <h2 
                className={`text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold ${settings.title_gradient} bg-clip-text text-transparent mb-4`}
                {...props.attributes}
              >
                {props.children}
              </h2>
            )}
          />
        </div>
      </section>
    );
  }

  // Check if section is disabled by admin
  if (settings.section_enabled === false) {
    return null; // Don't render the section at all
  }

  const eventsToShow = events.slice(0, settings.max_events_display);

  if (eventsToShow.length === 0) {
    return (
      <section 
        className="w-full shadow-neon rounded-xl animate-fade-in"
        style={{ 
          backgroundColor: settings.section_background_color,
          backgroundImage: settings.section_background_image ? `url(${settings.section_background_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center py-8 xs:py-12 px-6">
          <Text
            propName="sectionTitle"
            placeholder={settings.section_title}
            renderBlock={(props) => (
              <h2 
                className={`text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold ${settings.title_gradient} bg-clip-text text-transparent mb-4`}
                style={{ color: settings.title_gradient.includes('gradient') ? undefined : settings.section_text_color }}
                {...props.attributes}
              >
                {props.children}
              </h2>
            )}
          />
          
          <RichText
            propName="sectionSubtitle"
            placeholder={settings.section_subtitle}
            renderBlock={(props) => (
              <p 
                className="text-lg mb-4 max-w-2xl mx-auto"
                style={{ color: settings.section_text_color }}
                {...props.attributes}
              >
                {props.children}
              </p>
            )}
          />
          
          <Text
            propName="noEventsMessage"
            placeholder="No current events or specials. Check back soon for exciting updates!"
            renderBlock={(props) => (
              <p 
                className="text-lg"
                style={{ color: settings.section_text_color }}
                {...props.attributes}
              >
                {props.children}
              </p>
            )}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div 
        className="w-full shadow-neon rounded-xl overflow-hidden animate-fade-in"
        style={{ 
          backgroundColor: settings.section_background_color,
          backgroundImage: settings.section_background_image ? `url(${settings.section_background_image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center py-8 xs:py-12 px-6">
          <Text
            propName="sectionTitle"
            placeholder={settings.section_title}
            renderBlock={(props) => (
              <h2 
                className={`text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold ${settings.title_gradient} bg-clip-text text-transparent mb-4`}
                style={{ color: settings.title_gradient.includes('gradient') ? undefined : settings.section_text_color }}
                {...props.attributes}
              >
                {props.children}
              </h2>
            )}
          />
          
          <RichText
            propName="sectionSubtitle"
            placeholder={settings.section_subtitle}
            renderBlock={(props) => (
              <p 
                className="text-lg max-w-2xl mx-auto"
                style={{ color: settings.section_text_color }}
                {...props.attributes}
              >
                {props.children}
              </p>
            )}
          />
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
                className={`backdrop-blur-md border-2 ${getEventColor(event.event_type)} hover:shadow-neon transition-all duration-300 transform hover:scale-105`}
                style={{ 
                  backgroundColor: event.background_color || '#000000aa',
                  backgroundImage: event.background_image ? `url(${event.background_image})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
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
                  >
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p 
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: event.text_color || settings.section_text_color }}
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
      </div>
    </section>
  )
}

//========================================
// Brick Schema
//========================================
LLLEventsSpecialsSection.schema = {
  name: 'lll-events-specials-section',
  label: 'Events & Specials Section',
  category: 'Little Latte Lane',
  
  // Sidebar controls
  sideEditProps: [
    {
      name: 'layoutStyle',
      label: 'Layout Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'grid', label: 'Grid Layout' },
          { value: 'list', label: 'List Layout' },
          { value: 'carousel', label: 'Carousel Layout' },
        ],
      },
    },
    {
      name: 'showIcons',
      label: 'Show Event Type Icons',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'showDates',
      label: 'Show Event Dates',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'showButtons',
      label: 'Show Action Buttons',
      type: types.SideEditPropType.Boolean,
    },
  ],

  // Default values
  getDefaultProps: () => ({
    sectionTitle: 'Events & Specials',
    sectionSubtitle: 'Stay updated with our latest happenings',
    loadingTitle: 'Loading Events & Specials...',
    noEventsMessage: 'No current events or specials. Check back soon for exciting updates!',
    layoutStyle: 'grid',
    showIcons: true,
    showDates: true,
    showButtons: true,
  }),
}

export default LLLEventsSpecialsSection