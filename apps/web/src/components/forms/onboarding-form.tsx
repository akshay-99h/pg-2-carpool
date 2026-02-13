'use client';

import type { CommuteRole } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { apiFetch } from '@/lib/fetcher';

export function OnboardingForm({
  initial,
}: {
  initial?: {
    name?: string;
    towerFlat?: string;
    commuteRole?: CommuteRole;
    vehicleNumber?: string | null;
    mobileNumber?: string;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [towerFlat, setTowerFlat] = useState(initial?.towerFlat ?? '');
  const [commuteRole, setCommuteRole] = useState<CommuteRole>(initial?.commuteRole ?? 'PASSENGER');
  const [vehicleNumber, setVehicleNumber] = useState(initial?.vehicleNumber ?? '');
  const [mobileNumber, setMobileNumber] = useState(initial?.mobileNumber ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <Card>
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
            <option value="VEHICLE_OWNER">Vehicle Owner</option>
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

        {error ? <p className="text-sm font-medium text-red-700 md:col-span-2">{error}</p> : null}

        <Button className="w-full md:col-span-2" onClick={onSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save and continue
        </Button>
      </CardContent>
    </Card>
  );
}
