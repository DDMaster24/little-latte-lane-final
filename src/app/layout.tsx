import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientWrapper } from '@/components/ClientWrapper';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Little Latte Lane Café & Deli | Roberts Estate, Middleburg',
  description: 'Authentic café and deli in Roberts Estate, Middleburg. Fresh artisan coffee, wood-fired pizzas, and homemade meals. Open daily for breakfast, lunch, and dinner.',
  keywords: ['café', 'deli', 'coffee', 'pizza', 'restaurant', 'Middleburg', 'Roberts Estate', 'Little Latte Lane', 'wood-fired pizza', 'artisan coffee', 'homemade meals'],
  authors: [{ name: 'Little Latte Lane' }],
  creator: 'Little Latte Lane',
  publisher: 'Little Latte Lane',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Little Latte Lane',
    startupImage: [
      {
        url: '/icon-192x192.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icon-192x192.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icon-512x512.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icon-512x512.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Little Latte Lane',
    'application-name': 'Little Latte Lane',
    'msapplication-TileColor': '#00ffff',
    'msapplication-config': '/browserconfig.xml',
    'format-detection': 'telephone=no',
    'msapplication-tap-highlight': 'no',
    'msapplication-TileImage': '/icon-192x192.png',
    'msapplication-square150x150logo': '/icon-192x192.png',
    'msapplication-square310x310logo': '/icon-512x512.png',
    // Additional favicon meta tags for better search engine recognition
    'icon': '/favicon.ico',
    'shortcut icon': '/favicon.ico',
    // Open Graph tags for social media and search engines
    'og:title': 'Little Latte Lane Café & Deli | Roberts Estate, Middleburg',
    'og:description': 'Authentic café and deli in Roberts Estate, Middleburg. Fresh artisan coffee, wood-fired pizzas, and homemade meals.',
    'og:type': 'website',
    'og:url': 'https://littlelattelane.co.za',
    'og:image': '/icon-512x512.png',
    'og:site_name': 'Little Latte Lane',
    // Twitter Card tags
    'twitter:card': 'summary_large_image',
    'twitter:title': 'Little Latte Lane Café & Deli | Roberts Estate, Middleburg',
    'twitter:description': 'Authentic café and deli in Roberts Estate, Middleburg. Fresh artisan coffee, wood-fired pizzas, and homemade meals.',
    'twitter:image': '/icon-512x512.png',
    // Additional SEO and business information
    'business:contact_data:locality': 'Roberts Estate',
    'business:contact_data:region': 'Middleburg',
    'business:contact_data:country_name': 'South Africa',
    // Google site verification and business info
    'geo.placename': 'Roberts Estate, Middleburg',
    'geo.region': 'Mpumalanga',
    'robots': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00ffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
  viewportFit: 'cover',
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Manifest - MUST be first */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon and Basic Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512x512.png" type="image/png" sizes="512x512" />
        
        {/* iOS PWA Support - Comprehensive */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Little Latte Lane" />
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
        
        {/* iOS Icons - All Required Sizes */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        
        {/* iOS Startup Images */}
        <link rel="apple-touch-startup-image" href="/icon-192x192.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icon-192x192.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        
        {/* Android PWA Support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Little Latte Lane" />
        
        {/* Windows PWA Support */}
        <meta name="msapplication-TileColor" content="#00ffff" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Samsung PWA Support */}
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* PWA Theme Colors */}
        <meta name="theme-color" content="#00ffff" />
        <meta name="msapplication-navbutton-color" content="#00ffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Enhanced PWA Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, user-scalable=yes, viewport-fit=cover" />
        
        {/* PWA Installation Hints */}
        <meta name="mobile-web-app-orientations" content="portrait" />
        <meta name="apple-itunes-app" content="app-id=none" />
        
        {/* Force PWA Installation Prompt */}
        <meta name="mobile-web-app-status-bar" content="#00ffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Comprehensive Vercel Toolbar Disabling
              (function() {
                // Set multiple disable flags
                window.__VERCEL_TOOLBAR_DISABLED = true;
                window.VERCEL_TOOLBAR = false;
                window.__NEXT_ROUTER_BASEPATH = '';
                
                // Override any existing Vercel toolbar initialization
                if (window.VercelToolbar) {
                  window.VercelToolbar.hide = () => {};
                  window.VercelToolbar.show = () => {};
                }
                
                // Prevent toolbar from showing via CSS
                const style = document.createElement('style');
                style.textContent = \`
                  [data-vercel-toolbar] { display: none !important; }
                  .vercel-toolbar { display: none !important; }
                  iframe[src*="vercel"] { display: none !important; }
                  #vercel-toolbar { display: none !important; }
                \`;
                document.head.appendChild(style);
                
                // Remove any toolbar elements that might be added
                const observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                      if (node.nodeType === 1) {
                        if (node.matches && (
                          node.matches('[data-vercel-toolbar]') ||
                          node.matches('.vercel-toolbar') ||
                          node.matches('#vercel-toolbar') ||
                          (node.tagName === 'IFRAME' && node.src && node.src.includes('vercel'))
                        )) {
                          node.remove();
                        }
                      }
                    });
                  });
                });
                
                // Safely observe document.body when it's available
                if (document.body) {
                  observer.observe(document.body, { childList: true, subtree: true });
                } else {
                  // Wait for body to be available
                  document.addEventListener('DOMContentLoaded', function() {
                    if (document.body) {
                      observer.observe(document.body, { childList: true, subtree: true });
                    }
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body
        id="app-root"
        className={`${inter.className} bg-gradient-to-br from-gray-900 to-black text-white min-h-screen flex flex-col`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
        suppressHydrationWarning
      >
        <ClientWrapper>
          {children}
          <Toaster 
            position="top-right"
            theme="dark"
            className="toaster group"
            toastOptions={{
              classNames: {
                toast: 'group toast bg-darkBg border-neonCyan text-neonText',
                description: 'text-gray-400',
                actionButton: 'bg-neonCyan text-darkBg',
                cancelButton: 'bg-gray-600 text-white',
              },
            }}
          />
        </ClientWrapper>
      </body>
    </html>
  );
}
