'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getDoctorColumns } from '../components/DoctorColumns';

import DeleteConfirmDialog from '@/@core/components/dialogs/DeleteConfirmDialog';
import StatusConfirmDialog from '@/@core/components/dialogs/StatusConfirmDialog';
import { TableExportButton } from '@/@core/components/Table/tanstack-table/TableExportButton';
import { TableSearchHeader } from '@/@core/components/Table/tanstack-table/TableSearchHeader';
import { ITabOption, TableTabFilter } from '@/@core/components/Table/tanstack-table/TableTabFilter';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { createTableExportOptions } from '@/@core/utils/table-export';
import { useGetAllDepartment } from '@/api/hooks/department/hook';
import {
  getDoctorsForExport,
  useDeleteDoctor,
  useDoctorFilterDistrict,
  useDoctorFilterPracticeState,
  useDoctorRealtime,
  useGetAllMedicalCouncils,
  useGetDoctors,
  useUpdateDoctorStatus,
} from '@/api/hooks/doctor/hooks';
import { TDoctor, TDoctorRole } from '@/api/hooks/doctor/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';
import { cn, convertMinutes } from '@/lib/utils';
import { ROUTES } from '@/navigation/sidebar/routes';

const DOCTOR_TYPE_TABS: ITabOption[] = [
  { label: 'Doctors', value: 'doctor_a' },
  { label: 'Curemos Doctors', value: 'doctor_b' },
];

export default function DoctorListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const { payload, handleSearch, handleChangePage, handleChangeRowsPerPage, setPayload } =
    useTableFilters({
      extraPayload: {
        role: 'doctor_a' as string,
        state_medical_council: 'all' as string,
        state: 'all' as string,
        district: 'all' as string,
        dept: 'all' as string,
        status: 'all' as string,
      },
    });

  const { data: medCouncilStates, isLoading: isMedStatesLoading } =
    useGetAllMedicalCouncils('active');
  const { data: practiceStates, isLoading: isPracticeStatesLoading } =
    useDoctorFilterPracticeState();
  const { data: practiceDistricts, isLoading: isPracticeDistrictsLoading } =
    useDoctorFilterDistrict(payload.state as string);
  const { data: departmentNames, isLoading: isDepartmentLoading } = useGetAllDepartment();

  const { data, isLoading } = useGetDoctors(payload);
  useDoctorRealtime();
  const doctors = data?.data || [];
  const total = data?.total || 0;

  const { mutate: deleteDoctor, isPending: isDeleting } = useDeleteDoctor();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateDoctorStatus();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctorToChangeStatus, setDoctorToChangeStatus] = useState<TDoctor | null>(null);

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
      state: 'all',
      district: 'all',
      dept: 'all',
      state_medical_council: 'all',
      status: 'all',
      page: 1,
    }));
  };

  const canAdd = hasPermission('doctor', 'add');
  const canEdit = hasPermission('doctor', 'edit');
  const canDelete = hasPermission('doctor', 'delete');
  const canView = hasPermission('doctor', 'view');

  const activeRole = (payload as { role: TDoctorRole }).role;
  const columns = getDoctorColumns(handleDelete, handleStatusChange, router, activeRole, {
    canEdit,
    canDelete,
    canView,
  });
  const isGeneralPractitioner = activeRole === 'doctor_a';
  const exportOptions = useMemo(
    () =>
      createTableExportOptions<TDoctor, typeof payload>({
        fileName: 'doctor-list',
        columns: [
          {
            header: 'Doctor ID',
            accessor: (doctor: TDoctor) => `#${doctor.id.slice(0, 8)}`,
          },
          {
            header: 'Doctor Name',
            accessor: (doctor: TDoctor) => doctor.full_name || 'N/A',
          },
          {
            header: 'Email Address',
            accessor: (doctor: TDoctor) => doctor.email || 'N/A',
          },
          {
            header: 'Phone Number',
            accessor: (doctor: TDoctor) => doctor.phone || 'N/A',
          },
          {
            header: 'Location',
            accessor: (doctor: TDoctor) => doctor.location || 'N/A',
          },
          {
            header: 'State',
            accessor: (doctor: TDoctor) => doctor.state || 'N/A',
          },
          {
            header: 'District',
            accessor: (doctor: TDoctor) => doctor.district || 'N/A',
          },
          {
            header: 'Medical Council State',
            accessor: (doctor: TDoctor) => doctor.state_medical_council || 'N/A',
          },
          {
            header: 'Date of Joining',
            accessor: (doctor: TDoctor) =>
              doctor.created_at
                ? new Date(doctor.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
                : 'N/A',
          },
          {
            header: 'Total Consultations',
            accessor: (doctor: TDoctor) => doctor.total_consultations ?? 0,
          },
          {
            header: 'Live Consultations',
            accessor: (doctor: TDoctor) => doctor.live_consultations ?? 0,
          },
          {
            header: 'Scheduled Consultations',
            accessor: (doctor: TDoctor) => doctor.scheduled_consultations ?? 0,
          },
          {
            header: 'Completed Consultations',
            accessor: (doctor: TDoctor) => doctor.completed_consultations ?? 0,
          },
          {
            header: 'Cancelled Scheduled Calls',
            accessor: (doctor: TDoctor) => doctor.cancelled_scheduled_calls ?? 0,
          },
          ...(isGeneralPractitioner
            ? [
              {
                header: 'No. of Referrals By (by GP)',
                accessor: (doctor: TDoctor) => doctor.no_of_referrals ?? 0,
              },
            ]
            : [
              {
                header: 'Not Responded Calls',
                accessor: (doctor: TDoctor) => doctor.not_responded_calls ?? 0,
              },
            ]),
          {
            header: 'No. of Patient Turned Around',
            accessor: (doctor: TDoctor) => doctor.no_of_patient_turned_around ?? 0,
          },
          {
            header: 'No. of Patient Not Turned Around',
            accessor: (doctor: TDoctor) => doctor.no_of_patient_not_turned_around ?? 0,
          },
          {
            header: 'Avg Consultation Duration',
            accessor: (doctor: TDoctor) => convertMinutes(doctor.avg_consultation_duration ?? 0),
          },
          {
            header: 'Referral Conversion Rate (%)',
            accessor: (doctor: TDoctor) => `${doctor.referral_conversion_rate ?? 0}%`,
          },
          {
            header: 'Status - Account',
            accessor: (doctor: TDoctor) => (doctor.status === 'active' ? 'Active' : 'Inactive'),
          },
        ],
        params: payload,
        fetchData: getDoctorsForExport,
        formats: ['csv', 'pdf', 'xls', 'xlsx'] as const,
      }),
    [isGeneralPractitioner, payload],
  );

  const handleStateFilterChange = (value: string) => {
    setPayload((prev) => ({
      ...prev,
      state: value,
      page: 1,
    }));
  };

  const handleDeptFilterChange = (value: string) => {
    setPayload((prev) => ({
      ...prev,
      dept: value,
      page: 1,
    }));
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 p-6 text-slate-900">
      {/* Page Header - Fixed Height and Width-Bound */}
      <div className="mb-6 flex w-full max-w-full shrink-0 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Doctor List</h1>
        {canAdd ? (
          <Button
            className="bg-primary hover:bg-primary/90 h-10 gap-2 rounded-lg px-6 shadow-sm"
            onClick={() => router.push(ROUTES.doctor.add)}
          >
            <Plus size={18} /> Add Doctor
          </Button>
        ) : null}
      </div>

      {/* 
        Main Content Container - Enforces containment 
        min-w-0 is mandatory here to prevent child expansion beyond viewport.
      */}
      <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
          {/* Filter Bar: Tabs + Search */}
          <TableTabFilter
            tabs={DOCTOR_TYPE_TABS}
            value={activeRole}
            onTabChange={onTabChange}
            className="w-fit"
          />
          <div className="mb-2 flex flex-wrap items-end justify-start gap-3">
            {/* Verification Status Custom Eye-Catching Filter */}
            <div className="w-full space-y-1 md:w-auto">
              <p className="mb-1 block text-[14px]">Verification Status</p>
              <div className="flex h-[40px] items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-1">
                <button
                  type="button"
                  onClick={() => setPayload((prev) => ({ ...prev, status: 'all', page: 1 }))}
                  className={cn(
                    'flex h-full items-center gap-1.5 rounded-md px-3.5 text-xs font-semibold transition-all duration-200',
                    !payload.status || payload.status === 'all'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/30',
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setPayload((prev) => ({ ...prev, status: 'active', page: 1 }))}
                  className={cn(
                    'flex h-full items-center gap-1.5 rounded-md px-3.5 text-xs font-semibold transition-all duration-200',
                    payload.status === 'active'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/30',
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full transition-all duration-200',
                      payload.status === 'active' ? 'bg-white animate-pulse' : 'bg-emerald-500',
                    )}
                  />
                  Verified
                </button>
                <button
                  type="button"
                  onClick={() => setPayload((prev) => ({ ...prev, status: 'inactive', page: 1 }))}
                  className={cn(
                    'flex h-full items-center gap-1.5 rounded-md px-3.5 text-xs font-semibold transition-all duration-200',
                    payload.status === 'inactive'
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/30',
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full transition-all duration-200',
                      payload.status === 'inactive' ? 'bg-white animate-pulse' : 'bg-rose-500',
                    )}
                  />
                  Not Verified
                </button>
              </div>
            </div>

            <div className="w-full space-y-1 md:w-auto">
              <p className="mb-1 block text-[14px]">Filter State</p>

              <select
                value={(payload.state as string) || 'all'}
                onChange={(e) =>
                  setPayload({ ...payload, state: e.target.value, district: 'all', page: 1 })
                }
                className="max-h-[40px] w-fit min-w-[120px] rounded-md border px-3 py-2"
              >
                <option value="all">All States</option>
                {isPracticeStatesLoading ? (
                  <option value="loading" disabled>
                    Loading...
                  </option>
                ) : (
                  practiceStates?.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="w-full space-y-1 md:w-auto">
              <p className="mb-1 block text-[14px]">Filter District</p>

              <select
                value={(payload.district as string) || 'all'}
                onChange={(e) => setPayload({ ...payload, district: e.target.value, page: 1 })}
                disabled={!payload.state || payload.state === 'all'}
                className="max-h-[40px] w-fit min-w-[120px] rounded-md border px-3 py-2 disabled:opacity-50"
              >
                <option value="all">All Districts</option>
                {isPracticeDistrictsLoading ? (
                  <option value="loading" disabled>
                    Loading...
                  </option>
                ) : (
                  practiceDistricts?.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="w-full space-y-1 md:w-auto">
              <p className="mb-1 block text-[14px]">Filter Dept.</p>

              <select
                value={(payload.dept as string) || 'all'}
                onChange={(e) => {
                  handleDeptFilterChange(e.target.value);
                }}
                className="max-h-[40px] w-fit min-w-[120px] rounded-md border px-3 py-2"
              >
                <option value="all">All</option>
                {isDepartmentLoading ? (
                  <option value="loading" disabled>
                    Loading...
                  </option>
                ) : departmentNames && departmentNames.length > 0 ? (
                  departmentNames.map((department) => (
                    <option key={department.id} value={department.name}>
                      {department.name}
                    </option>
                  ))
                ) : (
                  <option value="no-dept" disabled>
                    No department found
                  </option>
                )}
              </select>
            </div>
            <div className="w-full space-y-1 md:w-auto">
              <p className="mb-1 block text-[14px]">Filter Med. Council State</p>

              <select
                value={(payload.state_medical_council as string) || 'all'}
                onChange={(e) => setPayload({ ...payload, state_medical_council: e.target.value })}
                className="max-h-[40px] w-fit min-w-[220px] rounded-md border px-3 py-2"
              >
                <option value="all">All States</option>
                {isMedStatesLoading ? (
                  <option value="loading" disabled>
                    Loading...
                  </option>
                ) : (
                  medCouncilStates?.map((council) => (
                    <option key={council.id} value={council.name}>
                      {council.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <TableSearchHeader
              filters={[]}
              onSearch={handleSearch}
              placeholder="Search by keyword..."
              className="w-full py-0 md:w-auto"
            />
            <TableExportButton
              exportOptions={exportOptions}
              disabled={isLoading || isDepartmentLoading}
            />
          </div>

          {/* Table Container - Fills remaining space and HANDLES horizontal scroll inside */}
          <div className="relative min-h-0 w-full min-w-0 flex-1">
            <TanstackTable
              data={doctors}
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
