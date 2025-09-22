import EditableHomepage from '@/components/EditableHomepage';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import SessionDebugPanel from '@/components/SessionDebugPanel';

export default function Home() {
  return (
    <>
      {/* PWA Install Prompt for QR Code Users */}
      <PWAInstallPrompt source="auto" />

      {/* Editable Homepage with admin controls */}
      <EditableHomepage enableEditing={true} />

      {/* Temporary Debug Panel - Remove after fixing auth */}
      <SessionDebugPanel />
    </>
  );
}