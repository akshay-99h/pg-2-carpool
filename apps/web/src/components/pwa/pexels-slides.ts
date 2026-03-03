export type PwaSlide = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  chip: string;
};

export const pwaCommuteSlides: PwaSlide[] = [
  {
    title: 'Built around the PG2 community',
    subtitle: 'Start carpooling with verified residents from your own neighborhood network.',
    imageUrl: '/branding/pwa-carousel/pg2-aerial.jpg',
    imageAlt: 'Aerial view of the PG2 residential towers',
    chip: 'PG2',
  },
  {
    title: 'Verified residents, trusted rides',
    subtitle: 'Register, get approved, and coordinate daily travel with confidence.',
    imageUrl: '/branding/pwa-carousel/pg2-community-drive.jpeg',
    imageAlt: 'Residents gathered inside the society complex',
    chip: 'Verified',
  },
  {
    title: 'A connected lifestyle',
    subtitle: 'Share rides with people who already live, move, and meet within PG2.',
    imageUrl: '/branding/pwa-carousel/pg2-activity-garden.jpeg',
    imageAlt: 'Community activity area inside the PG2 complex',
    chip: 'Lifestyle',
  },
  {
    title: 'Post rides in seconds',
    subtitle: 'Car owners can publish available seats and manage requests from one place.',
    imageUrl: '/branding/pwa-carousel/pg2-lifestyle-1.avif',
    imageAlt: 'PG2 lifestyle visual used in the onboarding carousel',
    chip: 'Post Ride',
  },
  {
    title: 'Find rides without the back and forth',
    subtitle: 'Passengers can discover available options and request a seat quickly.',
    imageUrl: '/branding/pwa-carousel/pg2-lifestyle-2.avif',
    imageAlt: 'PG2 lifestyle visual used in the onboarding carousel',
    chip: 'Find Ride',
  },
];
