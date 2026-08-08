import { ContactForm } from '@/components/forms/contact-form';
import { requireProfileCompletion } from '@/server/auth-guards';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
};

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
