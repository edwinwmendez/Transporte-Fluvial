'use client';

import { Toaster } from 'sonner';

/**
 * Provider de Toasts (Sonner)
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
    />
  );
}
