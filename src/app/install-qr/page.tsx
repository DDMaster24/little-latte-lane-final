/**
 * QR Code Install Test Page - Simulates QR code scanning experience
 * Use this to test the streamlined QR code installation flow
 */

'use client';

import { useEffect } from 'react';

export default function QRInstallTestPage() {
  useEffect(() => {
    // Redirect to install page with QR parameter
    window.location.href = '/install?qr=true';
  }, []);

  return (
    <div className="min-h-screen bg-darkBg text-neonText flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📱</div>
        <h1 className="text-xl font-bold text-neonCyan mb-2">QR Code Detected</h1>
        <p className="text-gray-400">Redirecting to streamlined installation...</p>
      </div>
    </div>
  );
}