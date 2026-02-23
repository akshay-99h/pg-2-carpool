import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { db } from '@/lib/db';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function TermsPage() {
  await requireApprovedUser();

  const terms = await db.termsDocument.findFirst({
    where: { active: true },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <Card className="auth-hero-card">
      <CardHeader>
        <CardTitle>{terms?.title ?? 'Terms & Conditions'}</CardTitle>
      </CardHeader>
      <CardContent>
        <MarkdownContent content={terms?.content ?? 'Terms not available yet.'} />
      </CardContent>
    </Card>
  );
}
