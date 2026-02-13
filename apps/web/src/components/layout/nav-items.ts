import {
  CarTaxiFront,
  CircleUserRound,
  FileText,
  Home,
  type LucideIcon,
  MapPinned,
  Route,
  WalletCards,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
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
