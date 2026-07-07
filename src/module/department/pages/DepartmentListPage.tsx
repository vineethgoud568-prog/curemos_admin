'use client';

import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getDepartmentColumns } from '../components/DepartmentColumns';

import DeleteConfirmDialog from '@/@core/components/dialogs/DeleteConfirmDialog';
import StatusConfirmDialog from '@/@core/components/dialogs/StatusConfirmDialog';
import { TableSearchHeader } from '@/@core/components/Table/tanstack-table/TableSearchHeader';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import {
  useChangeStatusDepartment,
  useDeleteDepartment,
  useGetDepartments,
  useUpdateDepartmentSequence,
} from '@/api/hooks/department/hook';
import { TDepartment } from '@/api/hooks/department/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function DepartmentListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const { payload, handleSearch, handleChangePage, handleChangeRowsPerPage } = useTableFilters({
    extraPayload: {},
  });

  const { data, isLoading } = useGetDepartments(payload);
  const total = data?.total || 0;

  const [orderedDepartments, setOrderedDepartments] = useState<TDepartment[]>([]);

  useEffect(() => {
    setOrderedDepartments(data?.data || []);
  }, [data?.data]);

  const { mutate: updateDepartmentSequence, isPending: isSavingSequence } =
    useUpdateDepartmentSequence();

  const { mutate: deleteDepartment, isPending: isDeleting } = useDeleteDepartment();

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [statusChange, setStatusChange] = useState<TDepartment | null>(null);

  const handleDelete = (id: string) => {
    setSelectedDepartmentId(id);
  };

  const resetDeleteDialog = (open: boolean) => {
    if (!open) {
      setSelectedDepartmentId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedDepartmentId) return;

    deleteDepartment(selectedDepartmentId, {
      onSuccess: () => {
        toast.success('Department deleted successfully');
        setSelectedDepartmentId(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete department');
      },
    });
  };

  const canAdd = hasPermission('department', 'add');
  const canEdit = hasPermission('department', 'edit');
  const canDelete = hasPermission('department', 'delete');
  const canView = hasPermission('department', 'view');

  const columns = getDepartmentColumns(
    handleDelete,
    router,
    (department) => setStatusChange(department),
    { canEdit, canDelete, canView },
    payload.page,
    payload.limit,
  );
  const { mutate: updateDepartment, isPending: isUpdating } = useChangeStatusDepartment();

  const confirmStatusChange = () => {
    if (!statusChange) return;
    const newStatus: TDepartment['status'] =
      statusChange.status === 'active' ? 'inactive' : 'active';
    updateDepartment(
      { id: statusChange.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Department marked as ${newStatus}`);
          setStatusChange(null);
        },
      },
    );
  };

  const handleRowReorder = (oldIndex: number, newIndex: number) => {
    const previousDepartments = orderedDepartments;
    const startSequence = (payload.page - 1) * payload.limit + 1;
    const reorderedDepartments = arrayMove(orderedDepartments, oldIndex, newIndex).map(
      (dept, index) => ({
        ...dept,
        sequence_no: startSequence + index,
      }),
    );

    setOrderedDepartments(reorderedDepartments);

    updateDepartmentSequence(
      {
        departments: reorderedDepartments.map(({ id, sequence_no }) => ({ id, sequence_no })),
      },
      {
        onSuccess: () => {
          toast.success('Department sequence updated successfully');
        },
        onError: (error) => {
          setOrderedDepartments(previousDepartments);
          toast.error(error.message || 'Failed to update department sequence');
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 p-6 text-slate-900">
      {/* Page Header - Fixed Height and Width-Bound */}
      <div className="mb-6 flex w-full max-w-full shrink-0 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Department List</h1>
        {canAdd ? (
          <Button
            className="bg-primary hover:bg-primary/90 h-10 gap-2 rounded-lg px-6 shadow-sm"
            onClick={() => router.push(ROUTES.department.add)}
          >
            <Plus size={18} /> Add Department
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
              placeholder="Search department..."
              className="w-full py-0 md:w-auto"
            />
          </div>

          {/* Table Container - Fills remaining space with Scroll Inside */}
          <div className="relative min-h-0 w-full min-w-0 flex-1">
            <TanstackTable
              data={orderedDepartments}
              columns={columns}
              page={payload.page}
              pageSize={payload.limit}
              total={total}
              onPageChange={handleChangePage}
              onPageSizeChange={handleChangeRowsPerPage}
              isLoading={isLoading}
              getRowId={(dept) => dept.id}
              enableRowDrag={!isLoading && !isSavingSequence && canEdit}
              onRowReorder={handleRowReorder}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!selectedDepartmentId}
        moduleName="department"
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
