import {
  CarTaxiFront,
  CircleUserRound,
  FileText,
  Grid2x2,
  Home,
  type LucideIcon,
  Mail,
  MapPinned,
  Route,
  SearchCheck,
  SquareDashedKanban,
  WalletCards,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const userNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/trips', label: 'Trips', icon: CarTaxiFront },
  { href: '/dashboard/map', label: 'Route Map', icon: Route },
  { href: '/dashboard/charges', label: 'Charges', icon: WalletCards },
  { href: '/dashboard/profile', label: 'Profile', icon: CircleUserRound },
  { href: '/dashboard/bookings', label: 'Bookings', icon: MapPinned },
  { href: '/dashboard/terms', label: 'Terms', icon: FileText },
];

export const mobilePrimaryNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/trips', label: 'Trips', icon: CarTaxiFront },
  { href: '/dashboard/bookings', label: 'Bookings', icon: MapPinned },
  { href: '/dashboard/more', label: 'More', icon: Grid2x2 },
];

export const mobileMoreNavItems: NavItem[] = [
  {
    href: '/dashboard/map',
    label: 'Route Map',
    icon: Route,
    description: 'View route planning and map support',
  },
  {
    href: '/dashboard/charges',
    label: 'Charges',
    icon: WalletCards,
    description: 'Check route-wise contribution guidance',
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: CircleUserRound,
    description: 'Edit resident and vehicle details',
  },
  {
    href: '/dashboard/terms',
    label: 'Terms',
    icon: FileText,
    description: 'Read safety and compliance policies',
  },
  {
    href: '/dashboard/pool-requests',
    label: 'Pool Requests',
    icon: SearchCheck,
    description: 'Post ride demand when no trips are available',
  },
  {
    href: '/dashboard/contact',
    label: 'Contact Us',
    icon: Mail,
    description: 'Share support requests with admins',
  },
  {
    href: '/dashboard/summary',
    label: 'Project Summary',
    icon: SquareDashedKanban,
    description: 'Overview of Car Pool PG2 initiative',
  },
];

export const mobileMoreActivePrefixes = [
  '/dashboard/more',
  '/dashboard/map',
  '/dashboard/charges',
  '/dashboard/profile',
  '/dashboard/terms',
  '/dashboard/pool-requests',
  '/dashboard/contact',
  '/dashboard/summary',
];
