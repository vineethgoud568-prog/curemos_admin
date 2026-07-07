import { useAuth } from './useAuth';

import {
  TSubadminPermissionAction,
  TSubadminPermissionModule,
} from '@/module/subadmin/zod/subadmin.schema';

export const usePermissions = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role?.role === 'super_admin' || user?.role?.role === 'admin';
  const isSubAdmin = user?.role?.role === 'sub_admin';
  const permissions = user?.permissions || [];

  const hasPermission = (
    moduleName: TSubadminPermissionModule,
    action: TSubadminPermissionAction,
  ) => {
    // Super admins and admins have all access
    if (isSuperAdmin) return true;

    // If not a subadmin, they don't have access (or if permissions aren't loaded yet)
    if (!isSubAdmin) return false;

    // Check specific module
    const modulePerms = permissions.find((p) => p.module === moduleName);
    if (!modulePerms) return false;

    // Check specific action within the module
    return modulePerms.permission.includes(action);
  };

  return {
    hasPermission,
    isLoading: isAuthLoading,
    isAuthenticated,
    permissions,
    isSuperAdmin,
    isSubAdmin,
  };
};
