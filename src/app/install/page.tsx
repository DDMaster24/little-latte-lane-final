/**
 * PWA Install Page - Clean Sectioned Installation Experience
 * No popups, clear platform sections with device detection for button states
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

// BeforeInstallPrompt interface for native install
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Detect device and browser with high accuracy
const getDeviceInfo = () => {
  if (typeof window === 'undefined') return { platform: 'unknown', browser: 'unknown', isIOS: false, isMacOS: false };
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Enhanced iOS detection - iPads now report as desktop in iPadOS 13+
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                /iPad/.test(navigator.userAgent) ||
                (navigator.userAgent.includes('Safari') && navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  
  // macOS detection (separate from iOS)
  const isMacOS = navigator.platform.indexOf('Mac') === 0 && !isIOS;
  
  // More accurate platform detection
  const platform = /iPhone|iPod/.test(navigator.userAgent) ? 'ios' :
                  isIOS ? 'ios' : // This catches iPads in desktop mode
                  /android/i.test(userAgent) ? 'android' : 
                  isMacOS ? 'macos' :
                  'desktop';
  
  // Browser detection
  const browser = /chrome/i.test(userAgent) && !/edg/i.test(userAgent) ? 'chrome' :
                 /edg/i.test(userAgent) ? 'edge' :
                 /firefox/i.test(userAgent) ? 'firefox' :
                 /safari/i.test(userAgent) && !/chrome/i.test(userAgent) ? 'safari' : 'unknown';

  return { platform, browser, isIOS, isMacOS };
};

// Check if PWA is already installed
const checkIfInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as { standalone?: boolean }).standalone === true ||
         document.referrer.includes('android-app://');
};

export default function PWAInstallPage() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({ platform: 'unknown', browser: 'unknown', isIOS: false, isMacOS: false });
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Set device info
    const info = getDeviceInfo();
    setDeviceInfo(info);
    
    // Check if already installed
    setIsInstalled(checkIfInstalled());

    // Add PWA install prompt event listener - ONLY for this page
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA install prompt available on install page');
      e.preventDefault(); // Prevent the default browser install prompt
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for install success
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully from install page');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Android install handler - Use native install if available
  const handleAndroidInstall = async () => {
    console.log('📱 Android install button clicked');
    
    if (deferredPrompt && canInstall) {
      try {
        // Show the native install prompt
        await deferredPrompt.prompt();
        
        // Wait for the user's response
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ User accepted PWA install');
        } else {
          console.log('❌ User dismissed PWA install');
        }
        
        // Clear the prompt
        setDeferredPrompt(null);
        setCanInstall(false);
      } catch (error) {
        console.error('❌ PWA install failed:', error);
        // Fallback to manual instructions
        alert('Please look for the install icon in your browser address bar, or check your browser menu for "Install app" option.');
      }
    } else {
      // Fallback for browsers that don't support native install
      alert('Please use Chrome browser on your Android device and look for the install icon in the address bar, or check your browser menu for "Install app" option.');
    }
  };

  // Desktop install handler - Use native install if available, special handling for Safari
  const handleDesktopInstall = async () => {
    console.log('💻 Desktop install button clicked', { browser: deviceInfo.browser, platform: deviceInfo.platform });
    
    // Special handling for Safari on macOS - recommend Chrome instead
    if (deviceInfo.browser === 'safari' && deviceInfo.isMacOS) {
      alert(`🍎 Safari Installation Not Recommended

For the best installation experience on Mac, we recommend using Google Chrome instead of Safari.

📌 Quick Setup:
1. Download Google Chrome (if not installed)
2. Visit Little Latte Lane in Chrome
3. Look for the install icon in the address bar
4. Click to install with one click!

Chrome provides a much smoother and more reliable installation process.

Would you like to continue with Safari anyway? You can try the Safari menu → "Install Little Latte Lane..." option, but results may vary.`);
      return;
    }
    
    if (deferredPrompt && canInstall) {
      try {
        // Show the native install prompt
        await deferredPrompt.prompt();
        
        // Wait for the user's response
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ User accepted PWA install');
        } else {
          console.log('❌ User dismissed PWA install');
        }
        
        // Clear the prompt
        setDeferredPrompt(null);
        setCanInstall(false);
      } catch (error) {
        console.error('❌ PWA install failed:', error);
        // Fallback to manual instructions
        alert('Please look for the install icon in your browser address bar (Chrome/Edge), or check your browser menu for "Install Little Latte Lane" option.');
      }
    } else {
      // Browser-specific fallback instructions
      const instructions = deviceInfo.browser === 'safari' && deviceInfo.isMacOS
        ? 'Safari on Mac: We recommend using Google Chrome for easier installation. If you prefer Safari, try Safari menu → "Install Little Latte Lane..." (results may vary)'
        : deviceInfo.browser === 'firefox'
        ? 'Firefox: This browser doesn\'t support PWA installation. Please use Chrome, Edge, or Safari for the best experience.'
        : 'Please look for the install icon in your browser address bar (Chrome/Edge), or check your browser menu for "Install Little Latte Lane" option.';
      
      alert(instructions);
    }
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
    <div className="min-h-screen bg-darkBg text-neonText safe-area-top">
      <div className="container-responsive py-4 sm:py-8">
        <div className="text-center mb-8 sm:mb-12">
          <Image
            src="/images/logo.svg"
            alt="Little Latte Lane"
            width={120}
            height={60}
            className="mx-auto mb-4 h-auto w-auto max-w-[100px] sm:max-w-[120px]"
            priority
          />
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-2 px-4">
            Install Little Latte Lane App
          </h1>
          <p className="text-gray-400 text-base sm:text-lg px-4">
            Choose your device type below for installation
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* ANDROID SECTION */}
          <div className={`bg-gradient-to-br from-darkBg to-gray-900 border rounded-2xl p-4 sm:p-8 ${
            deviceInfo.platform === 'android' 
              ? 'border-green-400/50 shadow-green-400/20 shadow-lg' 
              : 'border-gray-600/30 opacity-75'
          }`}>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-400/20">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5V19h1c0.55,0 1,-0.45 1,-1V8H6v10zM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8zM20.5,8C19.67,8 19,8.67 19,9.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5,-0.67 1.5,-1.5v-7C22,8.67 21.33,8 20.5,8zM15.53,2.16l1.3,-1.3c0.2,-0.2 0.2,-0.51 0,-0.71c-0.2,-0.2 -0.51,-0.2 -0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0 -1.86,0.23 -2.66,0.63L7.85,0.15c-0.2,-0.2 -0.51,-0.2 -0.71,0c-0.2,0.2 -0.2,0.51 0,0.71l1.31,1.31C6.97,3.26 6,5.01 6,7h12C18,5.01 17.03,3.26 15.53,2.16zM10,5H9V4h1V5zM15,5h-1V4h1V5z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-1">Android Users</h2>
                <p className="text-gray-300 text-sm sm:text-base">One-click native installation</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-green-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-400/20">
                <div className="text-lg sm:text-2xl mb-1 sm:mb-2">⚡</div>
                <p className="text-green-400 text-xs sm:text-sm font-medium">Lightning Fast</p>
              </div>
              <div className="bg-green-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-400/20">
                <div className="text-lg sm:text-2xl mb-1 sm:mb-2">📱</div>
                <p className="text-green-400 text-xs sm:text-sm font-medium">Native App Feel</p>
              </div>
              <div className="bg-green-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-400/20">
                <div className="text-lg sm:text-2xl mb-1 sm:mb-2">🔔</div>
                <p className="text-green-400 text-xs sm:text-sm font-medium">Push Notifications</p>
              </div>
            </div>

            <Button
              onClick={handleAndroidInstall}
              disabled={deviceInfo.platform !== 'android'}
              className={`w-full py-4 px-4 sm:px-8 rounded-xl text-base sm:text-lg font-bold transition-all duration-300 ${
                deviceInfo.platform === 'android'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white shadow-lg hover:shadow-green-400/30 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {deviceInfo.platform === 'android' 
                ? <span className="block sm:hidden">🚀 Install Now</span>
                : null}
              {deviceInfo.platform === 'android' 
                ? <span className="hidden sm:block">🚀 Install Now - Android</span>
                : <span className="text-xs sm:text-base">🚫 Use your Android device</span>}
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
            deviceInfo.platform === 'desktop' || deviceInfo.platform === 'macos'
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
                <h2 className="text-2xl font-bold text-purple-400 mb-1">
                  {deviceInfo.isMacOS ? 'Mac Users' : 'Windows & Mac Users'}
                </h2>
                <p className="text-gray-300">
                  {deviceInfo.browser === 'safari' && deviceInfo.isMacOS 
                    ? 'Safari installation on macOS' 
                    : 'Desktop app installation'}
                </p>
              </div>
            </div>

            {/* Chrome recommendation for Safari on macOS */}
            {deviceInfo.browser === 'safari' && deviceInfo.isMacOS && (
              <div className="bg-orange-800/20 rounded-xl p-6 border border-orange-400/30 mb-8">
                <h3 className="text-xl font-bold text-orange-400 mb-4">🚀 Recommended: Use Google Chrome</h3>
                <div className="space-y-3 text-gray-300">
                  <p>For the best installation experience on Mac, we recommend using <strong className="text-orange-300">Google Chrome</strong> instead of Safari.</p>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="bg-orange-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <span>Download and open <strong className="text-orange-300">Google Chrome</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <span>Visit <strong className="text-orange-300">Little Latte Lane in Chrome</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <span>Click the <strong className="text-orange-300">install icon</strong> in the address bar - one click install!</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-orange-900/40 rounded-lg border border-orange-400/20">
                  <p className="text-sm text-orange-200">
                    💡 <strong>Why Chrome?</strong> Much easier installation process with reliable one-click setup.
                  </p>
                </div>
              </div>
            )}
            
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
              disabled={deviceInfo.platform !== 'desktop' && deviceInfo.platform !== 'macos'}
              className={`w-full py-4 px-4 sm:px-8 rounded-xl text-base sm:text-lg font-bold transition-all duration-300 ${
                deviceInfo.platform === 'desktop' || deviceInfo.platform === 'macos'
                  ? deviceInfo.browser === 'safari' && deviceInfo.isMacOS
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg hover:shadow-orange-400/30 transform hover:scale-105'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-400/30 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {(deviceInfo.platform === 'desktop' || deviceInfo.platform === 'macos') 
                ? <span className="block sm:hidden">
                    {deviceInfo.browser === 'safari' && deviceInfo.isMacOS ? '🚀 Get Chrome Recommendation' : '🚀 Install Now'}
                  </span>
                : null}
              {(deviceInfo.platform === 'desktop' || deviceInfo.platform === 'macos') 
                ? <span className="hidden sm:block">
                    {deviceInfo.browser === 'safari' && deviceInfo.isMacOS 
                      ? '🚀 Get Chrome Installation Guide' 
                      : '🚀 Install Now - Desktop'}
                  </span>
                : <span className="text-xs sm:text-base">🚫 Use your computer</span>}
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