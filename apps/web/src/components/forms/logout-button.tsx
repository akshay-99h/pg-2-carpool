'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LogoutButton({
  className,
  variant = 'outline',
  size = 'sm',
}: {
  className?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onLogout}
      disabled={loading}
      className={cn(className)}
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
