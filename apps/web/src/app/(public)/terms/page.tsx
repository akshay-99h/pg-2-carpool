import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-muted-foreground">
                            {terms?.content ?? 'Terms not available yet.'}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
