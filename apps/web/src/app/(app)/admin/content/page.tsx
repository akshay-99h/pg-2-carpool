import { ContentManager } from '@/components/admin/content-manager';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content',
};

export default function AdminContentPage() {
  return <ContentManager />;
}
