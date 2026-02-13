'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/fetcher';

export function ContactForm({
  initial,
}: {
  initial?: {
    name?: string;
    mobile?: string;
  };
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [mobile, setMobile] = useState(initial?.mobile ?? '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const onSubmit = async () => {
    setLoading(true);
    setStatus('');

    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name, mobile, message }),
      });
      setMessage('');
      setStatus('Query submitted. Admin will contact you soon.');
    } catch (errorValue) {
      setStatus(errorValue instanceof Error ? errorValue.message : 'Failed to submit query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact us</CardTitle>
        <CardDescription>Ask support, report issues, or suggest improvements.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Mobile</Label>
          <Input
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            maxLength={10}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Message</Label>
          <Textarea value={message} onChange={(event) => setMessage(event.target.value)} />
        </div>
        {status ? <p className="text-sm text-muted-foreground md:col-span-2">{status}</p> : null}
        <Button className="w-full md:col-span-2" onClick={onSubmit} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit query
        </Button>
      </CardContent>
    </Card>
  );
}
