import EditableHomepage from '@/components/EditableHomepage';
import ThemeLoader from '@/components/ThemeLoader';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function Home() {
  return (
    <>
      {/* Load saved theme styles and text */}
      <ThemeLoader pageName="homepage" />
      
      {/* PWA Install Prompt for QR Code Users */}
      <PWAInstallPrompt source="auto" />
      
      {/* Editable Homepage with admin controls */}
      <EditableHomepage enableEditing={true} />
    </>
  );
}
