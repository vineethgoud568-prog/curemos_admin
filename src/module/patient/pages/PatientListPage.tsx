'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getPatientColumns } from '../components/PatientColumns';

import DeleteConfirmDialog from '@/@core/components/dialogs/DeleteConfirmDialog';
import { TableExportButton } from '@/@core/components/Table/tanstack-table/TableExportButton';
import { TableSearchHeader } from '@/@core/components/Table/tanstack-table/TableSearchHeader';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { createTableExportOptions } from '@/@core/utils/table-export';
import { useGetDoctors } from '@/api/hooks/doctor/hooks';
import {
  getPatientsForExport,
  useDeletePatient,
  useGetPatients,
  usePatientRealtime,
} from '@/api/hooks/patient/hooks';
import { TPatient } from '@/api/hooks/patient/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';
import { ROUTES } from '@/navigation/sidebar/routes';

const DOCTOR_FILTER_ALL = 'all-doctors';
const DOCTOR_FILTER_PARAMS = {
  page: 1,
  limit: 1000,
  search: '',
  sortField: '',
  sortOrder: 'desc',
  status: '',
} as const;

export default function PatientListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const { payload, handleSearch, handleChangePage, handleChangeRowsPerPage, handleFilterChange } =
    useTableFilters({
      extraPayload: {
        doctor_a_id: '',
      },
    });

  const { data, isLoading } = useGetPatients(payload);
  usePatientRealtime();
  const patients = data?.data || [];
  const total = data?.total || 0;
  const { data: doctorsData, isLoading: isDoctorFilterLoading } =
    useGetDoctors(DOCTOR_FILTER_PARAMS);
  const doctorOptions = doctorsData?.data || [];

  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_seen_patient_time', new Date().toISOString());
      queryClient.invalidateQueries({ queryKey: ['PatientCount'] });
    }
  }, [patients, queryClient]);

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

  const columns = getPatientColumns(handleDelete, router, {
    canEdit,
    canDelete,
    canView,
  });
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
      <div className="mb-6 flex w-full max-w-full shrink-0 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Patient List</h1>
        {canAdd ? (
          <Button
            className="bg-primary hover:bg-primary/90 h-10 gap-2 rounded-lg px-6 shadow-sm"
            onClick={() => router.push(ROUTES.patient.add)}
          >
            <Plus size={18} /> Add Patient
          </Button>
        ) : null}
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
            <Select
              value={selectedDoctorId || DOCTOR_FILTER_ALL}
              onValueChange={(value) =>
                handleFilterChange('doctor_a_id', value === DOCTOR_FILTER_ALL ? '' : value)
              }
            >
              <SelectTrigger className="h-10 w-full min-w-[220px] bg-white shadow-sm md:w-[260px]">
                <SelectValue placeholder="Filter by doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DOCTOR_FILTER_ALL}>All Doctors</SelectItem>
                {doctorOptions
                  .filter((doctor) => doctor.isVerified)
                  .map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.full_name || doctor.email || 'Unnamed Doctor'}
                      {doctor?.department && doctor.department.name
                        ? ` - ${doctor.department.name}`
                        : ' - No Department'}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
