import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientWrapper } from '@/components/ClientWrapper';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Little Latte Lane',
  description: 'Food ordering and booking for estate residents',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
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
          <Header />
          <main className="flex-grow">{children}</main>
          <FooterSection />
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
