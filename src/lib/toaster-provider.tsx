// app/components/ToasterProvider.tsx or wherever appropriate
'use client';

import { Toaster } from 'sonner';

export function ToasterProvider() {
  return <Toaster position="top-right" />;
}
