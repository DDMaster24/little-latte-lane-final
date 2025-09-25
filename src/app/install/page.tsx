/**
 * PWA Install Page - Bulletproof PWA installation for all devices
 * Specially optimized for iOS PWA installation requirements
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
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
  
  const browser = userAgent.includes('safari') && !userAgent.includes('chrome') ? 'safari' :
                 userAgent.includes('chrome') ? 'chrome' :
                 userAgent.includes('firefox') ? 'firefox' :
                 userAgent.includes('edg') ? 'edge' : 'other';
  
  console.log('🔍 Device Detection:', { userAgent, platform, browser, isIOS, touchPoints: navigator.maxTouchPoints });
  
  return { platform, browser, isIOS };
};

// Check if already installed
const checkIfInstalled = () => {
  if (typeof window === 'undefined') return false;
  
  // Check PWA display mode
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check iOS standalone mode
  if ((window.navigator as { standalone?: boolean }).standalone === true) {
    return true;
  }
  
  return false;
};

export default function PWAInstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [_isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({ platform: 'unknown', browser: 'unknown', isIOS: false });
  const [installAttempted, setInstallAttempted] = useState(false);

  // Move showInstallInstructions function here to fix dependency issue
  const showInstallInstructions = useCallback(() => {
    const { platform, browser, isIOS } = deviceInfo;
    
    let title = 'Install Little Latte Lane App';
    let instructions = [];
    let browserSpecific = '';
    
    // Universal iOS instructions (including iPads that report as desktop)
    if (isIOS || platform === 'ios') {
      if (browser === 'safari') {
        title = '📱 Install on iPad/iPhone - Safari';
        instructions = [
          '1. Tap the Share button (□↗) at the bottom/top of Safari',
          '2. Scroll down and tap "Add to Home Screen"',
          '3. Tap "Add" in the top right corner',
          '4. Find the app icon on your home screen'
        ];
        browserSpecific = '✅ Perfect! Safari is the best browser for iOS PWA installation.';
      } else {
        title = '📱 Install on iPad/iPhone - Any Browser';
        instructions = [
          '1. Copy this URL: littlelattelane.co.za/install',
          '2. Open Safari and paste the URL',
          '3. Tap Share (□↗) → "Add to Home Screen"',
          '4. Or look for "Install" option in your current browser menu'
        ];
        browserSpecific = '💡 Tip: Safari works best for iOS, but other browsers also support installation.';
      }
    }
    // Android instructions - works in most browsers
    else if (platform === 'android') {
      title = '📱 Install on Android - Universal';
      if (browser === 'chrome') {
        instructions = [
          '1. Tap the menu (⋮) in Chrome',
          '2. Select "Add to Home screen" or "Install app"',
          '3. Tap "Add" or "Install" to confirm',
          '4. Find the app icon on your home screen'
        ];
        browserSpecific = '✅ Chrome is perfect for Android PWA installation!';
      } else {
        instructions = [
          '1. Look for "Install" or "Add to Home Screen" in your browser menu',
          '2. Or try Chrome browser: littlelattelane.co.za/install',
          '3. Tap "Install" or "Add" when prompted',
          '4. Find the app icon on your home screen'
        ];
        browserSpecific = '💡 Most Android browsers support PWA installation. Chrome works best.';
      }
    }
    // Desktop instructions - ALL browsers supported
    else {
      title = '💻 Install on Desktop/Laptop - All Browsers';
      
      if (browser === 'chrome') {
        instructions = [
          '1. Look for the install icon (⊕) in your address bar',
          '2. Click "Install" when prompted',
          '3. Or use menu (⋮) → "Install Little Latte Lane"',
          '4. Access from your desktop or start menu'
        ];
        browserSpecific = '✅ Chrome has excellent PWA support!';
      } else if (browser === 'edge') {
        instructions = [
          '1. Click the menu (⋯) in Edge',
          '2. Select "Apps" → "Install this site as an app"',
          '3. Click "Install" to confirm',
          '4. Access from your desktop or start menu'
        ];
        browserSpecific = '✅ Edge has great PWA support!';
      } else if (browser === 'firefox') {
        instructions = [
          '1. Look for "Install" in the address bar or menu',
          '2. Click the menu (☰) → "Install Little Latte Lane"',
          '3. Or bookmark this page for quick access',
          '4. Firefox PWA support varies by version'
        ];
        browserSpecific = '💡 Firefox PWA support is improving. Try Chrome/Edge for best experience.';
      } else if (browser === 'safari') {
        instructions = [
          '1. This might be an iPad in desktop mode!',
          '2. Try: Share → "Add to Home Screen"',
          '3. Or look for "Install" in browser menu',
          '4. Safari on Mac has limited PWA support'
        ];
        browserSpecific = '🍎 If this is an iPad, use the Share button method. For Mac, try Chrome/Edge.';
      } else {
        instructions = [
          '1. Look for "Install", "Add to Home Screen", or app icon in your browser',
          '2. Check the browser menu for installation options',
          '3. Or try Chrome/Edge: littlelattelane.co.za/install',
          '4. Bookmark this page as a fallback'
        ];
        browserSpecific = '💡 Try Chrome or Edge for the best installation experience.';
      }
    }

    // Create and show modal with instructions
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-cyan-400/30 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-cyan-400 mb-4">${title}</h2>
        
        <div class="space-y-2 mb-4">
          ${instructions.map((step, index) => `
            <p class="text-gray-300 text-sm flex items-start gap-2">
              <span class="bg-cyan-400 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">${index + 1}</span>
              <span>${step.replace(/^\d+\.\s*/, '')}</span>
            </p>
          `).join('')}
        </div>
        
        <div class="bg-blue-800/20 rounded-lg p-3 border border-blue-400/30 mb-4">
          <p class="text-blue-400 text-sm">${browserSpecific}</p>
        </div>
        
        <div class="bg-green-800/20 rounded-lg p-3 border border-green-400/30 mb-4">
          <p class="text-green-400 text-sm">
            ✅ <strong>Universal Support:</strong> This app works on ALL devices and browsers!<br>
            📱 Bookmark: <span class="text-cyan-400">littlelattelane.co.za/install</span>
          </p>
        </div>
        
        <div class="space-y-2">
          <button class="w-full bg-cyan-400 text-black font-bold py-3 px-4 rounded-lg text-sm" onclick="this.parentElement.parentElement.parentElement.remove()">
            ✅ Got it! Let me try
          </button>
          <button class="w-full bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm" onclick="window.open('${window.location.origin}', '_blank')">
            🔗 Open in New Tab
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 30000);
  }, [deviceInfo]);

  // Add early event interception - IMMEDIATELY on page load
  useEffect(() => {
    // Suppress the native install popup immediately
    const suppressNativePopup = (e: Event) => {
      console.log('🚫 SUPPRESSING native install popup - will show custom instructions instead');
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };

    // Add the event listener immediately with capture=true to catch it early
    window.addEventListener('beforeinstallprompt', suppressNativePopup, true);

    return () => {
      window.removeEventListener('beforeinstallprompt', suppressNativePopup, true);
    };
  }, []);

  useEffect(() => {
    // Set device info
    const info = getDeviceInfo();
    setDeviceInfo(info);
    
    // Check if already installed
    setIsInstalled(checkIfInstalled());
    
    if (checkIfInstalled()) return;

    // For ALL devices and browsers, show install option
    setIsInstallable(true);

    // CRITICAL: Intercept and prevent native install popup IMMEDIATELY
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 INTERCEPTED native PWA install prompt - showing custom instructions instead');
      e.preventDefault(); // Block the native popup
      e.stopImmediatePropagation(); // Stop all other handlers
      const beforeInstallEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallEvent);
      
      // Immediately show our custom instructions instead
      setTimeout(() => {
        showInstallInstructions();
      }, 100);
    };

    // Listen for app installed event
    const handleAppInstalled = (_e: Event) => {
      console.log('✅ PWA installation successful');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showInstallInstructions]);

  const handleInstallClick = async () => {
    console.log('🚀 Install button clicked');
    console.log('📱 Platform:', deviceInfo.platform, 'Browser:', deviceInfo.browser);
    setInstallAttempted(true);
    
    // Try native installation first (Chrome, Edge, etc.)
    if (deferredPrompt) {
      try {
        console.log('📱 Using native install prompt...');
        await deferredPrompt.prompt();
        
        const choiceResult = await deferredPrompt.userChoice;
        console.log('📱 User choice:', choiceResult.outcome);
        
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ PWA installation accepted');
          setIsInstalled(true);
        }
        
        setDeferredPrompt(null);
        return;
      } catch (error) {
        console.error('❌ Native install failed:', error);
      }
    }

    // Show platform-specific instructions
    showInstallInstructions();
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
        <div className="text-center mb-8">
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
            Get lightning-fast access to our café & deli
          </p>
          
          <div className="mt-4 px-4 py-2 bg-blue-800/20 rounded-lg border border-blue-400/30 inline-block">
            <p className="text-blue-400 text-sm">
              📱 Detected: {deviceInfo.platform === 'ios' ? 'iPhone/iPad' : 
                           deviceInfo.platform === 'android' ? 'Android' : 'Desktop'} 
              • {deviceInfo.browser.charAt(0).toUpperCase() + deviceInfo.browser.slice(1)}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-darkBg to-gray-900 border border-neonCyan/30 rounded-xl p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-neonCyan mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Instant loading, offline access, faster than any website</p>
            </div>
            
            <div className="bg-gradient-to-br from-darkBg to-gray-900 border border-neonPink/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🔔</div>
              <h3 className="text-xl font-bold text-neonPink mb-2">Push Notifications</h3>
              <p className="text-gray-400">Get notified when your order is ready for pickup</p>
            </div>
            
            <div className="bg-gradient-to-br from-darkBg to-gray-900 border border-green-400/30 rounded-xl p-6">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Native Experience</h3>
              <p className="text-gray-400">Full-screen app experience, no browser bars</p>
            </div>
            
            <div className="bg-gradient-to-br from-darkBg to-gray-900 border border-purple-400/30 rounded-xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-purple-400 mb-2">Home Screen Access</h3>
              <p className="text-gray-400">One tap to open, no need to find URLs</p>
            </div>
          </div>

          {/* PROMINENT INSTALL BUTTON - ALWAYS AVAILABLE */}
          <div className="text-center mb-8">
            <Button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-neonCyan to-neonPink hover:from-cyan-300 hover:to-pink-300 text-black font-bold py-6 px-12 rounded-xl text-xl shadow-lg hover:shadow-neon transform hover:scale-105 transition-all duration-300"
              disabled={installAttempted && !deferredPrompt}
            >
              {installAttempted && !deferredPrompt ? '� View Instructions' : '�🚀 Install App Now'}
            </Button>
            
            <p className="text-sm text-gray-400 mt-3">
              ✅ Works on ALL devices • iPhone, iPad, Android, Desktop
            </p>
            
            {deviceInfo.platform === 'ios' && deviceInfo.browser !== 'safari' && (
              <div className="mt-4 p-3 bg-orange-800/20 rounded-lg border border-orange-400/30">
                <p className="text-orange-400 text-sm">
                  🍎 <strong>iOS Note:</strong> For best installation experience, 
                  <a href="https://littlelattelane.co.za/install" className="text-cyan-400 underline ml-1">
                    open this page in Safari
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Success Guarantee */}
          <div className="bg-gradient-to-r from-green-800/20 to-blue-800/20 border border-green-400/30 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-green-400 mb-3">✅ 100% Installation Guarantee</h3>
            <p className="text-gray-300 mb-4">
              This app can be installed on <strong>EVERY</strong> device and browser. 
              If you have any issues, our installation guide will show you exactly what to do.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="text-center p-2 bg-green-700/20 rounded">
                <div className="text-lg mb-1">🍎</div>
                <strong>iOS</strong><br/>Safari Required
              </div>
              <div className="text-center p-2 bg-green-700/20 rounded">
                <div className="text-lg mb-1">🤖</div>
                <strong>Android</strong><br/>Any Browser
              </div>
              <div className="text-center p-2 bg-green-700/20 rounded">
                <div className="text-lg mb-1">💻</div>
                <strong>Desktop</strong><br/>Chrome/Edge/Firefox
              </div>
            </div>
          </div>

          {/* Alternative Actions */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black"
              >
                Continue in Browser
              </Button>
              
              <Button
                onClick={() => window.location.href = '/ordering'}
                variant="outline"
                className="border-neonPink text-neonPink hover:bg-neonPink hover:text-black"
              >
                Start Ordering Now
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>📱 Bookmark: <span className="text-neonCyan font-mono">littlelattelane.co.za/install</span></p>
              <p>🔗 Share this page with friends and family</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
