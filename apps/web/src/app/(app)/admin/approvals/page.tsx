import { ApprovalsManager } from '@/components/admin/approvals-manager';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Approvals',
};

export default function AdminApprovalsPage() {
  return <ApprovalsManager />;
}
