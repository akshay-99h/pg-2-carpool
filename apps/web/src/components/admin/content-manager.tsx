'use client';

import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/fetcher';
import { formatCurrencyInr } from '@/lib/format';

type TermsResponse = {
  terms?: {
    title: string;
    content: string;
    version: string;
  } | null;
};

type ChargeItem = {
  id: string;
  routeName: string;
  amount: number;
  notes?: string | null;
  active: boolean;
  orderNo: number;
};

export function ContentManager() {
  const [charges, setCharges] = useState<ChargeItem[]>([]);
  const [editingChargeId, setEditingChargeId] = useState<string | null>(null);
  const [routeName, setRouteName] = useState('');
  const [amount, setAmount] = useState('');
  const [chargeNotes, setChargeNotes] = useState('');

  const [termsTitle, setTermsTitle] = useState('Terms and Conditions, Car Pool PG2');
  const [termsVersion, setTermsVersion] = useState('1.0');
  const [termsContent, setTermsContent] = useState(`By joining and remaining in this group, you agree to the following terms:

1. Membership & Eligibility

Resident Only: Participation is strictly limited to verified residents of Panchsheel Greens 2.

2. Cost Sharing & Commercial Use

No Profit: Carpooling must be on a not-for-profit basis. Members may share actual costs (fuel, tolls) but cannot charge for "hire or reward," as using a private (white plate) vehicle for commercial gain is illegal in India.

Pre-agreed Rates: Any cost-sharing must be mutually agreed upon before the journey begins.

3. Group Etiquette & Safety

Stay On-Topic: Post only carpool requests, offers, or essential updates. No spam, advertisements, or "Good Morning" messages.

Punctuality: Both drivers and riders must adhere to agreed timings. Notify the group immediately of any delays or cancellations. Deviations from route is not accepted.

Privacy: Do not share member contact details or personal information outside this group without explicit consent.

Safety: Avoid using ride in the car which is not having society green security sticker if you do not know the person personally specially for ladies.

4. Disclaimers & Liability

No Admin Liability: The group administrators act only as facilitators and are not vicariously liable for any member's posts or actions.

Personal Responsibility: Members participate at their own risk. The society and admins are not responsible for any accidents, vehicle damage, or personal disputes.

Right to Remove: Admins reserve the right to remove anyone who violates these rules or engages in harassment.

5. Legal Compliance

Participants must follow all local traffic laws.`);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const loadCharges = useCallback(async () => {
    try {
      const response = await apiFetch<{ charges: ChargeItem[] }>('/api/charges?all=true');
      setCharges(response.charges);
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const response = await apiFetch<TermsResponse>('/api/terms');
        if (response.terms) {
          setTermsTitle(response.terms.title);
          setTermsVersion(response.terms.version);
          setTermsContent(response.terms.content);
        }
      } catch {
        // no-op
      }
    };

    void loadTerms();
    void loadCharges();
  }, [loadCharges]);

  const startEditCharge = (charge: ChargeItem) => {
    setEditingChargeId(charge.id);
    setRouteName(charge.routeName);
    setAmount(String(charge.amount));
    setChargeNotes(charge.notes ?? '');
  };

  const cancelEdit = () => {
    setEditingChargeId(null);
    setRouteName('');
    setAmount('');
    setChargeNotes('');
  };

  const addCharge = async () => {
    setLoading(true);
    setStatus('');
    try {
      await apiFetch('/api/charges', {
        method: 'POST',
        body: JSON.stringify({
          routeName,
          amount: Number(amount),
          notes: chargeNotes,
        }),
      });
      setRouteName('');
      setAmount('');
      setChargeNotes('');
      setStatus('Shared expense added successfully.');
      await loadCharges();
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to add shared expense');
    } finally {
      setLoading(false);
    }
  };

  const updateCharge = async () => {
    if (!editingChargeId) return;
    setLoading(true);
    setStatus('');
    try {
      await apiFetch(`/api/charges/${editingChargeId}`, {
        method: 'PUT',
        body: JSON.stringify({
          routeName,
          amount: Number(amount),
          notes: chargeNotes,
        }),
      });
      setRouteName('');
      setAmount('');
      setChargeNotes('');
      setEditingChargeId(null);
      setStatus('Shared expense updated successfully.');
      await loadCharges();
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to update shared expense');
    } finally {
      setLoading(false);
    }
  };

  const deleteCharge = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shared expense?')) {
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      await apiFetch(`/api/charges/${id}`, {
        method: 'DELETE',
      });
      setStatus('Shared expense deleted successfully.');
      await loadCharges();
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to delete shared expense');
    } finally {
      setLoading(false);
    }
  };

  const updateTerms = async () => {
    setLoading(true);
    setStatus('');
    try {
      await apiFetch('/api/terms', {
        method: 'PUT',
        body: JSON.stringify({
          title: termsTitle,
          version: termsVersion,
          content: termsContent,
        }),
      });
      setStatus('Terms updated.');
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to update terms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>Manage Shared Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Route Name</Label>
            <Input value={routeName} onChange={(event) => setRouteName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Amount (INR)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={chargeNotes}
              onChange={(event) => setChargeNotes(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {editingChargeId ? (
              <>
                <Button className="flex-1" onClick={updateCharge} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update Shared Expense
                </Button>
                <Button variant="outline" onClick={cancelEdit} disabled={loading}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={addCharge} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Shared Expense
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {charges.length > 0 ? (
        <Card className="auth-hero-card">
          <CardHeader>
            <CardTitle>Existing Shared Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {charges.map((charge) => (
              <div key={charge.id} className="auth-tile flex items-center justify-between gap-3 p-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{charge.routeName}</p>
                    <p className="text-sm font-bold text-primary">{formatCurrencyInr(charge.amount)}</p>
                  </div>
                  {charge.notes ? (
                    <p className="mt-1 text-xs text-muted-foreground">{charge.notes}</p>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditCharge(charge)}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCharge(charge.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>Manage Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={termsTitle} onChange={(event) => setTermsTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Version</Label>
            <Input value={termsVersion} onChange={(event) => setTermsVersion(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={termsContent}
              onChange={(event) => setTermsContent(event.target.value)}
            />
          </div>
          <Button className="w-full" onClick={updateTerms} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish Terms
          </Button>
          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
