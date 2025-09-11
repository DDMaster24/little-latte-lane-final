'use client';

import { Text, types } from 'react-bricks'
import { Calendar, Clock, Users, MapPin, Phone } from 'lucide-react';

//=============================
// Local Types
//=============================
interface BookingsSectionProps {
  sectionTitle: string
  sectionSubtitle: string
  diningTitle: string
  diningDescription: string
  diningFeature1: string
  diningFeature2: string
  diningFeature3: string
  golfTitle: string
  golfDescription: string
  golfFeature1: string
  golfFeature2: string
  golfFeature3: string
  contactTitle: string
  phoneNumber: string
  operatingHours: string
  locationText: string
}

//=============================
// Component to be rendered
//=============================
const BookingsSection: types.Brick<BookingsSectionProps> = ({
  sectionTitle,
  sectionSubtitle,
  diningTitle,
  diningDescription,
  diningFeature1,
  diningFeature2,
  diningFeature3,
  golfTitle,
  golfDescription,
  golfFeature1,
  golfFeature2,
  golfFeature3,
  contactTitle,
  phoneNumber,
  operatingHours,
  locationText,
}) => {
  return (
    <section className="bg-darkBg section-padding">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Text
            propName="sectionTitle"
            value={sectionTitle}
            renderBlock={(props) => (
              <h2 className="text-3xl md:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4">
                {props.children}
              </h2>
            )}
            placeholder="📅 Reservations & Bookings"
          />
          
          <Text
            propName="sectionSubtitle"
            value={sectionSubtitle}
            renderBlock={(props) => (
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {props.children}
              </p>
            )}
            placeholder="Reserve your table or book our virtual golf experience"
          />
        </div>

        {/* Booking Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Dining Reservations */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-8 hover:border-neonCyan/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-neonCyan" />
              <Text
                propName="diningTitle"
                value={diningTitle}
                renderBlock={(props) => (
                  <h3 className="text-2xl font-bold text-white">
                    {props.children}
                  </h3>
                )}
                placeholder="Table Reservations"
              />
            </div>
            
            <Text
              propName="diningDescription"
              value={diningDescription}
              renderBlock={(props) => (
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {props.children}
                </p>
              )}
              placeholder="Secure your spot at Little Latte Lane for an unforgettable dining experience. Perfect for intimate dinners, family gatherings, or business meetings."
            />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-neonCyan">
                <Users className="h-4 w-4" />
                <Text
                  propName="diningFeature1"
                  value={diningFeature1}
                  renderBlock={(props) => (
                    <span className="text-sm">{props.children}</span>
                  )}
                  placeholder="Tables for 2-8 people"
                />
              </div>
              <div className="flex items-center gap-2 text-neonCyan">
                <Clock className="h-4 w-4" />
                <Text
                  propName="diningFeature2"
                  value={diningFeature2}
                  renderBlock={(props) => (
                    <span className="text-sm">{props.children}</span>
                  )}
                  placeholder="2-hour dining slots"
                />
              </div>
              <div className="flex items-center gap-2 text-neonCyan">
                <Calendar className="h-4 w-4" />
                <Text
                  propName="diningFeature3"
                  value={diningFeature3}
                  renderBlock={(props) => (
                    <span className="text-sm">{props.children}</span>
                  )}
                  placeholder="Book up to 7 days in advance"
                />
              </div>
            </div>
          </div>

          {/* Virtual Golf */}
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-8 hover:border-neonPink/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-neonPink" />
              <Text
                propName="golfTitle"
                value={golfTitle}
                renderBlock={(props) => (
                  <h3 className="text-2xl font-bold text-white">
                    {props.children}
                  </h3>
                )}
                placeholder="Virtual Golf Experience"
              />
            </div>
            
            <Text
              propName="golfDescription"
              value={golfDescription}
              renderBlock={(props) => (
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {props.children}
                </p>
              )}
              placeholder="Experience world-class virtual golf while enjoying our premium food and beverages. Perfect for groups, corporate events, or casual play."
            />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-neonPink">
                <Users className="h-4 w-4" />
                <Text
                  propName="golfFeature1"
                  value={golfFeature1}
                  renderBlock={(props) => (
                    <span className="text-sm">{props.children}</span>
                  )}
                  placeholder="Up to 6 players per bay"
                />
              </div>
              <div className="flex items-center gap-2 text-neonPink">
                <Clock className="h-4 w-4" />
                <Text
                  propName="golfFeature2"
                  value={golfFeature2}
                  renderBlock={(props) => (
                    <span className="text-sm">{props.children}</span>
                  )}
                  placeholder="1-hour sessions available"
                />
              </div>
              <div className="flex items-center gap-2 text-neonPink">
                <Calendar className="h-4 w-4" />
                <Text
                  propName="golfFeature3"
                  value={golfFeature3}
                  renderBlock={(props) => (
                    <span className="text-sm">{props.children}</span>
                  )}
                  placeholder="Multiple famous courses available"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700 rounded-xl p-8 text-center">
          <Text
            propName="contactTitle"
            value={contactTitle}
            renderBlock={(props) => (
              <h3 className="text-xl font-bold text-white mb-6">
                {props.children}
              </h3>
            )}
            placeholder="Ready to Book? Contact Us Today!"
          />
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2">
              <Phone className="h-6 w-6 text-yellow-400" />
              <Text
                propName="phoneNumber"
                value={phoneNumber}
                renderBlock={(props) => (
                  <span className="text-yellow-400 font-medium">{props.children}</span>
                )}
                placeholder="+27 123 456 7890"
              />
              <span className="text-gray-400 text-sm">Call to Reserve</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-6 w-6 text-green-400" />
              <Text
                propName="operatingHours"
                value={operatingHours}
                renderBlock={(props) => (
                  <span className="text-green-400 font-medium">{props.children}</span>
                )}
                placeholder="8:00 AM - 10:00 PM Daily"
              />
              <span className="text-gray-400 text-sm">Operating Hours</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-400" />
              <Text
                propName="locationText"
                value={locationText}
                renderBlock={(props) => (
                  <span className="text-blue-400 font-medium">{props.children}</span>
                )}
                placeholder="123 Coffee Street, Cape Town"
              />
              <span className="text-gray-400 text-sm">Visit Us</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

//=============================
// Brick SCHEMA
//=============================
BookingsSection.schema = {
  name: 'bookings-section',
  label: 'Bookings Section',
  category: 'layout',
  tags: ['bookings', 'reservations', 'golf', 'section'],
  
  // Default props when brick is added
  getDefaultProps: () => ({
    sectionTitle: '📅 Reservations & Bookings',
    sectionSubtitle: 'Reserve your table or book our virtual golf experience',
    diningTitle: 'Table Reservations',
    diningDescription: 'Secure your spot at Little Latte Lane for an unforgettable dining experience. Perfect for intimate dinners, family gatherings, or business meetings.',
    diningFeature1: 'Tables for 2-8 people',
    diningFeature2: '2-hour dining slots',
    diningFeature3: 'Book up to 7 days in advance',
    golfTitle: 'Virtual Golf Experience',
    golfDescription: 'Experience world-class virtual golf while enjoying our premium food and beverages. Perfect for groups, corporate events, or casual play.',
    golfFeature1: 'Up to 6 players per bay',
    golfFeature2: '1-hour sessions available',
    golfFeature3: 'Multiple famous courses available',
    contactTitle: 'Ready to Book? Contact Us Today!',
    phoneNumber: '+27 123 456 7890',
    operatingHours: '8:00 AM - 10:00 PM Daily',
    locationText: '123 Coffee Street, Cape Town',
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
      groupName: 'Dining Reservations',
      props: [
        {
          name: 'diningTitle',
          label: 'Dining Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'diningDescription',
          label: 'Dining Description',
          type: types.SideEditPropType.Textarea,
        },
        {
          name: 'diningFeature1',
          label: 'Dining Feature 1',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'diningFeature2',
          label: 'Dining Feature 2',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'diningFeature3',
          label: 'Dining Feature 3',
          type: types.SideEditPropType.Text,
        },
      ],
    },
    {
      groupName: 'Virtual Golf',
      props: [
        {
          name: 'golfTitle',
          label: 'Golf Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'golfDescription',
          label: 'Golf Description',
          type: types.SideEditPropType.Textarea,
        },
        {
          name: 'golfFeature1',
          label: 'Golf Feature 1',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'golfFeature2',
          label: 'Golf Feature 2',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'golfFeature3',
          label: 'Golf Feature 3',
          type: types.SideEditPropType.Text,
        },
      ],
    },
    {
      groupName: 'Contact Information',
      props: [
        {
          name: 'contactTitle',
          label: 'Contact Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'phoneNumber',
          label: 'Phone Number',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'operatingHours',
          label: 'Operating Hours',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'locationText',
          label: 'Location Text',
          type: types.SideEditPropType.Text,
        },
      ],
    },
  ],
};

export default BookingsSection;
