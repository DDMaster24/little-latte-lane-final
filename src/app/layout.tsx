import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientWrapper } from '@/components/ClientWrapper';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Robert\'s Little Latte Lane',
  description: 'Café & Deli - Where Great Food Meets Amazing Experiences',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon-192x192.png',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Disable Vercel Toolbar
              if (typeof window !== 'undefined') {
                window.__VERCEL_TOOLBAR_DISABLED = true;
                window.VERCEL_TOOLBAR = false;
              }
            `,
          }}
        />
      </head>
      <body
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
