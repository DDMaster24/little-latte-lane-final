'use client';

import { Text, types } from 'react-bricks'
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Clock, Gift } from 'lucide-react';

//=============================
// Local Types
//=============================
interface EventsSpecialsSectionProps {
  sectionTitle: string
  sectionSubtitle: string
  sectionTitleColor: string
  sectionSubtitleColor: string
  ctaTextColor: string
  event1Title: string
  event1Description: string
  event1Badge: string
  event2Title: string
  event2Description: string
  event2Badge: string
  specialOfferTitle: string
  specialOfferDescription: string
  specialOfferBadge: string
  ctaText: string
}

//=============================
// Component to be rendered
//=============================
const EventsSpecialsSection: types.Brick<EventsSpecialsSectionProps> = ({
  sectionTitle,
  sectionSubtitle,
  sectionTitleColor = 'text-3xl md:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4',
  sectionSubtitleColor = 'text-lg text-gray-300 max-w-2xl mx-auto',
  ctaTextColor = 'text-lg text-gray-300 flex items-center justify-center gap-2',
  event1Title,
  event1Description,
  event1Badge,
  event2Title,
  event2Description,
  event2Badge,
  specialOfferTitle,
  specialOfferDescription,
  specialOfferBadge,
  ctaText,
}) => {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-darkBg to-gray-900 section-padding">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Text
            propName="sectionTitle"
            value={sectionTitle}
            renderBlock={(props) => (
              <h2 className={sectionTitleColor}>
                {props.children}
              </h2>
            )}
            placeholder="🎉 Events & Specials"
          />
          
          <Text
            propName="sectionSubtitle"
            value={sectionSubtitle}
            renderBlock={(props) => (
              <p className={sectionSubtitleColor}>
                {props.children}
              </p>
            )}
            placeholder="Discover our upcoming events and exclusive offers"
          />
        </div>

        {/* Events and Specials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Event 1 */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-neonCyan/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-neonCyan" />
              <Text
                propName="event1Badge"
                value={event1Badge}
                renderBlock={(props) => (
                  <Badge className="bg-neonCyan/20 text-neonCyan border border-neonCyan/50">
                    {props.children}
                  </Badge>
                )}
                placeholder="Upcoming Event"
              />
            </div>
            
            <Text
              propName="event1Title"
              value={event1Title}
              renderBlock={(props) => (
                <h3 className="text-xl font-bold text-white mb-3">
                  {props.children}
                </h3>
              )}
              placeholder="Live Music Nights"
            />
            
            <Text
              propName="event1Description"
              value={event1Description}
              renderBlock={(props) => (
                <p className="text-gray-300 text-sm leading-relaxed">
                  {props.children}
                </p>
              )}
              placeholder="Join us every Friday night for live acoustic performances while you enjoy our premium coffee and delicious food."
            />
          </div>

          {/* Event 2 */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-neonPink/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-neonPink" />
              <Text
                propName="event2Badge"
                value={event2Badge}
                renderBlock={(props) => (
                  <Badge className="bg-neonPink/20 text-neonPink border border-neonPink/50">
                    {props.children}
                  </Badge>
                )}
                placeholder="Weekly Special"
              />
            </div>
            
            <Text
              propName="event2Title"
              value={event2Title}
              renderBlock={(props) => (
                <h3 className="text-xl font-bold text-white mb-3">
                  {props.children}
                </h3>
              )}
              placeholder="Coffee Cupping Sessions"
            />
            
            <Text
              propName="event2Description"
              value={event2Description}
              renderBlock={(props) => (
                <p className="text-gray-300 text-sm leading-relaxed">
                  {props.children}
                </p>
              )}
              placeholder="Learn about coffee origins and tasting notes in our weekly cupping sessions. Perfect for coffee enthusiasts!"
            />
          </div>

          {/* Special Offer */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-md border border-yellow-500/50 rounded-xl p-6 hover:border-yellow-400 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-yellow-400" />
              <Text
                propName="specialOfferBadge"
                value={specialOfferBadge}
                renderBlock={(props) => (
                  <Badge className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/50">
                    {props.children}
                  </Badge>
                )}
                placeholder="Limited Offer"
              />
            </div>
            
            <Text
              propName="specialOfferTitle"
              value={specialOfferTitle}
              renderBlock={(props) => (
                <h3 className="text-xl font-bold text-white mb-3">
                  {props.children}
                </h3>
              )}
              placeholder="Happy Hour Special"
            />
            
            <Text
              propName="specialOfferDescription"
              value={specialOfferDescription}
              renderBlock={(props) => (
                <p className="text-gray-300 text-sm leading-relaxed">
                  {props.children}
                </p>
              )}
              placeholder="20% off all beverages and pastries from 2-4 PM weekdays. Perfect for your afternoon break!"
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Text
            propName="ctaText"
            value={ctaText}
            renderBlock={(props) => (
              <p className={ctaTextColor}>
                <Clock className="h-5 w-5 text-neonCyan" />
                {props.children}
              </p>
            )}
            placeholder="Don't miss out - check our social media for the latest updates!"
          />
        </div>
      </div>
    </section>
  );
};

//=============================
// Brick SCHEMA
//=============================
EventsSpecialsSection.schema = {
  name: 'events-specials-section',
  label: 'Events & Specials Section',
  category: 'layout',
  tags: ['events', 'specials', 'promotions', 'section'],
  
  // Default props when brick is added
  getDefaultProps: () => ({
    sectionTitle: '🎉 Events & Specials',
    sectionSubtitle: 'Discover our upcoming events and exclusive offers',
    sectionTitleColor: 'text-3xl md:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4',
    sectionSubtitleColor: 'text-lg text-gray-300 max-w-2xl mx-auto',
    ctaTextColor: 'text-lg text-gray-300 flex items-center justify-center gap-2',
    event1Title: 'Live Music Nights',
    event1Description: 'Join us every Friday night for live acoustic performances while you enjoy our premium coffee and delicious food.',
    event1Badge: 'Upcoming Event',
    event2Title: 'Coffee Cupping Sessions',
    event2Description: 'Learn about coffee origins and tasting notes in our weekly cupping sessions. Perfect for coffee enthusiasts!',
    event2Badge: 'Weekly Special',
    specialOfferTitle: 'Happy Hour Special',
    specialOfferDescription: '20% off all beverages and pastries from 2-4 PM weekdays. Perfect for your afternoon break!',
    specialOfferBadge: 'Limited Offer',
    ctaText: "Don't miss out - check our social media for the latest updates!",
  }),

  // Sidebar controls for editing
  sideEditProps: [
    {
      name: 'sectionTitle',
      label: 'Section Title',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'sectionSubtitle',
      label: 'Section Subtitle',
      type: types.SideEditPropType.Textarea,
    },
    {
      name: 'sectionTitleColor',
      label: 'Section Title Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-3xl md:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4', label: 'Neon Gradient (Default)' },
          { value: 'text-3xl md:text-4xl font-bold text-neonCyan mb-4', label: 'Neon Cyan' },
          { value: 'text-3xl md:text-4xl font-bold text-neonPink mb-4', label: 'Neon Pink' },
          { value: 'text-3xl md:text-4xl font-bold text-white mb-4', label: 'White' },
          { value: 'text-3xl md:text-4xl font-bold text-gray-300 mb-4', label: 'Light Gray' },
          { value: 'text-3xl md:text-4xl font-bold text-yellow-400 mb-4', label: 'Yellow' },
          { value: 'text-3xl md:text-4xl font-bold text-blue-400 mb-4', label: 'Blue' },
          { value: 'text-3xl md:text-4xl font-bold text-green-400 mb-4', label: 'Green' },
        ],
      },
    },
    {
      name: 'sectionSubtitleColor',
      label: 'Section Subtitle Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-lg text-gray-300 max-w-2xl mx-auto', label: 'Gray 300 (Default)' },
          { value: 'text-lg text-white max-w-2xl mx-auto', label: 'White' },
          { value: 'text-lg text-neonCyan max-w-2xl mx-auto', label: 'Neon Cyan' },
          { value: 'text-lg text-neonPink max-w-2xl mx-auto', label: 'Neon Pink' },
          { value: 'text-lg text-gray-400 max-w-2xl mx-auto', label: 'Gray 400' },
          { value: 'text-lg text-yellow-300 max-w-2xl mx-auto', label: 'Yellow' },
          { value: 'text-lg text-blue-300 max-w-2xl mx-auto', label: 'Blue' },
          { value: 'text-lg text-green-300 max-w-2xl mx-auto', label: 'Green' },
        ],
      },
    },
    {
      groupName: 'Event 1',
      props: [
        {
          name: 'event1Title',
          label: 'Event 1 Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'event1Description',
          label: 'Event 1 Description',
          type: types.SideEditPropType.Textarea,
        },
        {
          name: 'event1Badge',
          label: 'Event 1 Badge',
          type: types.SideEditPropType.Text,
        },
      ],
    },
    {
      groupName: 'Event 2',
      props: [
        {
          name: 'event2Title',
          label: 'Event 2 Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'event2Description',
          label: 'Event 2 Description',
          type: types.SideEditPropType.Textarea,
        },
        {
          name: 'event2Badge',
          label: 'Event 2 Badge',
          type: types.SideEditPropType.Text,
        },
      ],
    },
    {
      groupName: 'Special Offer',
      props: [
        {
          name: 'specialOfferTitle',
          label: 'Special Offer Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'specialOfferDescription',
          label: 'Special Offer Description',
          type: types.SideEditPropType.Textarea,
        },
        {
          name: 'specialOfferBadge',
          label: 'Special Offer Badge',
          type: types.SideEditPropType.Text,
        },
      ],
    },
    {
      name: 'ctaText',
      label: 'Call to Action Text',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'ctaTextColor',
      label: 'CTA Text Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-lg text-gray-300 flex items-center justify-center gap-2', label: 'Gray 300 (Default)' },
          { value: 'text-lg text-white flex items-center justify-center gap-2', label: 'White' },
          { value: 'text-lg text-neonCyan flex items-center justify-center gap-2', label: 'Neon Cyan' },
          { value: 'text-lg text-neonPink flex items-center justify-center gap-2', label: 'Neon Pink' },
          { value: 'text-lg text-gray-400 flex items-center justify-center gap-2', label: 'Gray 400' },
          { value: 'text-lg text-yellow-300 flex items-center justify-center gap-2', label: 'Yellow' },
          { value: 'text-lg text-blue-300 flex items-center justify-center gap-2', label: 'Blue' },
          { value: 'text-lg text-green-300 flex items-center justify-center gap-2', label: 'Green' },
        ],
      },
    },
  ],
};

export default EventsSpecialsSection;
