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
    icon: '/images/logo.jpg',
    apple: '/images/logo.jpg',
    shortcut: '/images/logo.jpg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f0f0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
