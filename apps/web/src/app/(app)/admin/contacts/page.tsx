import { ContactManager } from '@/components/admin/contact-manager';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Inbox',
};

export default function AdminContactsPage() {
  return <ContactManager />;
}
