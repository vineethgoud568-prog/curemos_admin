'use client';

import { ReloadIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { usePermissions } from '@/hooks/usePermissions';
import {
  TSubadminPermissionAction,
  TSubadminPermissionModule,
} from '@/module/subadmin/zod/subadmin.schema';
import { ROUTES } from '@/navigation/sidebar/routes';

type PermissionGuardProps = {
  module: TSubadminPermissionModule;
  action: TSubadminPermissionAction;
  children: ReactNode;
};

export default function PermissionGuard({ module, action, children }: PermissionGuardProps) {
  const router = useRouter();
  const { hasPermission, isAuthenticated, isLoading } = usePermissions();
  const canAccess = hasPermission(module, action);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.auth.login);
      return;
    }

    if (!canAccess) {
      router.replace('/unauthorized');
    }
  }, [canAccess, isAuthenticated, isLoading, router]);

  if (isLoading || !canAccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <ReloadIcon className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return children;
}
