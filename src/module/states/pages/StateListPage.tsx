'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { getStateColumns } from '../components/StateColumns';

import DeleteConfirmDialog from '@/@core/components/dialogs/DeleteConfirmDialog';
import StatusConfirmDialog from '@/@core/components/dialogs/StatusConfirmDialog';
import { TableSearchHeader } from '@/@core/components/Table/tanstack-table/TableSearchHeader';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { useChangeStatusState, useDeleteState, useGetStates } from '@/api/hooks/state/hook';
import { TState } from '@/api/hooks/state/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function StateListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const { payload, handleSearch, handleChangePage, handleChangeRowsPerPage } = useTableFilters({
    extraPayload: {},
  });

  const { data, isLoading } = useGetStates(payload);
  const state = data?.data || [];
  const total = data?.total || 0;

  const { mutate: deleteState, isPending: isDeleting } = useDeleteState();

  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [statusChange, setStatusChange] = useState<TState | null>(null);

  const handleDelete = (id: string) => {
    setSelectedStateId(id);
  };

  const resetDeleteDialog = (open: boolean) => {
    if (!open) {
      setSelectedStateId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedStateId) return;

    deleteState(selectedStateId, {
      onSuccess: () => {
        toast.success('State deleted successfully');
        setSelectedStateId(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete state');
      },
    });
  };

  const canAdd = hasPermission('state', 'add');
  const canEdit = hasPermission('state', 'edit');
  const canDelete = hasPermission('state', 'delete');
  const canView = hasPermission('state', 'view');

  const columns = getStateColumns(handleDelete, router, (state) => setStatusChange(state), {
    canEdit,
    canDelete,
    canView,
  });
  const { mutate: updateState, isPending: isUpdating } = useChangeStatusState();

  const confirmStatusChange = () => {
    if (!statusChange) return;
    const newStatus = statusChange.status === 'active' ? 'inactive' : 'active';
    updateState(
      { id: statusChange.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`State marked as ${newStatus}`);
          setStatusChange(null);
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 p-6 text-slate-900">
      {/* Page Header - Fixed Height and Width-Bound */}
      <div className="mb-6 flex w-full max-w-full shrink-0 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Medical Council State List</h1>
        {canAdd ? (
          <Button
            className="bg-primary hover:bg-primary/90 h-10 gap-2 rounded-lg px-6 shadow-sm"
            onClick={() => router.push(ROUTES.state.add)}
          >
            <Plus size={18} /> Add State
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
              placeholder="Search state..."
              className="w-full py-0 md:w-auto"
            />
          </div>

          {/* Table Container - Fills remaining space with Scroll Inside */}
          <div className="relative min-h-0 w-full min-w-0 flex-1">
            <TanstackTable
              data={state}
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
        open={!!selectedStateId}
        moduleName="state"
        loading={isDeleting}
        onOpenChange={resetDeleteDialog}
        onConfirm={handleConfirmDelete}
      />

      <StatusConfirmDialog
        open={!!statusChange}
        onOpenChange={(open) => !open && setStatusChange(null)}
        onConfirm={confirmStatusChange}
        loading={isUpdating}
      />
    </div>
  );
}
