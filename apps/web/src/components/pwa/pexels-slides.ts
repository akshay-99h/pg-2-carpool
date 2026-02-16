export type PwaSlide = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  chip: string;
};

export const pwaCommuteSlides: PwaSlide[] = [
  {
    title: 'City traffic, less chaos',
    subtitle: 'Share rides so PG2 commuters spend less time and money on the road.',
    imageUrl:
      'https://images.pexels.com/photos/20837335/pexels-photo-20837335.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1100&w=1800',
    imageAlt: 'Cars in dense city traffic at dusk',
    chip: 'Traffic',
  },
  {
    title: 'Community-first commute',
    subtitle: 'Travel with verified residents from your own neighborhood network.',
    imageUrl:
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1100&w=1800',
    imageAlt: 'People from a community smiling together',
    chip: 'Community',
  },
  {
    title: 'Public transport integration',
    subtitle: 'Use carpool for first-mile and last-mile routes around metro corridors.',
    imageUrl:
      'https://images.pexels.com/photos/5323956/pexels-photo-5323956.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1100&w=1800',
    imageAlt: 'Urban metro train moving through city infrastructure',
    chip: 'Metro',
  },
  {
    title: 'Smarter car sharing',
    subtitle: 'Post available seats and fill trips with nearby riders instantly.',
    imageUrl:
      'https://images.pexels.com/photos/10670668/pexels-photo-10670668.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1100&w=1800',
    imageAlt: 'Cars moving on a modern urban road',
    chip: 'Car Pool',
  },
  {
    title: 'Peak-hour reliability',
    subtitle: 'Reduce dependency on random auto availability during rush hours.',
    imageUrl:
      'https://images.pexels.com/photos/28647410/pexels-photo-28647410.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1100&w=1800',
    imageAlt: 'Urban road with mixed traffic including buses and bikes',
    chip: 'Rush Hour',
  },
];
