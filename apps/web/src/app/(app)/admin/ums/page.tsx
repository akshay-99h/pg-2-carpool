import { UmsManager } from '@/components/admin/ums-manager';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management',
};

export default function AdminUmsPage() {
  return <UmsManager />;
}
