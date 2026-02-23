import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownContent } from '@/components/ui/markdown-content';
import { db } from '@/lib/db';

export default async function PublicTermsPage() {
    const terms = await db.termsDocument.findFirst({
        where: { active: true },
        orderBy: { publishedAt: 'desc' },
    });

    return (
        <main className="min-h-screen bg-muted/30 p-4 md:p-8">
            <div className="mx-auto max-w-3xl">
                <Card className="auth-hero-card">
                    <CardHeader>
                        <CardTitle>{terms?.title ?? 'Terms & Conditions'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MarkdownContent content={terms?.content ?? 'Terms not available yet.'} />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
