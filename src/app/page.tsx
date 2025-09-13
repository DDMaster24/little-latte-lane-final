import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import WelcomingSection from '@/components/WelcomingSection';
import CategoriesSection from '@/components/CategoriesSection';
import EventsSpecialsSection from '@/components/EventsSpecialsSection';
import BookingsSection from '@/components/BookingsSection';

export default function Home() {
  return (
    <>
      {/* PWA Install Prompt for QR Code Users */}
      <PWAInstallPrompt source="auto" />
      
      {/* Homepage Sections */}
      <WelcomingSection />
      <CategoriesSection />
      <EventsSpecialsSection />
      <BookingsSection />
    </>
  );
}
