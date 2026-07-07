'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { TableActions } from '@/@core/components/Table/tanstack-table/TableActions';
import { TPatient } from '@/api/hooks/patient/schema';
import { ROUTES } from '@/navigation/sidebar/routes';
import { TModuleActionPermissions } from '@/types/common/common.schema';

export const getPatientColumns = (
  onDelete: (id: string) => void,
  router: AppRouterInstance,
  actionPermissions: TModuleActionPermissions,
  onlyView?: boolean,
): ColumnDef<TPatient>[] => {
  const { canEdit, canDelete, canView } = actionPermissions;

  const columns: ColumnDef<TPatient>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      size: 250,
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-8 items-center justify-center rounded-full">
              <User size={16} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-medium text-slate-700">{patient.full_name}</span>
              <span className="text-muted-foreground text-[10px] font-bold tracking-tight uppercase">
                {patient.gender || 'N/A'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'age',
      header: 'Age',
      size: 100,
      cell: ({ row }) => {
        const age = row.original.age;

        return (
          <span className="font-medium text-slate-700">{age ? `${age} yrs` : 'N/A'}</span>
        );
      },
    },
    {
      id: 'contact_information',
      header: 'Contact Information',
      size: 280,
      cell: ({ row }) => {
        const patient = row?.original;

        return (
          <div className="flex min-w-0 flex-col text-left">
            <span className="truncate font-medium text-slate-800">{patient.phone || 'N/A'}</span>
            <span className="text-muted-foreground truncate text-xs">
              {patient.email || 'No email provided'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'doctor_a',
      header: 'Linked Doctor',
      size: 220,
      cell: ({ row }) => {
        const doctor = row.original.doctor_a;

        return (
          <div className="flex min-w-0 flex-col text-left">
            <span className="truncate font-medium text-slate-800">
              {doctor?.full_name || 'Unassigned'}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {doctor?.email || 'No doctor email'}
            </span>
          </div>
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
        const patient = row.original;

        return onlyView ? (
          <TableActions
            onView={canView ? () => router.push(ROUTES.patient.view(patient.id)) : undefined}
          />
        ) : (
          <TableActions
            onEdit={canEdit ? () => router.push(ROUTES.patient.edit(patient.id)) : undefined}
            onDelete={canDelete ? () => onDelete(patient.id) : undefined}
            onView={canView ? () => router.push(ROUTES.patient.view(patient.id)) : undefined}
          />
        );
      },
    });
  }

  return columns;
};
