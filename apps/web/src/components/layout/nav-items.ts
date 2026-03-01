import {
  CarTaxiFront,
  CircleUserRound,
  FileText,
  Grid2x2,
  Home,
  Info,
  type LucideIcon,
  Mail,
  MapPinned,
  Route,
  SearchCheck,
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
  { href: '/dashboard/charges', label: 'Shared Expenses', icon: WalletCards },
  { href: '/dashboard/profile', label: 'Profile', icon: CircleUserRound },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: MapPinned },
  { href: '/dashboard/terms', label: 'Terms and Conditions', icon: FileText },
];

export const mobilePrimaryNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/trips', label: 'Trips', icon: CarTaxiFront },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: MapPinned },
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
    label: 'Shared Expenses',
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
    label: 'Terms and Conditions',
    icon: FileText,
    description: 'Read safety and compliance policies',
  },
  {
    href: '/dashboard/find-rider',
    label: 'Find Passenger',
    icon: SearchCheck,
    description: 'Browse posted pool requests and match them with your trip',
  },
  {
    href: '/dashboard/contact',
    label: 'Contact Us',
    icon: Mail,
    description: 'Share support requests with admins',
  },
  {
    href: '/dashboard/about',
    label: 'About',
    icon: Info,
    description: 'Read about Car Pool PG2 and how it works',
  },
];

export const mobileMoreActivePrefixes = [
  '/dashboard/more',
  '/dashboard/map',
  '/dashboard/charges',
  '/dashboard/profile',
  '/dashboard/terms',
  '/dashboard/pool-requests',
  '/dashboard/find-rider',
  '/dashboard/contact',
  '/dashboard/about',
];
