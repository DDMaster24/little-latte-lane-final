import { NextResponse } from 'next/server';
import type { CarouselPanel } from '@/lib/carouselTemplates';

// Sample carousel panels for testing the original design
const samplePanels: CarouselPanel[] = [
  {
    id: '1',
    panel_order: 1,
    template_id: 'opening-hours',
    panel_id: 'hours-1',
    is_active: true,
    config: {
      title: { enabled: true, text: 'Opening Hours' },
      description: { enabled: true, text: 'Fresh coffee and delicious food daily' },
      bgColor: 'from-gray-800 to-gray-900',
      borderColor: 'border-neonCyan/50',
      icon: { enabled: true, name: 'Clock' },
      schedule: {
        enabled: true,
        items: [
          { day: 'Mon-Fri', hours: '7:00 AM - 8:00 PM' },
          { day: 'Saturday', hours: '8:00 AM - 9:00 PM' },
          { day: 'Sunday', hours: '8:00 AM - 7:00 PM' }
        ]
      },
      badge: { enabled: true, text: 'Now Open', color: 'bg-green-500' }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    panel_order: 2,
    template_id: 'features',
    panel_id: 'features-1',
    is_active: true,
    config: {
      title: { enabled: true, text: 'Why Choose Us?' },
      description: { enabled: true, text: 'Premium quality meets exceptional service' },
      bgColor: 'from-gray-900 to-black',
      borderColor: 'border-neonPink/50',
      icon: { enabled: true, name: 'Star' },
      featureGrid: {
        enabled: true,
        items: [
          { icon: 'Coffee', text: 'Premium Coffee', enabled: true },
          { icon: 'Wifi', text: 'Free WiFi', enabled: true },
          { icon: 'Car', text: 'Easy Parking', enabled: true },
          { icon: 'Utensils', text: 'Fresh Food', enabled: true }
        ]
      },
      badge: { enabled: true, text: 'Quality First', color: 'bg-neonPink' }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    panel_order: 3,
    template_id: 'contact',
    panel_id: 'contact-1',
    is_active: true,
    config: {
      title: { enabled: true, text: 'Get in Touch' },
      description: { enabled: true, text: 'We love hearing from our customers' },
      bgColor: 'from-blue-900 to-purple-900',
      borderColor: 'border-blue-400/50',
      icon: { enabled: true, name: 'Phone' },
      socialGrid: {
        enabled: true,
        items: [
          { text: '📞 Call Us', enabled: true },
          { text: '📧 Email', enabled: true },
          { text: '📍 Visit', enabled: true },
          { text: '💬 Message', enabled: true }
        ]
      },
      badge: { enabled: true, text: 'Always Available', color: 'bg-blue-500' }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      panels: samplePanels
    });
  } catch (error) {
    console.error('Error fetching carousel panels:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carousel panels' },
      { status: 500 }
    );
  }
}