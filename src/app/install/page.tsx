/**
 * PWA Install Page - Clean Sectioned Installation Experience
 * No popups, clear platform sections with device detection for button states
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({ platform: 'unknown', browser: 'unknown', isIOS: false });

  useEffect(() => {
    // Set device info only - NO PWA event handling
    const info = getDeviceInfo();
    setDeviceInfo(info);
    
    // Check if already installed
    setIsInstalled(checkIfInstalled());
  }, []);

  // Android install handler - NO native prompts, just show message
  const handleAndroidInstall = () => {
    console.log('📱 Android install button clicked - showing instructions');
    alert('Please use Chrome browser on your Android device and look for the install icon in the address bar, or check your browser menu for "Install app" option.');
  };

  // Desktop install handler - NO native prompts, just show message  
  const handleDesktopInstall = () => {
    console.log('💻 Desktop install button clicked - showing instructions');
    alert('Please look for the install icon in your browser address bar (Chrome/Edge), or check your browser menu for "Install Little Latte Lane" option.');
  };

  // iOS instruction handler - just a simple message
  const handleiOSInstructions = () => {
    console.log('📱 iOS installation instructions - no action needed');
    // Instructions are already visible on the page
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
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-400/20">
                <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h1c0.55,0 1,-0.45 1,-1V8H6v10zM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8zM20.5,8C19.67,8 19,8.67 19,9.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5v-7C22,8.67 21.33,8 20.5,8zM15.53,2.16l1.3,-1.3c0.2,-0.2 0.2,-0.51 0,-0.71c-0.2,-0.2 -0.51,-0.2 -0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0 -1.86,0.23 -2.66,0.63L7.85,0.15c-0.2,-0.2 -0.51,-0.2 -0.71,0c-0.2,0.2 -0.2,0.51 0,0.71l1.31,1.31C6.97,3.26 6,5.01 6,7h12C18,5.01 17.03,3.26 15.53,2.16zM10,5H9V4h1V5zM15,5h-1V4h1V5z"/>
                </svg>
              </div>
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
              disabled={deviceInfo.platform !== 'android'}
              className={`w-full py-4 px-8 rounded-xl text-lg font-bold transition-all duration-300 ${
                deviceInfo.platform === 'android'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white shadow-lg hover:shadow-green-400/30 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {deviceInfo.platform === 'android' 
                ? '🚀 Install Now - Android'
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
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-400/20">
                <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
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
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-400/20">
                <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,18c1.1,0,2-0.9,2-2V6c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6v10c0,1.1,0.9,2,2,2H0v2h24v-2H20z M4,6h16v10H4V6z"/>
                </svg>
              </div>
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
              disabled={deviceInfo.platform !== 'desktop'}
              className={`w-full py-4 px-8 rounded-xl text-lg font-bold transition-all duration-300 ${
                deviceInfo.platform === 'desktop'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-400/30 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {deviceInfo.platform === 'desktop' 
                ? '🚀 Install Now - Desktop'
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