'use client';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { TableActions } from '@/@core/components/Table/tanstack-table/TableActions';
import { TSubadmin } from '@/api/hooks/subadmin/schema';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/navigation/sidebar/routes';
import { TModuleActionPermissions } from '@/types/common/common.schema';

interface ReportColumnProps {
  onDelete: (id: string) => void;
  router: AppRouterInstance;
  onStatusChange: (subadmin: TSubadmin) => void;
  actionPermissions: TModuleActionPermissions;
}

export const getSubAdminColumns = ({
  onDelete,
  router,
  onStatusChange,
  actionPermissions,
}: ReportColumnProps): ColumnDef<TSubadmin>[] => {
  const { canEdit, canDelete, canView } = actionPermissions;

  const columns: ColumnDef<TSubadmin>[] = [
    {
      accessorKey: 'full_name',
      header: 'Full name',
      size: 250,
      cell: ({ row }) => {
        const subadmin = row.original;
        return (
          <div className="flex items-center gap-3">
            {/* <div className="bg-muted flex size-8 items-center justify-center rounded-full">
            <User size={16} />
          </div> */}
            <div className="flex flex-col text-left">
              <span className="font-medium text-slate-700">{subadmin?.full_name}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 230,
      cell: ({ row }) => {
        const subadmin = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-slate-800">
                {subadmin?.email || '---'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      size: 230,
      cell: ({ row }) => {
        const subadmin = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-slate-800">
                {subadmin?.category || '---'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      size: 150,
      cell: ({ row }) => {
        const subadmin = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-slate-800">
                {subadmin.created_at ? dayjs(subadmin.created_at).format('MMMM DD, YYYY') : '---'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 100,
      cell: ({ row }) => {
        const isActive = row.original.status === 'active';
        return (
          <button
            onClick={() => onStatusChange(row.original)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95',
              isActive
                ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                : 'border border-rose-200 bg-rose-100 text-rose-700',
            )}
          >
            <div
              className={cn('size-2 rounded-full', isActive ? 'bg-emerald-500' : 'bg-rose-500')}
            />
            {isActive ? 'Active' : 'Inactive'}
          </button>
        );
      },
    },
  ];

  if (canEdit || canDelete || canView) {
    columns.push({
      id: 'actions',
      header: 'Actions',
      size: 120,
      cell: ({ row }) => {
        const subadmin = row.original;

        return (
          <TableActions
            onEdit={canEdit ? () => router.push(ROUTES.subadmin.edit(subadmin.id)) : undefined}
            onDelete={canDelete ? () => onDelete(subadmin.id) : undefined}
            onView={canView ? () => router.push(ROUTES.subadmin.view(subadmin.id)) : undefined}
          />
        );
      },
    });
  }

  return columns;
};
