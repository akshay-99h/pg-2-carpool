'use client';

import type { CommuteRole } from '@/lib/schemas';
import { Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { apiFetch } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

const verificationDocOptions = [
  { id: 'society-id', label: 'Society ID / maintenance slip' },
  { id: 'address-proof', label: 'Address proof (Aadhaar/utility bill)' },
  { id: 'vehicle-rc', label: 'Vehicle RC (if car owner)' },
  { id: 'driving-license', label: 'Driving license (if car owner)' },
] as const;

function toWhatsAppNumber(mobileNumber: string) {
  const digits = mobileNumber.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length > 10 && digits.startsWith('91')) {
    return digits;
  }
  return '';
}

export function OnboardingForm({
  initial,
  submitLabel = 'Save and continue',
  showLoginAction = false,
  adminWhatsappOptions = [],
}: {
  initial?: {
    name?: string;
    towerFlat?: string;
    commuteRole?: CommuteRole;
    vehicleNumber?: string | null;
    mobileNumber?: string;
  };
  submitLabel?: string;
  showLoginAction?: boolean;
  adminWhatsappOptions?: Array<{
    id: string;
    label: string;
    mobileNumber: string;
  }>;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [towerFlat, setTowerFlat] = useState(initial?.towerFlat ?? '');
  const [commuteRole, setCommuteRole] = useState<CommuteRole>(initial?.commuteRole ?? 'PASSENGER');
  const [vehicleNumber, setVehicleNumber] = useState(initial?.vehicleNumber ?? '');
  const [mobileNumber, setMobileNumber] = useState(initial?.mobileNumber ?? '');
  const [selectedAdminId, setSelectedAdminId] = useState(adminWhatsappOptions[0]?.id ?? '');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [extraVerificationInfo, setExtraVerificationInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedAdmin = adminWhatsappOptions.find((admin) => admin.id === selectedAdminId);
  const whatsappNumber = selectedAdmin ? toWhatsAppNumber(selectedAdmin.mobileNumber) : '';

  const whatsappMessage = useMemo(() => {
    if (!selectedAdmin) {
      return '';
    }

    const selectedDocLabels = verificationDocOptions
      .filter((item) => selectedDocs.includes(item.id))
      .map((item) => item.label);
    const docsLine = selectedDocLabels.length > 0 ? selectedDocLabels.join(', ') : 'Will share shortly';
    const vehicleLine = vehicleNumber ? vehicleNumber : 'Not provided';
    const notesLine = extraVerificationInfo.trim() || 'No additional notes';

    return [
      'Hello Admin, I have completed my Car Pool PG2 registration and need verification.',
      '',
      `Name: ${name || 'Not provided'}`,
      `Tower/Flat: ${towerFlat || 'Not provided'}`,
      `Role: ${commuteRole}`,
      `Mobile: ${mobileNumber || 'Not provided'}`,
      `Vehicle Number: ${vehicleLine}`,
      `Documents shared: ${docsLine}`,
      `Additional notes: ${notesLine}`,
    ].join('\n');
  }, [commuteRole, extraVerificationInfo, mobileNumber, name, selectedAdmin, selectedDocs, towerFlat, vehicleNumber]);

  const whatsappHref =
    whatsappNumber && whatsappMessage
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
      : '';

  const toggleDoc = (docId: string) => {
    setSelectedDocs((previous) =>
      previous.includes(docId)
        ? previous.filter((item) => item !== docId)
        : [...previous, docId]
    );
  };

  const onSave = async () => {
    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          towerFlat,
          commuteRole,
          vehicleNumber,
          mobileNumber,
        }),
      });
      router.push('/dashboard');
      router.refresh();
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-hero-card">
      <CardHeader>
        <CardTitle className="text-xl">Resident registration</CardTitle>
        <CardDescription>
          Complete details once. Admin approval enables trip features.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="towerFlat">Tower / Flat No</Label>
          <Input
            id="towerFlat"
            placeholder="A-1203"
            value={towerFlat}
            onChange={(event) => setTowerFlat(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commuteRole">Role</Label>
          <Select
            id="commuteRole"
            value={commuteRole}
            onChange={(event) => setCommuteRole(event.target.value as CommuteRole)}
          >
            <option value="VEHICLE_OWNER">Car owner</option>
            <option value="PASSENGER">Passenger</option>
            <option value="BOTH">Both</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleNumber">Vehicle Number (optional for passenger)</Label>
          <Input
            id="vehicleNumber"
            value={vehicleNumber}
            onChange={(event) => setVehicleNumber(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input
            id="mobileNumber"
            value={mobileNumber}
            onChange={(event) => setMobileNumber(event.target.value)}
            placeholder="10-digit mobile"
            maxLength={10}
          />
        </div>

        {adminWhatsappOptions.length > 0 ? (
          <div className="surface-inset space-y-3 rounded-xl p-3 md:col-span-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Verification via WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                Select an admin, choose documents, and open WhatsApp with a prefilled message. You
                can attach document images/files directly in WhatsApp.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationAdmin">Send to admin</Label>
              <Select
                id="verificationAdmin"
                value={selectedAdminId}
                onChange={(event) => setSelectedAdminId(event.target.value)}
              >
                {adminWhatsappOptions.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Documents to share</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {verificationDocOptions.map((doc) => {
                  const checked = selectedDocs.includes(doc.id);
                  return (
                    <label
                      key={doc.id}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition',
                        checked
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border/80 bg-white text-foreground/85 hover:bg-accent'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-primary"
                        checked={checked}
                        onChange={() => toggleDoc(doc.id)}
                      />
                      {doc.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationNote">Additional note (optional)</Label>
              <Input
                id="verificationNote"
                value={extraVerificationInfo}
                onChange={(event) => setExtraVerificationInfo(event.target.value)}
                placeholder="Example: I can share docs after 7 PM."
              />
            </div>

            <Button asChild variant="outline" disabled={!whatsappHref} className="w-full sm:w-auto">
              <a href={whatsappHref || '#'} target="_blank" rel="noreferrer noopener">
                <MessageCircle className="h-4 w-4" />
                Send verification details on WhatsApp
              </a>
            </Button>
          </div>
        ) : null}

        {error ? <p className="text-sm font-medium text-red-700 md:col-span-2">{error}</p> : null}

        <div
          className={showLoginAction ? 'grid gap-2 md:col-span-2 md:grid-cols-2' : 'md:col-span-2'}
        >
          <Button className="w-full" onClick={onSave} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
          {showLoginAction ? (
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Login</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
