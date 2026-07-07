'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getReferralColumns, STATUS_OPTIONS } from '../components/ReferralColumns';

import DeleteConfirmDialog from '@/@core/components/dialogs/DeleteConfirmDialog';
import { TableExportButton } from '@/@core/components/Table/tanstack-table/TableExportButton';
import { TableSearchHeader } from '@/@core/components/Table/tanstack-table/TableSearchHeader';
import { ITabOption, TableTabFilter } from '@/@core/components/Table/tanstack-table/TableTabFilter';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { createTableExportOptions } from '@/@core/utils/table-export';
import {
  getReferralsForExport,
  useDeleteReferral,
  useGetReferrals,
  useReferralRealtime,
  useUpdateReferralStatus,
} from '@/api/hooks/referral/hooks';
import { TReferral, TReferralStatus } from '@/api/hooks/referral/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';

const REFERRAL_STATUS_TABS: ITabOption[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Admitted', value: 'admitted' },
  { label: 'Discharged', value: 'discharged' },
  { label: 'Referral Sent', value: 'referralSent' },
];

export default function ReferralListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const { payload, handleSearch, handleChangePage, handleChangeRowsPerPage, setPayload } =
    useTableFilters({
      extraPayload: { status: '' },
    });

  const { data, isLoading } = useGetReferrals(payload);
  useReferralRealtime();
  const referrals = data?.data || [];
  const total = data?.total || 0;
  const { mutate: deleteReferral, isPending: isDeleting } = useDeleteReferral();

  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const [referralToUpdate, setReferralToUpdate] = useState<TReferral | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<TReferralStatus | null>(null);

  const { user } = useAuth();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateReferralStatus();

  const handleStatusChange = (referral: TReferral, status: TReferralStatus) => {
    setReferralToUpdate(referral);
    setConfirmStatus(status);
  };

  const confirmUpdate = () => {
    if (!confirmStatus || !referralToUpdate?.id || !user?._id) return;

    updateStatus(
      {
        id: referralToUpdate.id,
        status: confirmStatus,
        adminId: user._id,
        details: { previous_status: referralToUpdate?.status },
      },
      {
        onSuccess: () => {
          toast.success(`Referral ${confirmStatus} successfully`);
          setConfirmStatus(null);
          setReferralToUpdate(null);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update status');
          setConfirmStatus(null);
          setReferralToUpdate(null);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    setSelectedReferralId(id);
  };

  const resetDeleteDialog = (open: boolean) => {
    if (!open) {
      setSelectedReferralId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedReferralId) return;

    deleteReferral(selectedReferralId, {
      onSuccess: () => {
        toast.success('Referral deleted successfully');
        setSelectedReferralId(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete referral');
      },
    });
  };

  const onTabChange = (value: string) => {
    setPayload((prev) => ({
      ...prev,
      status: value,
      page: 1,
    }));
  };

  const activeStatus = (payload as { status: string }).status;
  const columns = getReferralColumns(
    router,
    handleDelete,
    {
      canEdit: hasPermission('referral', 'edit'),
      canDelete: hasPermission('referral', 'delete'),
      canView: hasPermission('referral', 'view'),
    },
    handleStatusChange,
  );
  const exportOptions = useMemo(
    () =>
      createTableExportOptions<TReferral, typeof payload>({
        fileName: 'Referral List',
        columns: [
          {
            header: 'Date(DD/MM/YYYY)',
            accessor: (referral: TReferral) =>
              new Date(referral.referral_date).toLocaleDateString(),
          },
          {
            header: 'Patient',
            accessor: (referral: TReferral) => referral.patient?.full_name || 'N/A',
          },
          {
            header: 'Referring Doctor',
            accessor: (referral: TReferral) => referral.doctor_a?.full_name || 'N/A',
          },
          {
            header: 'Referred Hospital / Dr.',
            accessor: (referral: TReferral) => referral.doctor_b?.full_name || 'N/A',
          },
          {
            header: 'Status',
            accessor: (referral: TReferral) => referral.status,
          },
        ],
        params: payload,
        fetchData: getReferralsForExport,
        formats: ['csv', 'pdf', 'xls'] as const,
      }),
    [payload],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 p-6 text-slate-900">
      <div className="mb-6 flex w-full max-w-full shrink-0 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Referrals</h1>
      </div>

      <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 py-4">
            <TableTabFilter
              tabs={REFERRAL_STATUS_TABS}
              value={activeStatus}
              onTabChange={onTabChange}
            />

            <div className="flex flex-wrap items-start gap-3">
              <TableSearchHeader
                filters={[]}
                onSearch={handleSearch}
                placeholder="Search referrals..."
                className="w-full py-0 md:w-auto"
              />
              <TableExportButton exportOptions={exportOptions} disabled={isLoading} />
            </div>
          </div>

          <div className="relative min-h-0 w-full min-w-0 flex-1">
            <TanstackTable
              data={referrals}
              columns={columns}
              page={payload.page}
              pageSize={payload.limit}
              total={total}
              onPageChange={handleChangePage}
              onPageSizeChange={handleChangeRowsPerPage}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!selectedReferralId}
        moduleName="referral"
        loading={isDeleting}
        onOpenChange={resetDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      <AlertDialog
        open={!!confirmStatus}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmStatus(null);
            setReferralToUpdate(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Referral Status</AlertDialogTitle>
            <AlertDialogDescription>
              Select the new status for this referral. This action will be recorded in the audit
              history.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Select
              value={confirmStatus || ''}
              onValueChange={(value) => setConfirmStatus(value as TReferralStatus)}
            >
              <SelectTrigger className="w-full capitalize">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUpdate}
              disabled={isUpdatingStatus || confirmStatus === referralToUpdate?.status}
              className={
                confirmStatus === 'discharged'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isUpdatingStatus ? 'Updating...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
