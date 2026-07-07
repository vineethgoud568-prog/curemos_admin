'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import DeleteConfirmDialog from '@/@core/components/dialogs/DeleteConfirmDialog';
import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { TableExportButton } from '@/@core/components/Table/tanstack-table/TableExportButton';
import { TableSearchHeader } from '@/@core/components/Table/tanstack-table/TableSearchHeader';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { createTableExportOptions } from '@/@core/utils/table-export';
import { useGetDoctors } from '@/api/hooks/doctor/hooks';
import { getPatientsForExport, useDeletePatient, useGetPatients } from '@/api/hooks/patient/hooks';
import { TPatient } from '@/api/hooks/patient/schema';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';
import { getPatientColumns } from '@/module/patient/components/PatientColumns';

const DOCTOR_FILTER_PARAMS = {
  page: 1,
  limit: 1000,
  search: '',
  sortField: '',
  sortOrder: 'desc',
  status: '',
  role: 'doctor_a',
} as const;

export default function ViewPatients() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const params = useParams();
  const id = params?.id as string;

  const { payload, handleSearch, handleChangePage, handleChangeRowsPerPage, handleFilterChange } =
    useTableFilters({
      extraPayload: {
        doctor_a_id: id,
      },
    });

  const { data, isLoading } = useGetPatients(payload);
  const patients = data?.data || [];
  const total = data?.total || 0;
  const { data: doctorsData, isLoading: isDoctorFilterLoading } =
    useGetDoctors(DOCTOR_FILTER_PARAMS);
  const doctorOptions = doctorsData?.data || [];

  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setSelectedPatientId(id);
  };

  const resetDeleteDialog = (open: boolean) => {
    if (!open) {
      setSelectedPatientId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedPatientId) return;

    deletePatient(selectedPatientId, {
      onSuccess: () => {
        toast.success('Patient deleted successfully');
        setSelectedPatientId(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete patient');
      },
    });
  };

  const canAdd = hasPermission('patient', 'add');
  const canEdit = hasPermission('patient', 'edit');
  const canDelete = hasPermission('patient', 'delete');
  const canView = hasPermission('patient', 'view');

  const columns = getPatientColumns(
    handleDelete,
    router,
    {
      canEdit,
      canDelete,
      canView,
    },
    true,
  );
  const selectedDoctorId = (payload as { doctor_a_id?: string }).doctor_a_id || '';
  const exportOptions = useMemo(
    () =>
      createTableExportOptions<TPatient, typeof payload>({
        fileName: 'patient-list',
        columns: [
          {
            header: 'Patient Name',
            accessor: (patient: TPatient) => patient.full_name,
          },
          {
            header: 'Age',
            accessor: (patient: TPatient) => {
              const age = patient.age;
              return age !== null ? `${age} yrs` : 'N/A';
            },
          },
          {
            header: 'Phone',
            accessor: (patient: TPatient) => patient.phone || 'N/A',
          },
          {
            header: 'Email',
            accessor: (patient: TPatient) => patient.email || 'N/A',
          },
          {
            header: 'Linked Doctor',
            accessor: (patient: TPatient) => patient.doctor_a?.full_name || 'Unassigned',
          },
          {
            header: 'Doctor Email',
            accessor: (patient: TPatient) => patient.doctor_a?.email || 'Unassigned',
          },
        ],
        params: payload,
        fetchData: getPatientsForExport,
        formats: ['csv', 'pdf', 'xls'] as const,
      }),
    [payload],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 p-6 text-slate-900">
      {/* Page Header - Fixed Height and Width-Bound */}
      <div className="mb-6 flex w-full max-w-full shrink-0 items-center">
        <PageCardHeader
          title={`Dr. ${data?.data?.[0]?.doctor_a?.full_name ?? ''}`}
          backButton
          hideAddButton
        />
      </div>

      {/* Main Content Container - Enforces containment */}
      <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Search/Filter Section */}
          <div className="mb-4 flex w-full shrink-0 flex-wrap items-start gap-3">
            <TableSearchHeader
              filters={[]}
              onSearch={handleSearch}
              placeholder="Search Patients..."
              className="w-full py-0 md:w-auto"
            />
            <TableExportButton
              exportOptions={exportOptions}
              disabled={isLoading || isDoctorFilterLoading}
            />
          </div>

          {/* Table Container - Fills remaining space with Scroll Inside */}
          <div className="relative min-h-0 w-full min-w-0 flex-1">
            <TanstackTable
              data={patients}
              columns={columns}
              page={payload.page}
              pageSize={payload.limit}
              total={total}
              onPageChange={handleChangePage}
              onPageSizeChange={handleChangeRowsPerPage}
              isLoading={isLoading || isDoctorFilterLoading}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!selectedPatientId}
        moduleName="patient"
        loading={isDeleting}
        onOpenChange={resetDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
