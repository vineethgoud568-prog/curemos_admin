'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { formatSpecializations } from './ConsultationColumns';

import { TReportDoctorProfile } from '@/api/hooks/report/schema';
import { ROUTES } from '@/navigation/sidebar/routes';

export const GetPatientColumns = (): ColumnDef<Partial<TReportDoctorProfile> | undefined>[] => {
  const router = useRouter();
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
      accessorKey: 'specializations',
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
    //   accessorKey: 'department',
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
      header: 'Total consultations',
      size: 160,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <span className="font-semibold text-slate-800">{doctor?.total_consultations ?? 0}</span>
        );
      },
    },

    {
      accessorKey: 'no_of_patient_not_turned_around',
      header: 'Not Turned Around Patients',
      size: 160,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <span className="font-semibold text-slate-800">
            {doctor?.no_of_patient_not_turned_around ?? 0}
          </span>
        );
      },
    },

    {
      accessorKey: 'no_of_patient_turned_around',
      header: 'Turned Around Patients',
      size: 150,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <span className="font-semibold text-slate-800">
            {doctor?.no_of_patient_turned_around ?? 0}
          </span>
        );
      },
    },

    {
      accessorKey: 'no_of_referrals',
      header: 'Total Referrals',
      size: 150,
      cell: ({ row }) => {
        const doctor = row.original;

        return <span className="font-semibold text-slate-800">{doctor?.no_of_referrals ?? 0}</span>;
      },
    },
    {
      accessorKey: 'no_of_patients',
      header: 'Total Patients',
      size: 150,
      cell: ({ row }) => {
        const doctor = row.original;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled={!doctor?.patients || doctor?.patients?.[0]?.count === 0}
                  className="group hover:text-primary inline-flex items-center gap-1 font-semibold text-slate-800 transition-colors"
                  onClick={() => {
                    if (doctor?.patients && doctor?.patients?.[0]?.count > 0)
                      router.push(ROUTES.report.viewPatients(doctor?.id || ''));
                  }}
                >
                  <span>{doctor?.patients?.[0]?.count ?? 0}</span>

                  {doctor?.patients && doctor?.patients?.[0]?.count > 0 && (
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </button>
              </TooltipTrigger>

              <TooltipContent>
                <p>View Patients</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
  ];
};
