'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Apple, Download, ExternalLink } from 'lucide-react';
import Image from 'next/image';

// App Store URLs
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=co.za.littlelattelane.app';
const APPLE_STORE_URL = 'https://apps.apple.com/za/app/little-latte-lane/id6754854354';

export default function AppDownloadPage() {
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [autoRedirecting, setAutoRedirecting] = useState(true);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent || navigator.vendor;

    let detectedDevice: 'ios' | 'android' | 'desktop' = 'desktop';

    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      detectedDevice = 'ios';
    }
    // Check for Android
    else if (/android/i.test(userAgent)) {
      detectedDevice = 'android';
    }

    setDeviceType(detectedDevice);

    // Auto-redirect mobile users after a short delay
    if (detectedDevice !== 'desktop') {
      const redirectUrl = detectedDevice === 'ios' ? APPLE_STORE_URL : GOOGLE_PLAY_URL;

      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);

      // Clear timeout if component unmounts
      return () => clearTimeout(timer);
    } else {
      setAutoRedirecting(false);
    }
  }, []);

  const handleManualDownload = (platform: 'ios' | 'android') => {
    const url = platform === 'ios' ? APPLE_STORE_URL : GOOGLE_PLAY_URL;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-neonCyan/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-neonPink/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="bg-gray-900/80 border-gray-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-neonCyan to-neonPink rounded-2xl flex items-center justify-center shadow-lg shadow-neonCyan/20">
                <Smartphone className="h-12 w-12 text-white" />
              </div>
            </div>

            <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-neonCyan via-white to-neonPink bg-clip-text text-transparent">
              Little Latte Lane App
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Download our mobile app for the best ordering experience
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Auto-redirect message for mobile */}
            {deviceType !== 'desktop' && autoRedirecting && (
              <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-neonCyan mb-2">
                  <Download className="h-5 w-5 animate-bounce" />
                  <span className="font-semibold">Redirecting to {deviceType === 'ios' ? 'App Store' : 'Google Play'}...</span>
                </div>
                <p className="text-sm text-gray-400">
                  You'll be redirected automatically in a moment
                </p>
              </div>
            )}

            {/* Download buttons */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* iOS Download */}
              <Button
                onClick={() => handleManualDownload('ios')}
                className="h-auto py-4 px-6 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 hover:border-neonCyan/50 hover:shadow-lg hover:shadow-neonCyan/20 transition-all duration-300 group"
                variant="outline"
              >
                <div className="flex items-center gap-3 w-full">
                  <Apple className="h-8 w-8 text-white group-hover:text-neonCyan transition-colors" />
                  <div className="text-left flex-1">
                    <div className="text-xs text-gray-400">Download on the</div>
                    <div className="text-base font-semibold text-white group-hover:text-neonCyan transition-colors">
                      App Store
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-neonCyan transition-colors" />
                </div>
              </Button>

              {/* Android Download */}
              <Button
                onClick={() => handleManualDownload('android')}
                className="h-auto py-4 px-6 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 hover:border-neonPink/50 hover:shadow-lg hover:shadow-neonPink/20 transition-all duration-300 group"
                variant="outline"
              >
                <div className="flex items-center gap-3 w-full">
                  <svg className="h-8 w-8 text-white group-hover:text-neonPink transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left flex-1">
                    <div className="text-xs text-gray-400">GET IT ON</div>
                    <div className="text-base font-semibold text-white group-hover:text-neonPink transition-colors">
                      Google Play
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-neonPink transition-colors" />
                </div>
              </Button>
            </div>

            {/* Features list */}
            <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
              <h3 className="text-white font-semibold mb-3 text-center">Why download our app?</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-neonCyan mt-0.5">✓</span>
                  <span>Quick and easy mobile ordering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neonCyan mt-0.5">✓</span>
                  <span>Real-time order tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neonCyan mt-0.5">✓</span>
                  <span>Table and golf booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neonCyan mt-0.5">✓</span>
                  <span>Push notifications for order updates</span>
                </li>
              </ul>
            </div>

            {/* Desktop message */}
            {deviceType === 'desktop' && (
              <div className="text-center text-sm text-gray-400 mt-4">
                <p>Scan the QR code on your mobile device or click the buttons above to download</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
