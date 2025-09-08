/**
 * PWA Install Page - Dedicated page for PWA installation
 * This page provides a permanent URL for QR codes and manual entry
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<string>('unknown');

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) {
      setPlatform('android');
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      setPlatform('ios');
    } else {
      setPlatform('desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ PWA installed successfully');
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const getInstallInstructions = () => {
    switch (platform) {
      case 'android':
        return {
          title: 'Install on Android',
          steps: [
            'Tap the menu (⋮) in your browser',
            'Select "Add to Home screen" or "Install app"',
            'Tap "Add" or "Install" to confirm',
            'Find the app icon on your home screen'
          ],
          icon: '📱'
        };
      case 'ios':
        return {
          title: 'Install on iPhone/iPad',
          steps: [
            'Tap the Share button (□↗) in Safari',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" in the top right corner',
            'Find the app icon on your home screen'
          ],
          icon: '🍎'
        };
      default:
        return {
          title: 'Install on Desktop',
          steps: [
            'Look for the install icon in your address bar',
            'Click "Install" when prompted',
            'Or use browser menu > "Install Little Latte Lane"',
            'Access from your desktop or app menu'
          ],
          icon: '💻'
        };
    }
  };

  const instructions = getInstallInstructions();

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-darkBg text-neonText flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gradient-to-br from-neonCyan to-neonPink p-1 rounded-2xl mb-6">
            <div className="bg-darkBg rounded-xl p-8">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold mb-2 text-neonCyan">
                App Already Installed!
              </h1>
              <p className="text-gray-400 mb-6">
                Little Latte Lane is already installed on your device.
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                className="neon-button w-full py-3"
              >
                Open App
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-neonText">
      {/* Header */}
      <div className="container-responsive py-8">
        <div className="text-center mb-8">
          <Image
            src="/images/logo.svg"
            alt="Little Latte Lane - Café and Deli"
            width={120}
            height={60}
            className="mx-auto mb-4 h-auto w-auto max-w-[120px]"
            priority
          />
          <h1 className="text-3xl xs:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-2">
            Install Little Latte Lane
          </h1>
          <p className="text-gray-400 text-lg">
            Get the full app experience on your device
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* Benefits Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-darkBg to-gray-900 border border-neonCyan/30 rounded-xl p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-neonCyan mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Instant loading and offline browsing capabilities
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-darkBg to-gray-900 border border-neonPink/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🔔</div>
              <h3 className="text-xl font-bold text-neonPink mb-2">Push Notifications</h3>
              <p className="text-gray-400">
                Get notified when your order is ready
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-darkBg to-gray-900 border border-neonGreen/30 rounded-xl p-6">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-xl font-bold text-neonGreen mb-2">Native Experience</h3>
              <p className="text-gray-400">
                App-like interface right from your home screen
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-darkBg to-gray-900 border border-neonBlue/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-xl font-bold text-neonBlue mb-2">Quick Access</h3>
              <p className="text-gray-400">
                No need to remember URLs or search for us
              </p>
            </div>
          </div>

          {/* Install Button */}
          {isInstallable && (
            <div className="text-center mb-8">
              <Button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-neonCyan to-neonPink hover:from-cyan-400 hover:to-pink-400 text-black font-bold py-4 px-8 rounded-xl text-lg shadow-neon"
              >
                🚀 Install App Now
              </Button>
              <p className="text-sm text-gray-400 mt-2">
                One click to install on your device
              </p>
            </div>
          )}

          {/* Manual Instructions */}
          <div className="bg-gradient-to-br from-gray-900 to-darkBg border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">{instructions.icon}</span>
              {instructions.title}
            </h2>
            
            <div className="space-y-3">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-neonCyan text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-300">{step}</p>
                </div>
              ))}
            </div>

            {!isInstallable && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  💡 <strong>Tip:</strong> If you don&apos;t see an install option, make sure you&apos;re using a supported browser (Chrome, Safari, Edge, or Firefox) and that you haven&apos;t already installed the app.
                </p>
              </div>
            )}
          </div>

          {/* Alternative Actions */}
          <div className="mt-8 text-center space-y-4">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black"
            >
              Continue in Browser
            </Button>
            
            <div className="text-sm text-gray-500">
              <p>Direct link: <span className="text-neonCyan">littlelattelane.co.za/install</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
