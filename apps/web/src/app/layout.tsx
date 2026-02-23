import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import type { ReactNode } from 'react';

import { QueryProvider } from '@/components/providers/query-provider';
import { PwaUpdateBanner } from '@/components/pwa-update-banner';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: {
    default: 'Car Pool Panchsheel Greens 2',
    template: '%s | Car Pool PG2',
  },
  description:
    'Resident-first carpool platform for Panchsheel Greens II with secure approvals, trip matching, and PWA support.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Car Pool PG2',
  },
  keywords: ['Panchsheel Greens 2', 'Carpool', 'Greater Noida', 'Resident rideshare', 'PWA'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#207946' }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} bg-background font-body text-foreground antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <Analytics />
        <PwaUpdateBanner />
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {})); }`}
        </Script>
      </body>
    </html>
  );
}
