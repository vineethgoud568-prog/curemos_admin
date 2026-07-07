'use client';

import { arrayMove } from '@dnd-kit/sortable';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getDoctorSeqColumns } from '../components/DoctorSeqColumns';

import DeleteConfirmDialog from '@/@core/components/dialogs/DeleteConfirmDialog';
import StatusConfirmDialog from '@/@core/components/dialogs/StatusConfirmDialog';
import { TableSearchHeader } from '@/@core/components/Table/tanstack-table/TableSearchHeader';
import { ITabOption, TableTabFilter } from '@/@core/components/Table/tanstack-table/TableTabFilter';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import {
  useDeleteDoctor,
  useGetDoctorsByDepartment,
  useUpdateDoctorSequence,
  useUpdateDoctorStatus,
} from '@/api/hooks/doctor/hooks';
import { TDoctor, TDoctorRole } from '@/api/hooks/doctor/schema';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';

const DOCTOR_TYPE_TABS: ITabOption[] = [
  { label: 'Doctors', value: 'doctor_a' },
  { label: 'Curemos Doctors', value: 'doctor_b' },
];

export default function DetailsListPage({ departmentId }: { departmentId: string }) {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const { payload, handleSearch, handleChangePage, handleChangeRowsPerPage, setPayload } =
    useTableFilters({
      extraPayload: { role: 'doctor_a' as string },
    });

  const { data, isLoading } = useGetDoctorsByDepartment(departmentId, payload);
  const doctors = data?.data || [];
  const total = data?.total || 0;

  const { mutate: deleteDoctor, isPending: isDeleting } = useDeleteDoctor();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateDoctorStatus();
  const { mutate: updateDoctorSequence, isPending: isSavingSequence } = useUpdateDoctorSequence();

  const [orderedDoctors, setOrderedDoctors] = useState<TDoctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctorToChangeStatus, setDoctorToChangeStatus] = useState<TDoctor | null>(null);

  useEffect(() => {
    setOrderedDoctors(data?.data || []);
  }, [data?.data]);

  const handleDelete = (id: string) => {
    setSelectedDoctorId(id);
  };

  const handleStatusChange = (doctor: TDoctor) => {
    setDoctorToChangeStatus(doctor);
  };

  const resetDeleteDialog = (open: boolean) => {
    if (!open) {
      setSelectedDoctorId(null);
    }
  };

  const resetStatusDialog = (open: boolean) => {
    if (!open) {
      setDoctorToChangeStatus(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedDoctorId) return;

    deleteDoctor(selectedDoctorId, {
      onSuccess: () => {
        toast.success('Doctor deleted successfully');
        setSelectedDoctorId(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete doctor');
      },
    });
  };

  const handleConfirmStatusChange = () => {
    if (!doctorToChangeStatus) return;

    const newStatus = doctorToChangeStatus.status === 'active' ? 'inactive' : 'active';

    updateStatus(
      {
        id: doctorToChangeStatus.id,
        status: newStatus,
        email: doctorToChangeStatus.email ?? '',
        full_name: doctorToChangeStatus.full_name ?? '',
      },
      {
        onSuccess: () => {
          toast.success('Status updated successfully');
          setDoctorToChangeStatus(null);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update status');
        },
      },
    );
  };

  const onTabChange = (value: string) => {
    setPayload((prev) => ({
      ...prev,
      role: value,
      page: 1,
    }));
  };

  const handleRowReorder = (oldIndex: number, newIndex: number) => {
    const previousDoctors = orderedDoctors;
    const startSequence = (payload.page - 1) * payload.limit + 1;
    const reorderedDoctors = arrayMove(orderedDoctors, oldIndex, newIndex).map((doctor, index) => ({
      ...doctor,
      sequence_no: startSequence + index,
    }));

    setOrderedDoctors(reorderedDoctors);

    updateDoctorSequence(
      {
        departmentId,
        doctors: reorderedDoctors.map(({ id, sequence_no }) => ({ id, sequence_no })),
      },
      {
        onSuccess: () => {
          toast.success('Doctor sequence updated successfully');
        },
        onError: (error) => {
          setOrderedDoctors(previousDoctors);
          toast.error(error.message || 'Failed to update doctor sequence');
        },
      },
    );
  };

  const activeRole = (payload as { role: TDoctorRole }).role;
  const columns = getDoctorSeqColumns(handleDelete, handleStatusChange, router, activeRole, {
    canEdit: hasPermission('doctor', 'edit'),
    canDelete: hasPermission('doctor', 'delete'),
    canView: hasPermission('doctor', 'view'),
  });

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 p-6 text-slate-900">
      {/* Page Header - Fixed Height and Width-Bound */}
      <div className="mb-6 flex w-full max-w-full shrink-0 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Doctor List</h1>
        {/* <Button
          className="bg-primary hover:bg-primary/90 h-10 gap-2 rounded-lg px-6 shadow-sm"
          onClick={() => router.push(ROUTES.doctor.add)}
        >
          <Plus size={18} /> Add Doctor
        </Button> */}
      </div>

      {/* 
        Main Content Container - Enforces containment 
        min-w-0 is mandatory here to prevent child expansion beyond viewport.
      */}
      <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Filter Bar: Tabs + Search */}
          <div className="flex flex-col items-start justify-between gap-4 py-4 md:flex-row md:items-center">
            <TableTabFilter tabs={DOCTOR_TYPE_TABS} value={activeRole} onTabChange={onTabChange} />

            <TableSearchHeader
              filters={[]}
              onSearch={handleSearch}
              placeholder="Search by name and email..."
              className="w-full py-0 md:w-auto"
            />
          </div>

          {/* Table Container - Fills remaining space and HANDLES horizontal scroll inside */}
          <div className="relative min-h-0 w-full min-w-0 flex-1">
            <TanstackTable
              data={orderedDoctors}
              columns={columns}
              page={payload.page}
              pageSize={payload.limit}
              total={total}
              onPageChange={handleChangePage}
              onPageSizeChange={handleChangeRowsPerPage}
              isLoading={isLoading}
              getRowId={(doctor) => doctor.id}
              enableRowDrag={!isLoading && !isSavingSequence}
              onRowReorder={handleRowReorder}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!selectedDoctorId}
        moduleName="doctor"
        loading={isDeleting}
        onOpenChange={resetDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
      <StatusConfirmDialog
        open={!!doctorToChangeStatus}
        loading={isUpdatingStatus}
        onOpenChange={resetStatusDialog}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
