'use client';

import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

import { TReportDoctorProfile } from '@/api/hooks/report/schema';
import { convertMinutes } from '@/lib/utils';

export const formatSpecializations = (specializations?: string[] | null) => {
  if (specializations?.length) {
    return specializations.join(', ');
  }

  return specializations || '---';
};

export const getConsultationsColumns = (): ColumnDef<
  Partial<TReportDoctorProfile> | undefined
>[] => {
  return [
    {
      accessorKey: 'full_name',
      header: 'Doctor Name',
      size: 220,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-slate-800">
              {doctor?.full_name || '---'}
            </span>
            <span className="text-xs text-slate-500 capitalize italic">
              {doctor?.email || '---'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      size: 180,
      cell: ({ row }) => {
        const doctor = row.original?.specializations;

        return (
          <span className="block max-w-[220px] truncate font-semibold text-slate-800">
            {formatSpecializations(doctor)}
          </span>
        );
      },
    },
    // {
    //   accessorKey: 'dePartment',
    //   header: 'Department',
    //   size: 130,
    //   cell: ({ row }) => {
    //     const doctor = row.original;

    //     return (
    //       <div className="flex min-w-0 items-center gap-3">
    //         <div className="flex min-w-0 flex-col">
    //           <span className="truncate font-semibold text-slate-800">
    //             {doctor?.department || '---'}
    //           </span>
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: 'state',
      header: 'State',
      size: 130,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-slate-800">
                {doctor?.state ? doctor.state : '---'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'district',
      header: 'District',
      size: 130,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-slate-800">
                {doctor?.district ? doctor.district : '---'}
              </span>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: 'created_at',
      header: 'Joiuned On',
      size: 130,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-slate-800">
                {doctor?.created_at ? dayjs(doctor.created_at).format('MMMM DD, YYYY') : '---'}
              </span>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: 'total_consultations',
      header: 'Total Consultations',
      size: 160,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <span className="font-semibold text-slate-800">{doctor?.total_consultations ?? 0}</span>
        );
      },
    },

    {
      accessorKey: 'scheduled_consultations',
      header: 'Scheduled Calls',
      size: 150,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <span className="font-semibold text-slate-800">
            {doctor?.scheduled_consultations ?? 0}
          </span>
        );
      },
    },

    {
      accessorKey: 'completed_consultations',
      header: 'Completed Calls',
      size: 150,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <span className="font-semibold text-slate-800">
            {doctor?.completed_consultations ?? 0}
          </span>
        );
      },
    },

    {
      accessorKey: 'cancelled_scheduled_calls',
      header: 'Cancelled Calls',
      size: 150,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          doctor?.cancelled_scheduled_calls && (
            <span className="font-semibold text-rose-600">{doctor?.cancelled_scheduled_calls}</span>
          )
        );
      },
    },

    {
      accessorKey: 'not_responded_calls',
      header: 'Not Responded',
      size: 150,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          doctor?.not_responded_calls && (
            <span className="font-semibold text-amber-600">{doctor.not_responded_calls}</span>
          )
        );
      },
    },

    {
      accessorKey: 'avg_consultation_duration',
      header: 'Avg Duration',
      size: 140,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          doctor?.avg_consultation_duration && (
            <span className="font-semibold text-slate-800">
              {convertMinutes(doctor.avg_consultation_duration)}
            </span>
          )
        );
      },
    },
  ];
};
