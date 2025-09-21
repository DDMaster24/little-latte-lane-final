import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientWrapper } from '@/components/ClientWrapper';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Little Latte Lane Café & Deli',
  description: 'Premium café and deli experience with specialty coffee, fresh pizzas, and delicious meals in a vibrant atmosphere. Located in Roberts Estate, Middleburg.',
  keywords: ['café', 'deli', 'coffee', 'pizza', 'restaurant', 'Middleburg', 'Roberts Estate', 'Little Latte Lane'],
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
    statusBarStyle: 'black-translucent',
    title: 'Little Latte Lane',
    startupImage: [
      {
        url: '/icon-512x512.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
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
    'og:title': 'Little Latte Lane Café & Deli',
    'og:description': 'Premium café and deli experience with specialty coffee, fresh pizzas, and delicious meals in a vibrant atmosphere.',
    'og:type': 'website',
    'og:url': 'https://littlelattelane.co.za',
    'og:image': '/icon-512x512.png',
    'og:site_name': 'Little Latte Lane',
    // Twitter Card tags
    'twitter:card': 'summary_large_image',
    'twitter:title': 'Little Latte Lane Café & Deli',
    'twitter:description': 'Premium café and deli experience with specialty coffee, fresh pizzas, and delicious meals.',
    'twitter:image': '/icon-512x512.png',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512x512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* iOS PWA Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Little Latte Lane" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />
        
        {/* Android PWA Support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Little Latte Lane" />
        
        {/* Windows PWA Support */}
        <meta name="msapplication-TileColor" content="#00ffff" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Samsung PWA Support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Enhanced PWA Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-navbutton-color" content="#00ffff" />
        <meta name="apple-mobile-web-app-orientations" content="any" />
        
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
                observer.observe(document.body, { childList: true, subtree: true });
              })();
            `,
          }}
        />
      </head>
      <body
        id="app-root"
        className={`${inter.className} bg-gradient-to-br from-gray-900 to-black text-white min-h-screen flex flex-col`}
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
