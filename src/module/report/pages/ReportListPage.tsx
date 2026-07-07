'use client';

import { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { getConsultationsColumns } from '../components/ConsultationColumns';
import { GetPatientColumns } from '../components/PatientColumns';
import ReportStats from '../components/ReportStats';

import { TableExportButton } from '@/@core/components/Table/tanstack-table/TableExportButton';
import { TableSearchHeader } from '@/@core/components/Table/tanstack-table/TableSearchHeader';
import { ITabOption, TableTabFilter } from '@/@core/components/Table/tanstack-table/TableTabFilter';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { createTableExportOptions } from '@/@core/utils/table-export';
import { useGetAllDepartment } from '@/api/hooks/department/hook';
import { useDoctorFilterDistrict, useDoctorFilterPracticeState } from '@/api/hooks/doctor/hooks';
import {
  getReportsForExport,
  useGetConsultationsReports,
  useGetPatientsReports,
} from '@/api/hooks/report/hooks';
import { Card, CardContent } from '@/components/ui/card';
import CustomDateRangesPicker from '@/components/ui/CustomDateRangeSelector';
import useTableFilters from '@/hooks/useTableFilter';
import { convertMinutes } from '@/lib/utils';

const REPORT_TYPE_TABS: ITabOption[] = [
  { label: 'Consultation Report', value: 'consultation' },
  { label: 'Patient Report', value: 'patient' },
];

const TIME_FILTER: ITabOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'week' },
  { label: 'Monthly', value: 'month' },
];

const formatSpecializations = (row: {
  specialization?: string | null;
  specializations?: string[] | null;
}) => {
  if (row.specializations?.length) {
    return row.specializations.join(', ');
  }

  return row.specialization || 'N/A';
};

export default function ReportListPage() {
  const [activeTab, setActiveTab] = useState('consultation');

  const [range, setRange] = useState<DateRange | undefined>();

  const { payload, handleSearch, handleChangePage, handleChangeRowsPerPage, setPayload } =
    useTableFilters({
      extraPayload: {
        timeFilter: 'all' as string | undefined,
        startRange: undefined as string | undefined,
        endRange: undefined as string | undefined,
        state: 'all' as string,
        district: 'all' as string,
        dept: 'all' as string,
        searchKey: Date.now(),
      },
    });
  const { data: practiceStates, isLoading: isPracticeStatesLoading } =
    useDoctorFilterPracticeState();
  const { data: practiceDistricts, isLoading: isPracticeDistrictsLoading } =
    useDoctorFilterDistrict(payload.state as string);
  const { data: departmentNames, isLoading: isDepartmentLoading } = useGetAllDepartment();

  /**
   * APIs
   */
  const consultationQuery = useGetConsultationsReports(payload, {
    enabled: activeTab === 'consultation',
    reportType: activeTab,
  });

  const patientQuery = useGetPatientsReports(payload, {
    enabled: activeTab === 'patient',
    reportType: activeTab,
  });

  console.log('Consultation Query', consultationQuery.data);

  /**
   * Dynamic table config
   */
  const currentTable = useMemo(() => {
    if (activeTab === 'patient') {
      return {
        data: patientQuery.data?.data || [],
        total: patientQuery.data?.total || 0,
        columns: GetPatientColumns(),
        loading: patientQuery.isLoading,
      };
    }

    return {
      data: consultationQuery.data?.data || [],
      total: consultationQuery.data?.total || 0,
      columns: getConsultationsColumns(),
      loading: consultationQuery.isLoading,
    };
  }, [
    activeTab,
    consultationQuery.data,
    consultationQuery.isLoading,
    patientQuery.data,
    patientQuery.isLoading,
  ]);

  // console.log(currentTable.data);
  /**
   * Export
   */
  const exportOptions = useMemo(() => {
    if (activeTab === 'consultation') {
      return createTableExportOptions<any, typeof payload>({
        fileName: 'consultation-report-list',

        params: payload,

        formats: ['csv', 'pdf', 'xls', 'xlsx'],

        columns: [
          {
            header: 'Full Name',
            accessor: (row) => row.full_name || 'N/A',
          },
          {
            header: 'Email',
            accessor: (row) => row.email || 'N/A',
          },
          {
            header: 'Department',
            accessor: (row) => row?.department?.name || 'N/A',
          },
          {
            header: 'Specializations',
            accessor: formatSpecializations,
          },
          {
            header: 'State',
            accessor: (row) => row.state || 'N/A',
          },
          {
            header: 'District',
            accessor: (row) => row.district || 'N/A',
          },
          {
            header: 'Joined At',
            accessor: (row) =>
              row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : 'N/A',
          },
          {
            header: 'Total Consultations',
            accessor: (row) => row.total_consultations || 0,
          },
          {
            header: 'Scheduled Consultations',
            accessor: (row) => row.scheduled_consultations || 0,
          },
          {
            header: 'Completed Consultations',
            accessor: (row) => row.completed_consultations || 0,
          },
          {
            header: 'Cancelled Scheduled Calls',
            accessor: (row) => row.cancelled_scheduled_calls || 0,
          },
          {
            header: 'Not Responded Calls',
            accessor: (row) => row.not_responded_calls || 0,
          },
          {
            header: 'Avg Duration',
            accessor: (row) => convertMinutes(row.avg_consultation_duration) || 0,
          },
        ],

        fetchData: async (params) => {
          return await getReportsForExport({
            ...params,
            reportType: 'consultation',
          });
        },
      });
    }

    return createTableExportOptions<any, typeof payload>({
      fileName: 'patient-report-list',

      params: payload,

      formats: ['csv', 'pdf', 'xls', 'xlsx'],

      columns: [
        {
          header: 'Full Name',
          accessor: (row) => row.full_name || 'N/A',
        },
        {
          header: 'Email',
          accessor: (row) => row.email || 'N/A',
        },
        {
          header: 'Department',
          accessor: (row) => row?.department?.name || 'N/A',
        },
        {
          header: 'Specializations',
          accessor: formatSpecializations,
        },
        {
          header: 'State',
          accessor: (row) => row.state || 'N/A',
        },
        {
          header: 'District',
          accessor: (row) => row.district || 'N/A',
        },
        {
          header: 'Joined At',
          accessor: (row) =>
            row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : 'N/A',
        },
        {
          header: 'Total Consultations',
          accessor: (row) => row.total_consultations || 0,
        },
        {
          header: 'Not Turned Around Patients',
          accessor: (row) => row.no_of_patient_not_turned_around || 0,
        },
        {
          header: 'Turned Around Patients',
          accessor: (row) => row.no_of_patient_turned_around || 0,
        },
        {
          header: 'Total Referrals',
          accessor: (row) => row.no_of_referrals || 0,
        },
      ],

      fetchData: async (params) => {
        return await getReportsForExport({
          ...params,
          reportType: 'patient',
        });
      },
    });
  }, [activeTab, payload]);

  /**
   * Date Filters
   */
  const ApplyDateFilter = (startRange?: Date, endRange?: Date) => {
    const toStartOfDay = (date: Date) => {
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
    };

    const toEndOfDay = (date: Date) => {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
      );
    };

    setPayload((prev) => ({
      ...prev,
      startRange: startRange ? toStartOfDay(startRange).toISOString() : undefined,
      endRange: endRange ? toEndOfDay(endRange).toISOString() : undefined,
      timeFilter: undefined,
      page: 1,
    }));
  };

  const ResetDateFilter = () => {
    setRange(undefined);

    setPayload((prev) => ({
      ...prev,
      startRange: undefined,
      endRange: undefined,
      timeFilter: 'all',
      page: 1,
    }));
  };

  const handleTimeFilterChange = (value: string) => {
    setPayload((prev) => ({
      ...prev,
      timeFilter: value,
      startRange: undefined,
      endRange: undefined,
      page: 1,
    }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setRange(undefined);
    setPayload((prev) => ({
      ...prev,
      timeFilter: undefined,
      startRange: undefined,
      endRange: undefined,
      search: '',
      state: 'all',
      district: 'all',
      dept: 'all',
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

  const handleSearchWithRefresh = (value: string) => {
    setPayload((prev) => ({
      ...prev,
      search: value,
      searchKey: Date.now(),
      page: 1,
    }));
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 p-6 text-slate-900">
      <ReportStats />

      {/* <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Report List</h1>
      </div> */}

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Tabs */}
          <TableTabFilter
            tabs={REPORT_TYPE_TABS}
            value={activeTab}
            onTabChange={handleTabChange}
            className="w-fit"
          />

          {/* Filters */}
          <div className="flex flex-col items-start justify-between gap-4 py-4 md:flex-row md:items-center">
            <div className="flex flex-wrap items-end gap-4">
              {!payload.startRange && !payload.endRange && (
                <div className="flex flex-col">
                  <p className="mb-1 text-[14px]">Filter Period</p>

                  <select
                    value={(payload.timeFilter as string) || 'all'}
                    onChange={(e) => handleTimeFilterChange(e.target.value)}
                    className="max-h-[40px] min-w-[120px] rounded-md border px-3 py-2"
                  >
                    {TIME_FILTER.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="w-full space-y-1 md:w-auto">
                <p className="mb-1 block text-[14px]">Filter Date</p>

                <CustomDateRangesPicker
                  labelName=""
                  value={range}
                  onChange={(newRange) => {
                    setRange(newRange);
                  }}
                  ApplyDateFilter={ApplyDateFilter}
                  ResetDateFilter={ResetDateFilter}
                />
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
                      <option key={department.id} value={department.id}>
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

              <TableSearchHeader
                key={activeTab}
                filters={[]}
                onSearch={handleSearchWithRefresh}
                placeholder="Search by keyword..."
                className="w-full items-start py-0 md:w-auto"
              />

              <TableExportButton exportOptions={exportOptions} disabled={currentTable.loading} />
            </div>
          </div>

          {/* Table */}
          <div className="relative min-h-0 flex-1">
            <TanstackTable
              data={currentTable.data}
              columns={currentTable.columns}
              page={payload.page}
              pageSize={payload.limit}
              total={currentTable.total}
              onPageChange={handleChangePage}
              onPageSizeChange={handleChangeRowsPerPage}
              isLoading={currentTable.loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
