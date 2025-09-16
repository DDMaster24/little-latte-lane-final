import EditableHomepage from '@/components/EditableHomepage';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function Home() {
  return (
    <>
      {/* PWA Install Prompt for QR Code Users */}
      <PWAInstallPrompt source="auto" />

      {/* Editable Homepage with admin controls */}
      <EditableHomepage enableEditing={true} />
    </>
  );
}