'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getSubAdminColumns } from '../components/SubAdminColumns';

import DeleteConfirmDialog from '@/@core/components/dialogs/DeleteConfirmDialog';
import StatusConfirmDialog from '@/@core/components/dialogs/StatusConfirmDialog';
import { TableSearchHeader } from '@/@core/components/Table/tanstack-table/TableSearchHeader';
import { ITabOption } from '@/@core/components/Table/tanstack-table/TableTabFilter';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { createTableExportOptions } from '@/@core/utils/table-export';
import {
  getSubadminsForExport,
  useChangeStatusSubadmin,
  useDeleteSubadmin,
  useGetSubadmins,
} from '@/api/hooks/subadmin/hooks';
import { TSubadmin } from '@/api/hooks/subadmin/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';
import { ROUTES } from '@/navigation/sidebar/routes';

const REPORT_TYPE_TABS: ITabOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Archive', value: 'true' },
];

const TIME_FILTER: ITabOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
];

export default function SubAdminListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const { payload, handleSearch, handleChangePage, handleChangeRowsPerPage } = useTableFilters({
    extraPayload: {},
  });
  const [statusChange, setStatusChange] = useState<TSubadmin | null>(null);

  const { data, isLoading } = useGetSubadmins(payload);
  const subadmins = data?.data || [];
  const total = data?.total || 0;

  const { mutate: deleteSubadmin, isPending: isDeleting } = useDeleteSubadmin();

  const [selectedSubadminId, setSelectedSubadminId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setSelectedSubadminId(id);
  };

  const resetDeleteDialog = (open: boolean) => {
    if (!open) {
      setSelectedSubadminId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedSubadminId) return;

    deleteSubadmin(selectedSubadminId, {
      onSuccess: () => {
        toast.success('Subadmin deleted successfully');
        setSelectedSubadminId(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete subadmin');
      },
    });
  };

  const canAdd = hasPermission('subadmin', 'add');
  const canEdit = hasPermission('subadmin', 'edit');
  const canDelete = hasPermission('subadmin', 'delete');
  const canView = hasPermission('subadmin', 'view');

  const columns = getSubAdminColumns({
    onDelete: handleDelete,
    router,
    onStatusChange: (subadmin) => setStatusChange(subadmin),
    actionPermissions: { canEdit, canDelete, canView },
  });
  const exportOptions = useMemo(
    () =>
      createTableExportOptions<TSubadmin, typeof payload>({
        fileName: 'subadmin-list',
        columns: [
          {
            header: 'Full name',
            accessor: (subadmin: TSubadmin) => subadmin.full_name || 'N/A',
          },
          {
            header: 'Email',
            accessor: (subadmin: TSubadmin) => subadmin.email || 'N/A',
          },
          {
            header: 'Date',
            accessor: (subadmin: TSubadmin) =>
              subadmin.created_at
                ? new Date(subadmin.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
                : 'N/A',
          },
          {
            header: 'Status',
            accessor: (subadmin: TSubadmin) =>
              subadmin.status === 'active' ? 'Active' : 'Inactive',
          },
        ],
        params: payload,
        fetchData: getSubadminsForExport,
        formats: ['csv', 'pdf', 'xls', 'xlsx'] as const,
      }),
    [payload],
  );

  const { mutate: chgStatus, isPending: isUpdatingSubadmin } = useChangeStatusSubadmin();

  const confirmStatusChange = () => {
    if (!statusChange) return;
    const newStatus: TSubadmin['status'] = statusChange.status === 'active' ? 'inactive' : 'active';
    chgStatus(
      { id: statusChange.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Subadmin marked as ${newStatus}`);
          setStatusChange(null);
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 p-6 text-slate-900">
      {/* Page Header - Fixed Height and Width-Bound */}
      <div className="mb-6 flex w-full max-w-full shrink-0 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subadmin List</h1>
        {canAdd ? (
          <Button
            className="bg-primary hover:bg-primary/90 h-10 gap-2 rounded-lg px-6 shadow-sm"
            onClick={() => router.push(ROUTES.subadmin.add)}
          >
            <Plus size={18} /> Add Subadmin
          </Button>
        ) : null}
      </div>

      {/* Main Content Container - Enforces containment */}
      <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Search/Filter Section */}
          <div className="flex flex-col items-start justify-between gap-4 py-4 md:flex-row md:items-center">
            <TableSearchHeader
              filters={[]}
              onSearch={handleSearch}
              placeholder="Search subadmins..."
              className="w-full items-start py-0 md:w-auto"
            />
            {/* <TableExportButton exportOptions={exportOptions} disabled={isLoading} /> */}
          </div>

          {/* Table Container - Fills remaining space with Scroll Inside */}
          <div className="relative min-h-0 w-full min-w-0 flex-1">
            <TanstackTable
              data={subadmins}
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
        open={!!selectedSubadminId}
        moduleName="subadmin"
        loading={isDeleting}
        onOpenChange={resetDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      <StatusConfirmDialog
        open={!!statusChange}
        onOpenChange={(open) => !open && setStatusChange(null)}
        onConfirm={confirmStatusChange}
        loading={isUpdatingSubadmin}
      />
    </div>
  );
}
