'use client';

import dayjs from 'dayjs';
import { Activity, Users } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import DetailsListPage from './DetailsListPage';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { useGetDoctorsByDepartment } from '@/api/hooks/doctor/hooks';
import { TDoctor } from '@/api/hooks/doctor/schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type DetailItem = {
  key: string;
  label: string;
  value: string | number | boolean | string[] | number[] | null | undefined;
};

const hasValue = (value: DetailItem['value']) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
};

const formatLabel = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const IMAGE_FIELDS = new Set(['']);

const isImageFieldValue = (key: string, value: DetailItem['value']): value is string =>
  IMAGE_FIELDS.has(key) && typeof value === 'string' && value.trim() !== '';

const formatValue = (key: string, value: DetailItem['value']) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (
    typeof value === 'string' &&
    (key.endsWith('_at') ||
      key === 'last_active_date' ||
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value))
  ) {
    const formatted = dayjs(value);
    if (formatted.isValid()) {
      return formatted.format('MMMM DD, YYYY hh:mm A');
    }
  }

  if (key === 'role' && typeof value === 'string') {
    return getRoleLabel(value as TDoctor['role']);
  }

  return String(value);
};

const renderDetailGrid = (items: DetailItem[]) => {
  const visibleItems = items.filter((item) => hasValue(item.value));

  if (!visibleItems.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {visibleItems.map((item) => (
        <div
          key={item.key}
          className={cn(
            'rounded-lg border border-slate-200 bg-slate-50/70 p-3',
            String(formatValue(item.key, item.value)).length > 80 && 'sm:col-span-2',
          )}
        >
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{item.label}</p>
          {isImageFieldValue(item.key, item.value) ? (
            <div className="mt-3 space-y-3">
              <div className="relative aspect-[4/3] w-full max-w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Image src={item.value} alt={item.label} fill className="object-cover" />
              </div>
              <a
                href={item.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-sky-700 underline underline-offset-2"
              >
                View full image
              </a>
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold break-words text-slate-900">
              {formatValue(item.key, item.value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

const getRoleLabel = (role: TDoctor['role']) => (role === 'doctor_a' ? 'Doctor A' : 'Doctor B');

const FIELD_PRIORITY = [
  'full_name',
  'professional_name',
  'email',
  'phone',
  'secondary_contact',
  'department',
  'role',
  'status',
  'availability_status',
  'specialization',
  'specializations',
  'hospital_name',
  'hospital_affiliation',
  'location',
  'district',
  'state',
  'pincode',
  'created_at',
  'updated_at',
  'last_active_date',
];

const HIDDEN_FIELDS = new Set([
  'id',
  'role_id',
  'id_text',
  'availability_status',
  'updated_at',
  'avatar_url',
]);

const buildDoctorFields = (doctor: TDoctor): DetailItem[] => {
  const entries = Object.entries(doctor)
    .filter(([key]) => !HIDDEN_FIELDS.has(key))
    .filter(([, value]) => hasValue(value as DetailItem['value']))
    .map(([key, value]) => ({
      key,
      label: formatLabel(key),
      value: value as DetailItem['value'],
    }));

  return entries.sort((a, b) => {
    const aIndex = FIELD_PRIORITY.indexOf(a.key);
    const bIndex = FIELD_PRIORITY.indexOf(b.key);

    if (aIndex === -1 && bIndex === -1) return a.label.localeCompare(b.label);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
};

const getStatusBadgeClass = (status?: string | null) =>
  status === 'active'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-rose-200 bg-rose-50 text-rose-700';

const getAvailabilityBadgeClass = (status?: string | null) =>
  status === 'online'
    ? 'border-sky-200 bg-sky-50 text-sky-700'
    : 'border-slate-200 bg-slate-100 text-slate-700';

export default function DepartmentViewPage() {
  const params = useParams();
  const rawDepartment = params?.id as string;
  const departmentId = decodeURIComponent(rawDepartment || '');

  const {
    data: doctorsResponse,
    isLoading,
    error,
  } = useGetDoctorsByDepartment(departmentId, {
    page: 1,
    limit: 1000,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Activity className="text-primary animate-pulse" size={48} />
          <p className="text-muted-foreground animate-pulse">Fetching department doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-destructive flex flex-col items-center gap-2">
          <p className="text-lg font-semibold">Error Loading Department</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const departmentDoctors = doctorsResponse?.data || [];
  const department = doctorsResponse?.department;
  const activeDoctors = departmentDoctors.filter((doctor) => doctor.status === 'active').length;
  const verifiedDoctors = departmentDoctors.filter((doctor) => doctor.isVerified).length;

  return (
    <div className="w-full space-y-6 p-4">
      <PageCardHeader title="Department Details" backButton hideAddButton />

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-sky-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              {/* <Stethoscope size={30} /> */}
              <Image
                src={department?.image ? (department?.image as string) : ''}
                alt={department?.name ? department?.name : ''}
                width={50}
                height={50}
              />
            </div>

            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-slate-500 uppercase">
                Department
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {department?.name || departmentId || 'Department'}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                  <Users className="size-3.5" />
                  {departmentDoctors.length} Doctor{departmentDoctors.length === 1 ? '' : 's'}
                </Badge>
                {department?.status ? (
                  <Badge className={cn('border', getStatusBadgeClass(department.status))}>
                    {department.status}
                  </Badge>
                ) : null}
                <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
                  {activeDoctors} Active
                </Badge>
                <Badge className="border border-violet-200 bg-violet-50 text-violet-700">
                  {verifiedDoctors} Verified
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Doctors', value: departmentDoctors.length },
              { label: 'Active', value: activeDoctors },
              { label: 'Verified', value: verifiedDoctors },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/80 bg-white/80 px-4 py-3 text-center shadow-sm"
              >
                <p className="text-xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs font-medium tracking-wide text-slate-500 uppercase">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DetailsListPage departmentId={departmentId} />
    </div>
  );
}
