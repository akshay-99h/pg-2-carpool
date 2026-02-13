import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function TermsPage() {
  await requireApprovedUser();

  const terms = await db.termsDocument.findFirst({
    where: { active: true },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{terms?.title ?? 'Terms & Conditions'}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {terms?.content ?? 'Terms not available yet.'}
        </pre>
      </CardContent>
    </Card>
  );
}
