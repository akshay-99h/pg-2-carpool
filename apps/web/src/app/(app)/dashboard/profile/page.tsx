import { OnboardingForm } from '@/components/forms/onboarding-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireProfileCompletion } from '@/server/auth-guards';

export default async function ProfilePage() {
  const user = await requireProfileCompletion();

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>My profile</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Approval status:{' '}
          <span className="font-semibold text-foreground">{user.approvalStatus}</span>
        </CardContent>
      </Card>
      <OnboardingForm
        initial={
          user.profile
            ? {
                name: user.profile.name,
                towerFlat: user.profile.towerFlat,
                commuteRole: user.profile.commuteRole,
                vehicleNumber: user.profile.vehicleNumber,
                mobileNumber: user.profile.mobileNumber,
              }
            : undefined
        }
      />
    </div>
  );
}
