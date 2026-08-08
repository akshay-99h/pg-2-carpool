'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      // Clears the notch and the sticky in-app header, which the default
      // offset used to sit underneath on mobile.
      offset="calc(0.75rem + env(safe-area-inset-top))"
    />
  );
}
