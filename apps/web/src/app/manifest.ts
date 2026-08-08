import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Car Pool Panchsheel Greens 2',
    short_name: 'PG2 Car Pool',
    description: 'Residents-only mobile carpool app for Panchsheel Greens 2.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    background_color: '#f8faf6',
    theme_color: '#206f4a',
    orientation: 'any',
    icons: [
      // `any` icons are what Chrome uses for the install prompt and the
      // launcher fallback; `maskable` ones let Android apply its own shape.
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Post a trip',
        short_name: 'Post trip',
        url: '/dashboard/trips/new',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Find a ride',
        short_name: 'Find ride',
        url: '/dashboard/trips',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'My bookings',
        short_name: 'Bookings',
        url: '/dashboard/bookings',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
