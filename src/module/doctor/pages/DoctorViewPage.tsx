'use client';

import dayjs from 'dayjs';
import {
  Activity,
  BadgeCheck,
  BriefcaseMedical,
  Calendar,
  Clock3,
  Download,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import ConfirmDialog from '@/@core/components/dialogs/ConfirmDialog';
import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { useGetDoctorById, useUpdateDoctorVerify } from '@/api/hooks/doctor/hooks';
import { TDoctor } from '@/api/hooks/doctor/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DetailValue = string | number | boolean | string[] | null | undefined;

type DetailItem = {
  label: string;
  value: DetailValue;
  fullWidth?: boolean;
};

type StatItem = {
  label: string;
  value: number | null | undefined;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  accent: string;
};

const getRoleLabel = (role: TDoctor['role']) => (role === 'doctor_a' ? 'Doctor' : 'Curemos Doctor');

const hasMeaningfulValue = (value: DetailValue) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const getFileKind = (value: string) => {
  const pathname = value.split('?')[0].toLowerCase();

  if (/\.(png|jpe?g|webp|gif|bmp|svg|avif)$/.test(pathname)) return 'image';
  if (/\.pdf$/.test(pathname)) return 'pdf';

  return 'file';
};

const getFileNameFromUrl = (value: string, fallback: string) => {
  try {
    const url = new URL(value);
    const fileName = url.pathname.split('/').pop();

    return fileName && fileName.trim() !== '' ? fileName : fallback;
  } catch {
    return fallback;
  }
};

const downloadUrlAsFile = async (url: string, fallbackName: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = getFileNameFromUrl(url, fallbackName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
};

const formatDate = (value: string) => {
  const formatted = dayjs(value);
  return formatted.isValid() ? formatted.format('MMMM DD, YYYY hh:mm A') : value;
};

const formatValue = (value: DetailValue) => {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const renderDetailItems = (items: DetailItem[]) => {
  const visibleItems = items.filter((item) => hasMeaningfulValue(item.value));

  if (!visibleItems.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {visibleItems.map((item) => (
        <div
          key={item.label}
          className={cn(
            'rounded-xl border border-slate-200 bg-slate-50/70 p-4',
            item.fullWidth && 'sm:col-span-2',
          )}
        >
          <p className="text-muted-foreground text-xs">{item.label}</p>
          {item.label === 'Specializations' && Array.isArray(item.value) ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {item.value.map((spec) => (
                <Badge
                  key={spec}
                  variant="secondary"
                  className="border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
                >
                  {spec}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold wrap-break-word text-slate-900">
              {formatValue(item.value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

function DocumentPreview({ label, value }: { label: string; value: string | null | undefined }) {
  if (!hasMeaningfulValue(value)) return null;

  const trimmedValue = value!.trim();
  const isUrl = isValidUrl(trimmedValue);

  if (!isUrl) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="mt-1 text-sm font-semibold wrap-break-word text-slate-900">{trimmedValue}</p>
      </div>
    );
  }

  const fileKind = getFileKind(trimmedValue);
  const fallbackFileName =
    fileKind === 'image'
      ? `${label.toLowerCase().replace(/\s+/g, '-')}.jpg`
      : fileKind === 'pdf'
        ? `${label.toLowerCase().replace(/\s+/g, '-')}.pdf`
        : `${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-muted-foreground text-xs">{label}</p>

      {fileKind === 'image' ? (
        <div className="mt-3 space-y-3">
          <div className="relative h-52 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Image src={trimmedValue} alt={label} fill className="object-cover" />
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={trimmedValue} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-2">
                <Eye size={16} />
                View image
              </Button>
            </a>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => void downloadUrlAsFile(trimmedValue, fallbackFileName)}
            >
              <Download size={16} />
              Download
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {fileKind === 'pdf' ? 'PDF document' : 'Attached file'}
              </p>
              <p className="text-muted-foreground text-xs break-all">{trimmedValue}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={trimmedValue} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-2">
                <Eye size={16} />
                {fileKind === 'pdf' ? 'View PDF' : 'Open file'}
              </Button>
            </a>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => void downloadUrlAsFile(trimmedValue, fallbackFileName)}
            >
              <Download size={16} />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  items: DetailItem[];
}) {
  const content = renderDetailItems(items);

  if (!content) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Icon className="text-primary" size={20} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export default function DoctorViewPage() {
  const params = useParams();
  const id = params?.id as string;

  const [verifyModal, setVerifyModal] = useState(false);
  const { data: doctor, isLoading, error } = useGetDoctorById(id);

  const { mutateAsync, isPending } = useUpdateDoctorVerify();

  const handleConfirmVerify = () => {
    mutateAsync(
      {
        id,
        isVerified: doctor?.isVerified ? false : true,
        email: doctor?.email ?? '',
        full_name: doctor?.full_name ?? '',
      },
      {
        onSuccess: () => {
          toast.success('Doctor verified successfully');
          setVerifyModal(false);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Activity className="text-primary animate-pulse" size={48} />
          <p className="text-muted-foreground animate-pulse">Fetching doctor records...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-destructive flex flex-col items-center gap-2">
          <p className="text-lg font-semibold">Error Loading Doctor</p>
          <p className="text-sm">{error?.message || 'Doctor not found'}</p>
        </div>
      </div>
    );
  }

  const statItems: StatItem[] = [
    {
      label: 'Total Consultations',
      value: doctor.total_consultations,
      icon: Stethoscope,
      accent: 'from-sky-500/15 to-cyan-500/10 text-sky-700',
    },
    // {
    //   label: 'Live Consultations',
    //   value: doctor.live_consultations,
    //   icon: Activity,
    //   accent: 'from-emerald-500/15 to-green-500/10 text-emerald-700',
    // },
    {
      label: 'Scheduled Calls',
      value: doctor.scheduled_consultations,
      icon: Calendar,
      accent: 'from-amber-500/15 to-orange-500/10 text-amber-700',
    },
    {
      label: 'Completed Calls',
      value: doctor.completed_consultations,
      icon: BadgeCheck,
      accent: 'from-indigo-500/15 to-blue-500/10 text-indigo-700',
    },
    {
      label: 'Cancelled Calls',
      value: doctor.cancelled_scheduled_calls,
      icon: Phone,
      accent: 'from-rose-500/15 to-pink-500/10 text-rose-700',
    },
    {
      label: 'No Response Calls',
      value: doctor.not_responded_calls,
      icon: Clock3,
      accent: 'from-slate-500/15 to-gray-500/10 text-slate-700',
    },
    {
      label: 'Referrals',
      value: doctor.no_of_referrals,
      icon: Users,
      accent: 'from-violet-500/15 to-fuchsia-500/10 text-violet-700',
    },
    {
      label: 'Turned Around',
      value: doctor.no_of_patient_turned_around,
      icon: BriefcaseMedical,
      accent: 'from-teal-500/15 to-cyan-500/10 text-teal-700',
    },
    {
      label: 'Not Turned Around',
      value: doctor.no_of_patient_not_turned_around,
      icon: ShieldCheck,
      accent: 'from-red-500/15 to-orange-500/10 text-red-700',
    },
    {
      label: 'Avg Duration (in mins)',
      value: doctor.avg_consultation_duration,
      icon: Clock3,
      accent: 'from-blue-500/15 to-sky-500/10 text-blue-700',
    },
    {
      label: 'Referral Conversion',
      value: doctor.referral_conversion_rate,
      icon: Activity,
      accent: 'from-lime-500/15 to-emerald-500/10 text-lime-700',
    },
  ];

  const visibleStats = statItems.filter((item) => item.value !== null && item.value !== undefined);

  const contactItems: DetailItem[] = [
    { label: 'Email Address', value: doctor.email },
    { label: 'Phone Number', value: doctor.phone },
    { label: 'Secondary Contact', value: doctor.secondary_contact },
  ];

  const professionalItems: DetailItem[] = [
    { label: 'Professional Name', value: doctor.professional_name },
    {
      label: 'Department',
      value: doctor?.specializations && doctor.specializations,
    },
    // {
    //   label: 'Specializations',
    //   value: (doctor.specializations && doctor.specializations.length > 0)
    //     ? doctor.specializations
    //     : (doctor.specialization ? [doctor.specialization] : null),
    // },
    { label: 'Medical License Number', value: doctor.medical_license_number },
    { label: 'Years Of Experience', value: doctor.years_of_experience },
    { label: 'Area Of Interests', value: doctor.area_of_interests },
    { label: 'Short Professional Bio', value: doctor.short_professional_bio, fullWidth: true },
  ];

  const practiceItems: DetailItem[] = [
    { label: 'Hospital Name', value: doctor.hospital_name },
    { label: 'Hospital Affiliation', value: doctor.hospital_affiliation },
    { label: 'Location', value: doctor.location },
    { label: 'District', value: doctor.district },
    { label: 'State', value: doctor.state },
    { label: 'Pincode', value: doctor.pincode },
    { label: 'Availability Status', value: doctor.availability_status },
    {
      label: 'Coordinates',
      value:
        doctor.location_lat != null && doctor.location_lng != null
          ? `${doctor.location_lat}, ${doctor.location_lng}`
          : null,
    },
  ];

  const registrationItems: DetailItem[] = [
    { label: 'State Medical Council', value: doctor.state_medical_council },
    { label: 'NMC Registration Year', value: doctor.nmc_registration_year },
    { label: 'Status', value: doctor.status },
    { label: 'Verified', value: doctor.isVerified },
    // { label: 'Profile Complete', value: doctor.isProfileComplete },
  ];

  const accountItems: DetailItem[] = [
    { label: 'Role', value: getRoleLabel(doctor.role) },
    { label: 'Joined On', value: doctor.created_at ? formatDate(doctor.created_at) : null },
  ];

  const hasAvatarImage = hasMeaningfulValue(doctor.avatar_url) && isValidUrl(doctor.avatar_url!);

  return (
    <div className="w-full space-y-6 p-4">
      <PageCardHeader title="Doctor Details" backButton hideAddButton />

      <Card className="overflow-hidden border-slate-200 py-0 shadow-sm">
        <CardContent className="bg-linear-to-r from-slate-50 via-white to-emerald-50/60 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {hasAvatarImage ? (
                  <Image
                    src={doctor.avatar_url!}
                    alt={doctor.full_name || 'Doctor'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center">
                    <UserRound size={34} />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {doctor.full_name || doctor.professional_name || 'Unnamed Doctor'}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {getRoleLabel(doctor.role)}
                  </Badge>
                  {hasMeaningfulValue(doctor.status) && (
                    <Badge variant="outline" className="capitalize">
                      {doctor.status}
                    </Badge>
                  )}
                  {doctor.isVerified !== null && doctor.isVerified !== undefined && (
                    <Badge variant="outline">{doctor.isVerified ? 'Verified' : 'Unverified'}</Badge>
                  )}
                  {/* {doctor.isProfileComplete !== null && doctor.isProfileComplete !== undefined && (
                    <Badge variant="outline">
                      {doctor.isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                    </Badge>
                  )} */}
                </div>
              </div>
            </div>
            <div>
              <Button
                className="bg-primary hover:bg-primary/90 h-10 gap-2 rounded-lg px-6 shadow-sm"
                onClick={() => setVerifyModal(true)}
              >
                {!doctor.isVerified ? 'Verify Doctor' : 'Revoke Verification'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {visibleStats.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleStats.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label} className="overflow-hidden border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <div className={cn('bg-linear-to-br p-5', item.accent)}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium tracking-wide text-slate-600 uppercase">
                          {item.label}
                        </p>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
                      </div>
                      <div className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-sm">
                        <Icon className="text-slate-700" size={20} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <InfoCard title="Contact Information" icon={Mail} items={contactItems} />
        <InfoCard
          title="Professional Information"
          icon={BriefcaseMedical}
          items={professionalItems}
        />
        <InfoCard title="Practice Details" icon={MapPin} items={practiceItems} />
        <InfoCard title="Registration Details" icon={ShieldCheck} items={registrationItems} />

        {(hasMeaningfulValue(doctor.medical_license) || hasMeaningfulValue(doctor.avatar_url)) && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <FileText className="text-primary" size={20} /> Documents & Media
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <DocumentPreview label="Medical License" value={doctor.medical_license} />
              {/* <DocumentPreview label="Avatar" value={doctor.avatar_url} /> */}
            </CardContent>
          </Card>
        )}

        <InfoCard title="Account Activity" icon={Calendar} items={accountItems} />
      </div>
      <ConfirmDialog
        title={!doctor.isVerified ? 'Verify Doctor' : 'Revoke Verification'}
        description={
          !doctor.isVerified
            ? 'Are you sure you want to verify this doctor?'
            : 'Are you sure you want to revoke verification for this doctor?'
        }
        cancelText="Cancel"
        confirmText={!doctor.isVerified ? 'Verify' : 'Revoke'}
        open={!!verifyModal}
        loading={isPending}
        onOpenChange={() => setVerifyModal(false)}
        onConfirm={handleConfirmVerify}
      />
    </div>
  );
}
