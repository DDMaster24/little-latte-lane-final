import React, { useState, useEffect } from 'react'
import { Text, RichText, types } from 'react-bricks/frontend'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

type BookingsSettings = {
  section_enabled: boolean;
  section_title: string;
  section_description: string;
  button_text: string;
};

//========================================
// Component
//========================================
const LLLBookingsSection: types.Brick = () => {
  const supabase = getSupabaseClient();
  const [settings, setSettings] = useState<BookingsSettings>({
    section_enabled: true,
    section_title: 'Make a Booking',
    section_description: 'Book the virtual golf simulator and optionally pre-order food. Choose your time slot and we\'ll have everything ready.',
    button_text: 'Book Now'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('theme_settings')
          .select('setting_key, setting_value')
          .eq('category', 'bookings_section')
          .like('setting_key', 'homepage-%');

        if (!error && data) {
          const dbSettings = data.reduce((acc: Record<string, string>, item: { setting_key: string; setting_value: string | null }) => {
            if (item.setting_value !== null) {
              // Remove the homepage- prefix to get the actual setting key
              const cleanKey = item.setting_key.replace('homepage-', '');
              acc[cleanKey] = item.setting_value;
            }
            return acc;
          }, {});
          
          setSettings(prev => ({
            ...prev,
            section_enabled: dbSettings.section_enabled !== 'false',
            section_title: dbSettings.section_title || prev.section_title,
            section_description: dbSettings.section_description || prev.section_description,
            button_text: dbSettings.button_text || prev.button_text
          }));
        }
      } catch (error) {
        console.error('Error fetching bookings settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [supabase]);

  if (loading) {
    return (
      <section 
        className="w-full shadow-neon rounded-xl animate-fade-in"
        style={{
          backgroundColor: '#0f0f0f',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-center py-8 xs:py-12 px-6">
          <Text
            propName="loadingTitle"
            placeholder="Loading..."
            renderBlock={(props) => (
              <h2 
                className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent"
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
  if (!settings.section_enabled) {
    return null; // Don't render the section at all
  }

  return (
    <section 
      className="w-full shadow-neon rounded-xl animate-fade-in"
      style={{
        backgroundColor: '#0f0f0f',
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
              className="text-fluid-2xl xs:text-fluid-3xl md:text-fluid-4xl font-bold mb-4 xs:mb-6 bg-neon-gradient bg-clip-text text-transparent"
              {...props.attributes}
            >
              {props.children}
            </h2>
          )}
        />
        
        <RichText
          propName="sectionDescription"
          placeholder={settings.section_description}
          renderBlock={(props) => (
            <p 
              className="text-fluid-base xs:text-fluid-lg mb-6 xs:mb-8 text-neonText max-w-3xl mx-auto leading-relaxed"
              {...props.attributes}
            >
              {props.children}
            </p>
          )}
        />
        
        {/* Navigation button */}
        <Text
          propName="buttonText"
          placeholder={settings.button_text}
          renderBlock={(props) => (
            <Link href="/bookings" aria-label="Book a golf session">
              <Button 
                className="neon-button px-4 xs:px-6 py-3 xs:py-4 text-fluid-base xs:text-fluid-lg hover:shadow-xl touch-target"
                {...props.attributes}
              >
                {props.children}
              </Button>
            </Link>
          )}
        />
      </div>
    </section>
  )
}

//========================================
// Brick Schema
//========================================
LLLBookingsSection.schema = {
  name: 'lll-bookings-section',
  label: 'Bookings Section',
  category: 'Little Latte Lane',
  
  // Sidebar controls
  sideEditProps: [
    {
      name: 'backgroundStyle',
      label: 'Background Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'dark', label: 'Dark Background' },
          { value: 'neon', label: 'Neon Gradient' },
        ],
      },
    },
    {
      name: 'alignment',
      label: 'Text Alignment',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'center', label: 'Center' },
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
      },
    },
  ],

  // Default values
  getDefaultProps: () => ({
    sectionTitle: 'Make a Booking',
    sectionDescription: 'Book the virtual golf simulator and optionally pre-order food. Choose your time slot and we\'ll have everything ready.',
    buttonText: 'Book Now',
    loadingTitle: 'Loading...',
    backgroundStyle: 'dark',
    alignment: 'center',
  }),
}

export default LLLBookingsSection