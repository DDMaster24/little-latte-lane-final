/**
 * PWA Install Page - Clean Sectioned Installation Experience
 * No popups, clear platform sections with device detection for button states
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  platforms?: string[];
}

// Detect device and browser with high accuracy
const getDeviceInfo = () => {
  if (typeof window === 'undefined') return { platform: 'unknown', browser: 'unknown', isIOS: false };
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Enhanced iOS detection - iPads now report as desktop in iPadOS 13+
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                /iPad/.test(navigator.userAgent) ||
                (navigator.userAgent.includes('Safari') && navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  
  // More accurate platform detection
  const platform = /iPhone|iPod/.test(navigator.userAgent) ? 'ios' :
                  isIOS ? 'ios' : // This catches iPads in desktop mode
                  /android/i.test(userAgent) ? 'android' : 'desktop';
  
  // Browser detection
  const browser = /chrome/i.test(userAgent) && !/edg/i.test(userAgent) ? 'chrome' :
                 /edg/i.test(userAgent) ? 'edge' :
                 /firefox/i.test(userAgent) ? 'firefox' :
                 /safari/i.test(userAgent) && !/chrome/i.test(userAgent) ? 'safari' : 'unknown';

  return { platform, browser, isIOS };
};

// Check if PWA is already installed
const checkIfInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as { standalone?: boolean }).standalone === true ||
         document.referrer.includes('android-app://');
};

export default function PWAInstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({ platform: 'unknown', browser: 'unknown', isIOS: false });

  useEffect(() => {
    // Set device info
    const info = getDeviceInfo();
    setDeviceInfo(info);
    
    // Check if already installed
    setIsInstalled(checkIfInstalled());
    
    if (checkIfInstalled()) return;

    // Store beforeinstallprompt for native installation
    const handleBeforeInstallPrompt = (e: Event) => {
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      console.log('📱 CAPTURED native PWA install prompt');
      e.preventDefault();
      setDeferredPrompt(beforeInstallEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = (_e: Event) => {
      console.log('✅ PWA installation successful');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Android native install handler
  const handleAndroidInstall = async () => {
    if (!deferredPrompt) {
      console.log('❌ No deferred prompt available for Android install');
      return;
    }

    try {
      console.log('📱 Android native install triggered');
      await deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      console.log('📱 User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Android PWA installation accepted');
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ Android install failed:', error);
    }
  };

  // Desktop native install handler  
  const handleDesktopInstall = async () => {
    if (!deferredPrompt) {
      console.log('❌ No deferred prompt available for desktop install');
      return;
    }

    try {
      console.log('💻 Desktop native install triggered');
      await deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      console.log('💻 User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Desktop PWA installation accepted');
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ Desktop install failed:', error);
    }
  };

  // iOS instruction handler
  const handleiOSInstructions = () => {
    console.log('📱 iOS installation instructions triggered');
    // Just scroll to show the instructions are right there - no popup needed
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-darkBg text-neonText flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gradient-to-br from-neonCyan to-neonPink p-1 rounded-2xl mb-6">
            <div className="bg-darkBg rounded-xl p-8">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold mb-2 text-neonCyan">
                App Successfully Installed!
              </h1>
              <p className="text-gray-400 mb-6">
                Little Latte Lane is now available on your device.
                Look for the app icon on your home screen or in your apps.
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                className="neon-button w-full py-3 mb-4"
              >
                🚀 Launch App
              </Button>
              <Button
                onClick={() => window.location.href = '/ordering'}
                variant="outline"
                className="border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black w-full py-3"
              >
                🍽️ Start Ordering
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-neonText">
      <div className="container-responsive py-8">
        <div className="text-center mb-12">
          <Image
            src="/images/logo.svg"
            alt="Little Latte Lane"
            width={120}
            height={60}
            className="mx-auto mb-4 h-auto w-auto max-w-[120px]"
            priority
          />
          <h1 className="text-3xl xs:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-2">
            Install Little Latte Lane App
          </h1>
          <p className="text-gray-400 text-lg">
            Choose your device type below for installation
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* ANDROID SECTION */}
          <div className={`bg-gradient-to-br from-darkBg to-gray-900 border rounded-2xl p-8 ${
            deviceInfo.platform === 'android' 
              ? 'border-green-400/50 shadow-green-400/20 shadow-lg' 
              : 'border-gray-600/30 opacity-75'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">🤖</div>
              <div>
                <h2 className="text-2xl font-bold text-green-400 mb-1">Android Users</h2>
                <p className="text-gray-300">One-click native installation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-800/20 rounded-xl p-4 border border-green-400/20">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-green-400 text-sm font-medium">Lightning Fast</p>
              </div>
              <div className="bg-green-800/20 rounded-xl p-4 border border-green-400/20">
                <div className="text-2xl mb-2">📱</div>
                <p className="text-green-400 text-sm font-medium">Native App Feel</p>
              </div>
              <div className="bg-green-800/20 rounded-xl p-4 border border-green-400/20">
                <div className="text-2xl mb-2">🔔</div>
                <p className="text-green-400 text-sm font-medium">Push Notifications</p>
              </div>
            </div>

            <Button
              onClick={handleAndroidInstall}
              disabled={deviceInfo.platform !== 'android' || !deferredPrompt}
              className={`w-full py-4 px-8 rounded-xl text-lg font-bold transition-all duration-300 ${
                deviceInfo.platform === 'android' && deferredPrompt
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white shadow-lg hover:shadow-green-400/30 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {deviceInfo.platform === 'android' 
                ? (deferredPrompt ? '🚀 Install Now - Android' : '⏳ Loading...')
                : '🚫 Not Available (Use your Android device)'}
            </Button>
          </div>

          {/* iOS SECTION */}
          <div className={`bg-gradient-to-br from-darkBg to-gray-900 border rounded-2xl p-8 ${
            deviceInfo.isIOS 
              ? 'border-blue-400/50 shadow-blue-400/20 shadow-lg' 
              : 'border-gray-600/30 opacity-75'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">🍎</div>
              <div>
                <h2 className="text-2xl font-bold text-blue-400 mb-1">iPhone & iPad Users</h2>
                <p className="text-gray-300">Safari installation steps</p>
              </div>
            </div>

            <div className="bg-blue-800/20 rounded-xl p-6 border border-blue-400/30 mb-8">
              <h3 className="text-xl font-bold text-blue-400 mb-4">📱 Easy Installation Steps:</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <span>Tap the <strong className="text-blue-300">Share button (□↗)</strong> at the bottom of Safari</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <span>Scroll down and tap <strong className="text-blue-300">&ldquo;Add to Home Screen&rdquo;</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <span>Tap <strong className="text-blue-300">&ldquo;Add&rdquo;</strong> in the top right corner</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleiOSInstructions}
              className={`w-full py-4 px-8 rounded-xl text-lg font-bold transition-all duration-300 ${
                deviceInfo.isIOS
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg hover:shadow-blue-400/30 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {deviceInfo.isIOS 
                ? '✨ Perfect! Let\'s Install It!' 
                : '🚫 Not Available (Use your iPhone/iPad)'}
            </Button>
          </div>

          {/* WINDOWS & MAC SECTION */}
          <div className={`bg-gradient-to-br from-darkBg to-gray-900 border rounded-2xl p-8 ${
            deviceInfo.platform === 'desktop' 
              ? 'border-purple-400/50 shadow-purple-400/20 shadow-lg' 
              : 'border-gray-600/30 opacity-75'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">💻</div>
              <div>
                <h2 className="text-2xl font-bold text-purple-400 mb-1">Windows & Mac Users</h2>
                <p className="text-gray-300">Desktop app installation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-purple-800/20 rounded-xl p-4 border border-purple-400/20">
                <div className="text-2xl mb-2">🖥️</div>
                <p className="text-purple-400 text-sm font-medium">Full Screen App</p>
              </div>
              <div className="bg-purple-800/20 rounded-xl p-4 border border-purple-400/20">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-purple-400 text-sm font-medium">Faster Than Web</p>
              </div>
              <div className="bg-purple-800/20 rounded-xl p-4 border border-purple-400/20">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-purple-400 text-sm font-medium">Desktop Shortcut</p>
              </div>
            </div>

            <Button
              onClick={handleDesktopInstall}
              disabled={deviceInfo.platform !== 'desktop' || !deferredPrompt}
              className={`w-full py-4 px-8 rounded-xl text-lg font-bold transition-all duration-300 ${
                deviceInfo.platform === 'desktop' && deferredPrompt
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-400/30 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {deviceInfo.platform === 'desktop' 
                ? (deferredPrompt ? '🚀 Install Now - Desktop' : '⏳ Loading...')
                : '🚫 Not Available (Use your Windows/Mac computer)'}
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-500">
          <p className="mb-2">📱 Universal QR Code: <span className="text-neonCyan font-mono">littlelattelane.co.za/install</span></p>
          <p className="text-sm">✅ Works on all devices • Share this link with anyone</p>
        </div>
      </div>
    </div>
  );
}