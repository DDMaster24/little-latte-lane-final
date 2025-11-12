'use client';

interface PWAInstallPromptProps {
  className?: string;
  source?: 'qr' | 'web' | 'auto';
}

export default function PWAInstallPrompt({ 
  className: _className = '',
  source: _source = 'auto'
}: PWAInstallPromptProps) {
  // COMPLETELY DISABLED - No PWA install prompts anywhere
  // This component has been disabled to prevent automatic popups
  // Users should use the dedicated install page instead
  console.log('PWAInstallPrompt component is disabled - use /install page instead');
  return null;
}
