import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientWrapper } from '@/components/ClientWrapper';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';

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
        </ClientWrapper>
      </body>
    </html>
  );
}
