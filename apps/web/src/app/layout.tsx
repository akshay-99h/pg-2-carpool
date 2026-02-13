import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import { QueryProvider } from '@/components/providers/query-provider';

import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {})); }`}
        </Script>
      </body>
    </html>
  );
}
