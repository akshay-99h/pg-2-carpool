import { ContactForm } from '@/components/forms/contact-form';
import { requireProfileCompletion } from '@/server/auth-guards';

export default async function ContactPage() {
  const user = await requireProfileCompletion();

  return (
    <ContactForm
      initial={{
        name: user.profile?.name,
        mobile: user.profile?.mobileNumber,
      }}
    />
  );
}
