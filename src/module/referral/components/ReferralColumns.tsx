import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'sonner';

import ReferralStatusBadge from './ReferralStatusBadge';

import { TableActions } from '@/@core/components/Table/tanstack-table/TableActions';
import { ReferralQueryEnum } from '@/api/hooks/referral/key';
import { TReferral, TReferralStatus } from '@/api/hooks/referral/schema';
import { useGetSubadmins } from '@/api/hooks/subadmin/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/navigation/sidebar/routes';
import { TModuleActionPermissions } from '@/types/common/common.schema';
import { createClient } from '@/utils/supabase/client';

export const STATUS_OPTIONS: TReferralStatus[] = [
  'pending',
  'admitted',
  'discharged',
  'referralSent',
];

const AssignedPersonCell = ({
  referral,
  canEdit,
}: {
  referral: TReferral;
  canEdit: boolean;
}) => {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { data: subadminsData } = useGetSubadmins({ page: 1, limit: 100 });
  const subadmins = subadminsData?.data || [];

  const updateAssignedPerson = useMutation({
    mutationFn: async (subadminId: string | null) => {
      const { error } = await supabase
        .from('referrals')
        .update({ assigned_subadmin_id: subadminId, updated_at: new Date().toISOString() })
        .eq('id', referral.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Assigned sub admin updated successfully');
      queryClient.invalidateQueries({ queryKey: [ReferralQueryEnum.ReferralAll] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update assigned sub admin');
    },
  });

  const assignedPerson = referral.assigned_person;

  if (!canEdit || !!referral.assigned_subadmin_id) {
    return (
      <div className="flex flex-col">
        <span className="font-medium text-slate-900 capitalize">
          {assignedPerson?.full_name || '—'}
        </span>
        {assignedPerson?.email && (
          <span className="text-xs text-slate-500">{assignedPerson.email}</span>
        )}
      </div>
    );
  }

  return (
    <div className="w-[180px]">
      <Select
        value={referral.assigned_subadmin_id || 'none'}
        onValueChange={(val) => {
          updateAssignedPerson.mutate(val === 'none' ? null : val);
        }}
        disabled={updateAssignedPerson.isPending}
      >
        <SelectTrigger className="w-full capitalize h-9 text-xs">
          <SelectValue placeholder="Select Sub Admin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Unassigned</SelectItem>
          {subadmins.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const getReferralColumns = (
  router: AppRouterInstance,
  onDelete: (id: string) => void,
  actionPermissions: TModuleActionPermissions,
  onStatusChange: (referral: TReferral, status: TReferralStatus) => void,
): ColumnDef<TReferral>[] => {
  const { canDelete, canView, canEdit } = actionPermissions;

  const columns: ColumnDef<TReferral>[] = [
    {
      accessorKey: 'referral_date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {new Date(row.original.referral_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Patient',
      cell: ({ row }) => {
        const patient = row.original.patient;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 capitalize">
              {patient?.full_name || 'N/A'}
            </span>
            <span className="text-xs text-slate-500">{patient?.email || 'No email'}</span>
          </div>
        );
      },
    },
    {
      header: 'Referring Doctor',
      cell: ({ row }) => {
        const doctor = row.original.doctor_a;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 capitalize">
              {doctor?.full_name || 'N/A'}
            </span>
            <span className="text-xs text-slate-500 capitalize">
              {doctor?.specialization || 'General'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Referred Hospital / Dr.',
      cell: ({ row }) => {
        const doctor = row.original.doctor_b;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 capitalize">
              {doctor?.full_name || 'N/A'}
            </span>
            <span className="text-xs text-slate-500 capitalize italic">
              {doctor?.hospital_affiliation || 'No hospital info'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'assigned_person',
      header: 'Assigned Person for Patient',
      cell: ({ row }) => <AssignedPersonCell referral={row.original} canEdit={canEdit} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const currentStatus = row.original.status;

        if (!canEdit) {
          return <ReferralStatusBadge status={currentStatus} />;
        }

        return (
          <button
            onClick={() => onStatusChange(row.original, currentStatus)}
            className="inline-flex cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <ReferralStatusBadge status={currentStatus} />
          </button>
        );
      },
    },
  ];

  if (canDelete || canView) {
    columns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const referral = row.original;

        return (
          <TableActions
            onView={canView ? () => router.push(ROUTES.referral.view(referral.id)) : undefined}
            onDelete={canDelete ? () => onDelete(referral.id) : undefined}
          />
        );
      },
    });
  }

  return columns;
};
