'use client';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { GripVertical } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Image from 'next/image';

import { TableActions } from '@/@core/components/Table/tanstack-table/TableActions';
import { TDepartment } from '@/api/hooks/department/schema';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/navigation/sidebar/routes';
import { TModuleActionPermissions } from '@/types/common/common.schema';

export const getDepartmentColumns = (
  onDelete: (id: string) => void,
  router: AppRouterInstance,
  onStatusChange: (dept: TDepartment) => void,
  actionPermissions: TModuleActionPermissions,
  page: number,
  pageSize: number,
): ColumnDef<TDepartment>[] => {
  const { canEdit, canDelete, canView } = actionPermissions;

  const columns: ColumnDef<TDepartment>[] = [];

  if (canEdit) {
    columns.push(
      {
        id: 'drag',
        header: '',
        size: 56,
        cell: () => (
          <div className="flex items-center justify-center text-slate-300">
            <GripVertical size={16} />
          </div>
        ),
      },
      {
        accessorKey: 'sequence_no',
        header: 'Seq.',
        size: 90,
        cell: ({ row }) => {
          const globalIndex = (page - 1) * pageSize + row.index + 1;
          return (
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700">
              {globalIndex}
            </span>
          );
        },
      },
    );
  }

  columns.push(
    {
      accessorKey: 'image',
      header: 'Department Image',
      size: 80,
      cell: ({ row }) => {
        const department = row.original;
        return (
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
            {department.image ? (
              <Image
                src={department.image as unknown as string}
                alt={department.name}
                width={100}
                height={100}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src="/images/no_user_found.png"
                alt="placeholder"
                width={100}
                height={100}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Department Name',
      size: 250,
      cell: ({ row }) => {
        const department = row.original;
        return (
          <div className="flex items-center gap-3">
            {/* <div className="bg-muted flex size-8 items-center justify-center rounded-full">
            <User size={16} />
          </div> */}
            <div className="flex flex-col text-left">
              <span className="font-medium text-slate-700">{department.name}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      size: 180,
      cell: ({ row }) => {
        const department = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-slate-800">
                {department.created_at
                  ? dayjs(department.created_at).format('MMMM DD, YYYY')
                  : '---'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
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
  );

  if (canEdit || canDelete || canView) {
    columns.push({
      id: 'actions',
      header: 'Actions',
      size: 120,
      cell: ({ row }) => {
        const department = row.original;

        return (
          <TableActions
            onEdit={canEdit ? () => router.push(ROUTES.department.edit(department.id)) : undefined}
            onDelete={canDelete ? () => onDelete(department.id) : undefined}
            onView={canView ? () => router.push(ROUTES.department.view(department.id)) : undefined}
          />
        );
      },
    });
  }

  return columns;
};
