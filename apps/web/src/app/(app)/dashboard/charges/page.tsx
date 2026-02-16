import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { formatCurrencyInr } from '@/lib/format';
import { requireApprovedUser } from '@/server/auth-guards';

export default async function ChargesPage() {
  await requireApprovedUser();

  const charges = await db.chargeItem.findMany({
    where: { active: true },
    orderBy: [{ orderNo: 'asc' }, { routeName: 'asc' }],
  });

  return (
    <Card className="auth-hero-card">
      <CardHeader>
        <CardTitle>Charges List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {charges.length === 0 ? (
          <p className="text-sm text-muted-foreground">No charge list available.</p>
        ) : null}
        {charges.map((charge) => (
          <div key={charge.id} className="auth-tile p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{charge.routeName}</p>
              <p className="text-sm font-bold text-primary">{formatCurrencyInr(charge.amount)}</p>
            </div>
            {charge.notes ? (
              <p className="mt-1 text-xs text-muted-foreground">{charge.notes}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
