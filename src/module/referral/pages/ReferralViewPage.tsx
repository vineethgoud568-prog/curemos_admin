'use client';

import { format } from 'date-fns';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  History as HistoryIcon,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { toast } from 'sonner';

import ReferralAuditTimeline from '../components/ReferralAuditTimeline';
import ReferralStatusBadge from '../components/ReferralStatusBadge';

import {
  useGetReferralAuditLogs,
  useGetReferralById,
  useUpdateReferralStatus,
  useReferralRealtime,
} from '@/api/hooks/referral/hooks';
import { TReferralStatus } from '@/api/hooks/referral/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuthContext } from '@/context/AuthContext';
import { ROUTES } from '@/navigation/sidebar/routes';

interface ReferralViewPageProps {
  id: string;
}

export default function ReferralViewPage({ id }: ReferralViewPageProps) {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const { data: referral, isLoading } = useGetReferralById(id);
  const { data: auditLogs, isLoading: isAuditLoading } = useGetReferralAuditLogs(id);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateReferralStatus();

  useReferralRealtime(id);

  const [confirmStatus, setConfirmStatus] = useState<TReferralStatus | null>(null);

  const handleStatusChange = (newStatus: TReferralStatus) => {
    setConfirmStatus(newStatus);
  };

  const confirmUpdate = () => {
    if (!confirmStatus || !user?._id) return;

    updateStatus(
      {
        id,
        status: confirmStatus,
        adminId: user._id,
        details: { previous_status: referral?.status },
      },
      {
        onSuccess: () => {
          toast.success(`Referral ${confirmStatus} successfully`);
          setConfirmStatus(null);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update status');
          setConfirmStatus(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold">Referral not found</h2>
        <Button variant="link" onClick={() => router.push(ROUTES.referral.list)}>
          Back to list
        </Button>
      </div>
    );
  }

  const isDischarged = referral.status === 'discharged';
  const isAdmitted = referral.status === 'admitted';
  const isReferralSent = referral.status === 'referralSent';
  const isPending = referral.status === 'pending';

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-slate-50/50 p-4 text-slate-900 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white shadow-sm hover:bg-slate-50"
            onClick={() => router.push(ROUTES.referral.list)}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Referral Details</h1>
              <ReferralStatusBadge status={referral.status} className="text-[10px] sm:text-sm" />
            </div>
            <p className="text-[10px] font-medium tracking-wider text-slate-500 sm:text-sm">
              REF-{referral.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          {!isDischarged && (
            <>
              {isPending && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
                  onClick={() => handleStatusChange('referralSent')}
                  disabled={isUpdating}
                >
                  <ShieldCheck size={18} className="mr-2" />
                  Send Referral
                </Button>
              )}
              {isReferralSent && (
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
                  onClick={() => handleStatusChange('admitted')}
                  disabled={isUpdating}
                >
                  <Building2 size={18} className="mr-2" />
                  Admit Patient
                </Button>
              )}
              {isAdmitted && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                  onClick={() => handleStatusChange('discharged')}
                  disabled={isUpdating}
                >
                  <CheckCircle2 size={18} className="mr-2" />
                  Discharge Patient
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Patient & Clinical Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Clinical Information */}
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-primary" size={20} />
                <CardTitle className="text-lg">Clinical Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Diagnosis
                  </label>
                  <p className="mt-1 font-medium text-slate-900">
                    {referral.diagnosis || 'No diagnosis provided'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Admission Date
                  </label>
                  <p className="mt-1 font-medium text-slate-900">
                    {referral.admission_date
                      ? format(new Date(referral.admission_date), 'PPP')
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Recommended Treatment
                </label>
                <p className="mt-2 rounded-lg border border-slate-100 bg-slate-50/50 p-4 whitespace-pre-wrap text-slate-700">
                  {referral.recommended_treatment || 'No treatment recommendations provided'}
                </p>
              </div> */}

              <div>
                <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Medical Report
                </label>
                <div className="mt-2 rounded-lg border border-slate-100 p-4 text-slate-600 italic">
                  {referral.notes || 'No additional notes provided'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <HistoryIcon className="text-primary" size={20} />
                <CardTitle className="text-lg">Audit History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ReferralAuditTimeline logs={auditLogs || []} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stakeholders */}
        <div className="space-y-6">
          {/* Patient Card */}
          <Card className="hover:border-primary/20 border-slate-200 shadow-sm transition-all">
            <CardHeader className="pb-3">
              <div className="text-primary flex items-center gap-2">
                <UserIcon size={18} />
                <CardTitle className="text-sm font-bold tracking-wider uppercase opacity-70">
                  Patient Info
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full font-bold capitalize">
                  {referral.patient?.full_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 capitalize">
                    {referral.patient?.full_name || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-500">{referral.patient?.email || 'No email'}</p>
                  <p className="text-sm text-slate-500">{referral.patient?.phone || 'No phone'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referring Doctor */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Stethoscope size={18} />
                <CardTitle className="text-sm font-bold tracking-wider uppercase opacity-70">
                  Referring Doctor
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-slate-900 capitalize">
                {referral.doctor_a?.full_name || 'N/A'}
              </p>
              <p className="text-sm text-slate-500 capitalize">
                {referral.doctor_a?.specialization || 'General Practitioner'}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} />
                <span>Referred on {format(new Date(referral.referral_date), 'PPP')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Referred Hospital/Doctor */}
          <Card className="border-primary/10 bg-primary/5 ring-primary/20 shadow-sm ring-1">
            <CardHeader className="pb-3">
              <div className="text-primary flex items-center gap-2">
                <Building2 size={18} />
                <CardTitle className="text-sm font-bold tracking-wider uppercase opacity-70">
                  Referred To
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-slate-900 capitalize">
                {referral.doctor_b?.full_name || 'N/A'}
              </p>
              <p className="text-primary/80 font-medium capitalize">
                {referral.doctor_b?.hospital_affiliation || 'External Facility'}
              </p>
              <p className="mt-1 text-sm text-slate-500 capitalize">
                {referral.doctor_b?.location || 'Location not specified'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!confirmStatus} onOpenChange={(open) => !open && setConfirmStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change the status of this referral to{' '}
              <span className="text-primary font-bold uppercase">{confirmStatus}</span>. This action
              will be recorded in the audit history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUpdate}
              className={
                confirmStatus === 'discharged'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
