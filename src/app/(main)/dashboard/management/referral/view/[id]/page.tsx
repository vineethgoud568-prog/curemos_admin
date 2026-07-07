'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import ReferralViewPage from '@/module/referral/pages/ReferralViewPage';

// export const metadata = {
//   title: 'Referral Details | Curemos Admin',
// };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionGuard module="referral" action="view">
        <ReferralViewPage id={id} />
      </PermissionGuard>
    </Suspense>
  );
}
