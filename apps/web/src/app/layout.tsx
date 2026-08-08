import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import type { ReactNode } from 'react';

import { QueryProvider } from '@/components/providers/query-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { PwaUpdateBanner } from '@/components/pwa-update-banner';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';

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
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    // iOS ignores the web manifest and only reads apple-touch-icon, which must
    // be a PNG - an SVG here silently falls back to a screenshot of the page.
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
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
  // Required for `env(safe-area-inset-*)` to resolve to anything but 0 on
  // notched devices - the bottom nav and PWA screens depend on it.
  viewportFit: 'cover',
  // Single theme colour: the app is light-only today (see `color-scheme` in
  // globals.css). Declaring a dark variant here would promise a dark theme the
  // stylesheet does not implement.
  themeColor: '#206f4a',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} bg-background font-body text-foreground antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <QueryProvider>{children}</QueryProvider>
        <ToastProvider />
        <Analytics />
        <OfflineIndicator />
        <PwaUpdateBanner />
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {})); }`}
        </Script>
      </body>
    </html>
  );
}
