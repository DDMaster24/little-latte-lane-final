'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
  source?: 'qr' | 'web' | 'auto';
}

export default function PWAInstallPrompt({ 
  className = '',
  source = 'auto'
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if PWA is supported
    const checkSupport = () => {
      const isSupported = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
      setIsSupported(isSupported);
      
      // Check if already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebView = (window.navigator as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone || isInWebView);
      
      return isSupported;
    };

    if (!checkSupport()) {
      console.log('📱 PWA not supported on this device/browser');
      return;
    }

    // Check URL parameters for QR code source
    const urlParams = new URLSearchParams(window.location.search);
    const fromQR = urlParams.get('pwa') === 'true' || urlParams.get('source') === 'qr' || window.location.pathname === '/install';
    
    // Show prompt immediately for QR code users
    if (fromQR || source === 'qr') {
      console.log('📱 User came from QR code - showing install prompt');
      setTimeout(() => setShowPrompt(true), 1000); // Small delay for better UX
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA install prompt available');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Auto-show for QR code users
      if (fromQR || source === 'qr') {
        setTimeout(() => setShowPrompt(true), 1200);
      }
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowPrompt(false);
      setDeferredPrompt(null);
      toast.success('🎉 App installed! You can now access Little Latte Lane from your home screen.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [source]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error('Install not available. Try using Chrome or Edge browser.');
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's response
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted PWA install');
        toast.success('Installing app...');
      } else {
        console.log('❌ User dismissed PWA install');
        toast.info('You can install the app later from your browser menu');
      }
      
      // Clear the prompt
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowPrompt(false);
    } catch (error) {
      console.error('❌ PWA install failed:', error);
      toast.error('Install failed. Please try again.');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    toast.info('You can install the app later from the menu or browser options');
  };

  // Don't show if already installed or not installable
  if (isInstalled || !isSupported) {
    return null;
  }

  // Show install button for installable apps
  if (isInstallable && !showPrompt) {
    return (
      <button
        onClick={() => setShowPrompt(true)}
        className={`flex items-center gap-2 px-4 py-2 bg-neonCyan hover:bg-cyan-400 text-black rounded-lg font-medium transition-colors shadow-lg ${className}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Install App
      </button>
    );
  }

  // Main install prompt modal
  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-neonCyan to-neonPink rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Install Little Latte Lane
          </h2>
          <p className="text-gray-600">
            Get the app for faster ordering and exclusive features!
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-700">⚡ Faster loading & offline access</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-700">🔔 Order notifications & updates</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-700">📱 Easy access from home screen</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-gray-700">🎁 Exclusive app-only deals</span>
          </div>
        </div>

        {/* QR Code Source Message */}
        {source === 'qr' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 text-sm font-medium">
                Perfect! You scanned our QR code. For the best experience, make sure you&apos;re using Chrome (Android) or Safari (iOS).
              </span>
            </div>
          </div>
        )}

        {/* Browser Recommendation */}
        {!isInstallable && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-amber-800 text-sm font-medium mb-1">
                  Install option not available in this browser
                </p>
                <p className="text-amber-700 text-xs">
                  For one-click installation, try opening this link in <strong>Chrome</strong> (Android) or <strong>Safari</strong> (iOS). Copy this URL: <span className="font-mono bg-amber-100 px-1 rounded">littlelattelane.co.za/install</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleInstall}
            disabled={!isInstallable}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-neonCyan to-neonPink hover:from-cyan-400 hover:to-pink-400 text-black rounded-lg font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInstallable ? 'Install Now' : 'Not Available'}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            App will be installed from your browser. No app store needed!
          </p>
        </div>
      </div>
    </div>
  );
}
