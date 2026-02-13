'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/fetcher';

type TermsResponse = {
  terms?: {
    title: string;
    content: string;
    version: string;
  } | null;
};

export function ContentManager() {
  const [routeName, setRouteName] = useState('');
  const [amount, setAmount] = useState('');
  const [chargeNotes, setChargeNotes] = useState('');

  const [termsTitle, setTermsTitle] = useState('Terms & Conditions');
  const [termsVersion, setTermsVersion] = useState('1.0');
  const [termsContent, setTermsContent] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

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

    loadTerms();
  }, []);

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
      setStatus('Charge added successfully.');
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to add charge');
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
      <Card>
        <CardHeader>
          <CardTitle>Manage Charges</CardTitle>
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
          <Button className="w-full" onClick={addCharge} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Charge
          </Button>
        </CardContent>
      </Card>

      <Card>
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
