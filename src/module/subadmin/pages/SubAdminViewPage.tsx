'use client';

import dayjs from 'dayjs';
import { Activity, Calendar, Check, KeyRound, Mail, ShieldCheck, User, X } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import {
  subadminPermissionActions,
  subadminPermissionModules,
  TSubadminFormValues,
  TSubadminPermissionAction,
  TSubadminPermissionModule,
} from '../zod/subadmin.schema';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { useGeTSubadminById, useGetSubadminPermissions } from '@/api/hooks/subadmin/hooks';
import { TSubadminPermission } from '@/api/hooks/subadmin/schema';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const permissionLabels: Record<TSubadminPermissionAction, string> = {
  list: 'List',
  add: 'Add',
  edit: 'Edit',
  view: 'View',
  delete: 'Delete',
};

const isPermissionModule = (value: string): value is TSubadminPermissionModule =>
  subadminPermissionModules.includes(value as TSubadminPermissionModule);

const isPermissionAction = (value: unknown): value is TSubadminPermissionAction =>
  subadminPermissionActions.includes(value as TSubadminPermissionAction);

const createEmptyPermissions = (): TSubadminFormValues['permissions'] =>
  Object.fromEntries(
    subadminPermissionModules.map((moduleName) => [moduleName, []]),
  ) as TSubadminFormValues['permissions'];

const mapSubadminPermissions = (
  permissions: TSubadminPermission[] = [],
): TSubadminFormValues['permissions'] => {
  const mappedPermissions = createEmptyPermissions();

  permissions.forEach((item) => {
    if (!isPermissionModule(item.module)) return;

    mappedPermissions[item.module] = Array.isArray(item.permission)
      ? item.permission.filter(isPermissionAction)
      : [];
  });

  return mappedPermissions;
};

const formatModuleName = (moduleName: TSubadminPermissionModule) =>
  moduleName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const isActionVisible = (
  moduleName: TSubadminPermissionModule,
  action: TSubadminPermissionAction,
) => {
  if ((moduleName === 'report' || moduleName === 'referral') && ['add', 'edit'].includes(action)) {
    return false;
  }

  if (
    ['privacy-policy', 'terms-and-conditions', 'contact', 'banners'].includes(moduleName) &&
    action !== 'edit'
  ) {
    return false;
  }

  return true;
};

export default function SubadminViewPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: subadmin, isLoading: isSubadminLoading, error } = useGeTSubadminById(id);
  const {
    data: subadminPermissions,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = useGetSubadminPermissions(id);

  if (isSubadminLoading || isPermissionsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Activity className="text-primary animate-pulse" size={48} />
          <p className="text-muted-foreground animate-pulse">Fetching subadmin details...</p>
        </div>
      </div>
    );
  }

  if (error || permissionsError || !subadmin) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-destructive flex flex-col items-center gap-2">
          <p className="text-lg font-semibold">Error Loading Subadmin</p>
          <p className="text-sm">
            {error?.message || permissionsError?.message || 'Subadmin not found'}
          </p>
        </div>
      </div>
    );
  }

  const permissions = mapSubadminPermissions(subadminPermissions);
  const grantedCount = Object.values(permissions).reduce(
    (total, modulePermissions) => total + modulePermissions.length,
    0,
  );
  const imageUrl = typeof subadmin.image === 'string' ? subadmin.image : '';
  const isActive = subadmin.status === 'active';

  return (
    <div className="w-full space-y-4 p-4">
      <PageCardHeader title="Subadmin Details" backButton hideAddButton />

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-muted relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full">
              {imageUrl ? (
                <Image src={imageUrl} alt={subadmin.full_name} fill className="object-cover" />
              ) : (
                <User className="text-muted-foreground" size={34} />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {subadmin.full_name || 'N/A'}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    'border capitalize',
                    isActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700',
                  )}
                >
                  {subadmin.status || 'N/A'}
                </Badge>
                <Badge variant="outline">{grantedCount} Permissions</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <User className="text-primary" size={20} /> Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <KeyRound className="text-muted-foreground" size={18} />
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">Role</p>
                <p className="truncate text-sm font-medium">{subadmin.category || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-muted-foreground" size={18} />
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">Email Address</p>
                <p className="truncate text-sm font-medium">{subadmin.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground" size={18} />
              <div>
                <p className="text-muted-foreground text-xs">Created Date</p>
                <p className="text-sm font-medium">
                  {subadmin.created_at ? dayjs(subadmin.created_at).format('MMMM DD, YYYY') : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-muted-foreground" size={18} />
              <div>
                <p className="text-muted-foreground text-xs">Total Access</p>
                <p className="text-sm font-medium">{grantedCount} granted permission actions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <ShieldCheck className="text-primary" size={20} /> Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="w-52 px-4 py-3">Module</th>
                    {subadminPermissionActions.map((action) => (
                      <th key={action} className="px-4 py-3 text-center">
                        {permissionLabels[action]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subadminPermissionModules.map((moduleName) => (
                    <tr key={moduleName} className="bg-white">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {formatModuleName(moduleName)}
                      </td>
                      {subadminPermissionActions.map((action) => {
                        const visible = isActionVisible(moduleName, action);
                        const granted = permissions[moduleName]?.includes(action);

                        return (
                          <td key={action} className="px-4 py-3 text-center">
                            {visible ? (
                              <span
                                className={cn(
                                  'inline-flex size-7 items-center justify-center rounded-full border',
                                  granted
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-400',
                                )}
                              >
                                {granted ? <Check size={16} /> : <X size={15} />}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
