'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import BannerPage from '@/module/banner/pages/BannerPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionGuard module="banners" action="edit">
        <BannerPage />
      </PermissionGuard>
    </Suspense>
  );
}
