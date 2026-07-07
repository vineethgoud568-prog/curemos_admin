'use client';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Clock, MapPin, Phone, UserRound } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { TableActions } from '@/@core/components/Table/tanstack-table/TableActions';
import { TDoctor, TDoctorRole } from '@/api/hooks/doctor/schema';
import { cn, convertMinutes } from '@/lib/utils';
import { formatSpecializations } from '@/module/report/components/ConsultationColumns';
import { ROUTES } from '@/navigation/sidebar/routes';
import { TModuleActionPermissions } from '@/types/common/common.schema';

export const getDoctorColumns = (
  onDelete: (id: string) => void,
  onStatusChange: (doctor: TDoctor) => void,
  router: AppRouterInstance,
  activeRole: TDoctorRole,
  actionPermissions: TModuleActionPermissions,
): ColumnDef<TDoctor>[] => {
  const isGP = activeRole === 'doctor_a';
  const { canEdit, canDelete, canView } = actionPermissions;

  const columns: ColumnDef<TDoctor>[] = [
    {
      accessorKey: 'id',
      header: 'Doctor ID',
      size: 150,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-500">#{row.original.id.slice(0, 8)}</span>
      ),
    },
    {
      accessorKey: 'full_name',
      header: 'Doctor Name',
      size: 280,
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100">
              <UserRound size={18} className="text-slate-500" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-slate-800">
                {doctor.full_name || '---'}
              </span>
              <span className="truncate text-[11px] text-slate-400">{doctor.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone Number',
      size: 160,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Phone size={14} className="text-slate-400" />
          {row.original.phone || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      size: 180,
      cell: ({ row }) => {
        const doctor = row.original.specializations;

        return (
          <span className="block max-w-[220px] truncate font-semibold text-slate-800">
            {formatSpecializations(doctor)}
          </span>
        );
      },
    },
    // {
    //   accessorKey: 'specialization',
    //   header: 'Specialization',
    //   size: 180,
    //   cell: ({ row }) => (
    //     <span className="truncate text-slate-600">{row.original.specialization || 'N/A'}</span>
    //   ),
    // },
    {
      accessorKey: 'state_medical_council',
      header: 'Medical Council State',
      size: 180,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin size={14} className="text-slate-400" />
          <span className="truncate">{row.original.state_medical_council || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      size: 180,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin size={14} className="text-slate-400" />
          <span className="truncate">{row.original.location || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'state',
      header: 'State',
      size: 150,
      cell: ({ row }) => (
        <span className="truncate text-slate-600">{row.original.state || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'district',
      header: 'District',
      size: 150,
      cell: ({ row }) => (
        <span className="truncate text-slate-600">{row.original.district || 'N/A'}</span>
      ),
    },

    // {
    //   accessorKey: 'hospital_affiliation',
    //   header: 'Associated Hospital / Clinic',
    //   size: 220,
    //   cell: ({ row }) => (
    //     <span className="truncate font-medium text-slate-600">
    //       {row.original.hospital_affiliation || 'N/A'}
    //     </span>
    //   ),
    // },
    {
      accessorKey: 'created_at',
      header: 'Date of Joining',
      size: 180,
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-slate-800">
              {row.original.created_at
                ? dayjs(row.original.created_at).format('MMMM DD, YYYY')
                : '---'}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'total_consultations',
      header: 'Total Consultations',
      size: 160,
      cell: ({ row }) => (
        <div className="text-center font-bold text-slate-700">
          {row.original.total_consultations ?? 0}
        </div>
      ),
    },
    {
      accessorKey: 'scheduled_consultations',
      header: 'Scheduled Consultations',
      size: 180,
      cell: ({ row }) => (
        <div className="text-center font-bold text-blue-600">
          {row.original.scheduled_consultations ?? 0}
        </div>
      ),
    },
    {
      accessorKey: 'completed_consultations',
      header: 'Completed Consultations',
      size: 180,
      cell: ({ row }) => (
        <div className="text-center font-bold text-slate-600">
          {row.original.completed_consultations ?? 0}
        </div>
      ),
    },
    {
      accessorKey: 'cancelled_scheduled_calls',
      header: 'Cancelled Scheduled Calls',
      size: 200,
      cell: ({ row }) => (
        <div className="text-center font-bold text-rose-500">
          {row.original.cancelled_scheduled_calls ?? 0}
        </div>
      ),
    },
  ];

  // Conditional Rendering Logic
  if (!isGP) {
    columns.push({
      accessorKey: 'not_responded_calls',
      header: 'Not Responded Calls',
      size: 180,
      cell: ({ row }) => (
        <div className="text-center font-bold text-orange-500">
          {row.original.not_responded_calls ?? 0}
        </div>
      ),
    });
  }

  if (isGP) {
    columns.push({
      accessorKey: 'no_of_referrals',
      header: 'No. of Referrals By (by GP)',
      size: 200,
      cell: ({ row }) => (
        <div className="text-center font-bold text-indigo-600">
          {row.original.no_of_referrals ?? 0}
        </div>
      ),
    });
  }

  // Adding shared performance columns
  columns.push(
    {
      accessorKey: 'no_of_patient_turned_around',
      header: 'No. of Patient Turned Around',
      size: 220,
      cell: ({ row }) => (
        <div className="text-center font-bold text-slate-700">
          {row.original.no_of_patient_turned_around ?? 0}
        </div>
      ),
    },
    {
      accessorKey: 'no_of_patient_not_turned_around',
      header: 'No. of Patient Not Turned Around',
      size: 250,
      cell: ({ row }) => (
        <div className="text-center font-bold text-slate-500">
          {row.original.no_of_patient_not_turned_around ?? 0}
        </div>
      ),
    },
    {
      accessorKey: 'avg_consultation_duration',
      header: 'Avg Consultation Duration',
      size: 220,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1 font-bold text-slate-600">
          <Clock size={14} />
          {convertMinutes(row.original.avg_consultation_duration ?? 0) ?? 0}
        </div>
      ),
    },
    {
      accessorKey: 'referral_conversion_rate',
      header: 'Referral Conversion Rate (%)',
      size: 200,
      cell: ({ row }) => (
        <div className="text-center font-extrabold text-blue-700">
          {row.original.referral_conversion_rate ?? 0}%
        </div>
      ),
    },
    // {
    //   accessorKey: 'last_active_date',
    //   header: 'Last Active Date',
    //   size: 180,
    //   cell: ({ row }) => (
    //     <div className="flex items-center gap-2 text-slate-500 text-xs">
    //       <Calendar size={13} />
    //       {row.original.last_active_date ? format(new Date(row.original.last_active_date), 'MMM dd, yyyy') : 'Never'}
    //     </div>
    //   ),
    // },
    {
      accessorKey: 'status',
      header: 'Status - Account',
      size: 140,
      cell: ({ row }) => {
        const status = row.original.status || 'inactive';
        const isActive = status === 'active';
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
        const doctor = row.original;
        return (
          <TableActions
            onEdit={canEdit ? () => router.push(ROUTES.doctor.edit(doctor.id)) : undefined}
            onDelete={canDelete ? () => onDelete(doctor.id) : undefined}
            onView={canView ? () => router.push(ROUTES.doctor.view(doctor.id)) : undefined}
          />
        );
      },
    });
  }

  return columns;
};
