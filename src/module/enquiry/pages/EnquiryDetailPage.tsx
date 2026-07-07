'use client';

import { format } from 'date-fns';
import { Mail, MessageSquare, Phone, User, Calendar, Shield, Hospital, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import ConfirmDialog from '@/@core/components/dialogs/ConfirmDialog';
import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { useGetEnquiryById, useUpdateEnquiryStatus, useReplyToEnquiry } from '@/api/hooks/enquiry/hook';
import { TEnquiryStatus } from '@/api/hooks/enquiry/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/navigation/sidebar/routes';

interface EnquiryDetailPageProps {
  id: string;
}

export default function EnquiryDetailPage({ id }: EnquiryDetailPageProps) {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const { data: enquiry, isLoading, error } = useGetEnquiryById(id);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateEnquiryStatus();
  const { mutate: replyToEnquiry, isPending: isReplying } = useReplyToEnquiry();

  const [replyText, setReplyText] = useState('');
  const [statusDialogTarget, setStatusDialogTarget] = useState<'pending' | 'seen' | null>(null);

  const canEdit = hasPermission('enquiry', 'edit');

  const handleStatusChange = () => {
    if (!canEdit || !statusDialogTarget) {
      toast.error('You do not have permission to modify enquiries.');
      return;
    }
    updateStatus(
      { id, status: statusDialogTarget },
      {
        onSuccess: () => {
          toast.success(`Enquiry marked as ${statusDialogTarget === 'seen' ? 'Seen' : 'Pending'}`);
          setStatusDialogTarget(null);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to update status');
        },
      },
    );
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }

    replyToEnquiry(
      {
        id,
        reply: replyText.trim(),
        userEmail: enquiry?.user?.email || enquiry?.email,
        fullName: enquiry?.user?.full_name || enquiry?.name || 'Anonymous User',
        subject: enquiry?.subject,
      },
      {
        onSuccess: () => {
          toast.success('Reply submitted successfully and email sent to user!');
          setReplyText('');
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to send reply');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-primary" />
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          {error?.message || 'Enquiry details could not be found.'}
        </div>
      </div>
    );
  }

  const user = enquiry.user;
  const fullName = user?.full_name || enquiry.name || 'Anonymous User';
  const email = user?.email || enquiry.email || 'No email provided';
  const phone = user?.phone || 'No phone number';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-7xl mx-auto">
      <PageCardHeader title="Enquiry Details" backButton={true} hideAddButton={true} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Enquiry Content & Reply Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Main Enquiry Content */}
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {enquiry.subject || 'No Subject'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                    <Calendar size={13} />
                    Received On: {format(new Date(enquiry.created_at), 'dd MMM, yyyy hh:mm a')}
                  </CardDescription>
                </div>
                <div>
                  {enquiry.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => canEdit && setStatusDialogTarget('seen')}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase transition-all hover:scale-105 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer shadow-sm animate-pulse"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      Pending
                    </button>
                  ) : enquiry.status === 'seen' ? (
                    <button
                      type="button"
                      onClick={() => canEdit && setStatusDialogTarget('pending')}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase transition-all hover:scale-105 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer shadow-sm"
                    >
                      <div className="size-2 rounded-full bg-blue-500 mr-1.5 shrink-0" />
                      Seen
                    </button>
                  ) : (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1">
                      <div className="size-2 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
                      Replied
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
                  <h4 className="text-xs font-bold tracking-wide text-slate-400 uppercase mb-2">User Message</h4>
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {enquiry.message || 'No description provided.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reply Form or Submitted Reply */}
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                {enquiry.status === 'replied' ? 'Admin Response' : 'Respond to Enquiry'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {enquiry.status === 'replied' ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 sm:p-5">
                    <h4 className="text-xs font-bold tracking-wide text-emerald-600 uppercase mb-2">Sent Reply</h4>
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {enquiry.reply}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 italic">
                    This enquiry has been successfully resolved and replied to.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Message Reply
                    </label>
                    <Textarea
                      placeholder="Write your detailed reply to the user..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[160px] resize-y rounded-lg border-slate-200 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-1"
                      disabled={isReplying}
                    />
                    <p className="text-[11px] text-slate-400 italic">
                      Note: Submitting this reply will automatically email the user and mark the enquiry status as Replied.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(ROUTES.enquiry.list)}
                      disabled={isReplying}
                      className="h-10 px-4 rounded-lg border-slate-200 text-slate-600 font-semibold"
                    >
                      Back to List
                    </Button>
                    <Button
                      type="submit"
                      disabled={isReplying || !replyText.trim()}
                      className="bg-primary hover:bg-primary/95 text-white h-10 px-5 rounded-lg font-semibold shadow-sm transition-all active:scale-95 disabled:scale-100"
                    >
                      {isReplying ? 'Sending Reply...' : 'Send Reply'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sender Profile Info */}
        <div className="space-y-6">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 flex flex-col items-center pt-6">
              <Avatar className="h-20 w-20 border-2 border-white shadow-md ring-4 ring-slate-100">
                {user?.avatar_url ? <AvatarImage src={user.avatar_url} alt={fullName} /> : null}
                <AvatarFallback className="bg-slate-100 text-xl font-bold text-slate-600">
                  {initials || 'U'}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-3 text-base font-bold text-slate-800 text-center">{fullName}</h3>
              <Badge variant="secondary" className="mt-1 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Sender Profile
              </Badge>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail size={15} className="text-slate-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                    <span className="text-sm font-semibold text-slate-700 truncate">{email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone size={15} className="text-slate-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                    <span className="text-sm font-semibold text-slate-700">{phone}</span>
                  </div>
                </div>
              </div>

              {/* Extra professional details if sender is a doctor */}
              {(user?.specialization || user?.hospital_affiliation || user?.state_medical_council) && (
                <>
                  <Separator className="my-4 border-slate-100" />
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Professional Info</h4>
                    {user.specialization && (
                      <div className="flex items-center gap-3">
                        <Award size={15} className="text-slate-400 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialization</span>
                          <span className="text-sm font-semibold text-slate-700">{user.specialization}</span>
                        </div>
                      </div>
                    )}
                    {user.hospital_affiliation && (
                      <div className="flex items-center gap-3">
                        <Hospital size={15} className="text-slate-400 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospital Affiliation</span>
                          <span className="text-sm font-semibold text-slate-700">{user.hospital_affiliation}</span>
                        </div>
                      </div>
                    )}
                    {user.state_medical_council && (
                      <div className="flex items-center gap-3">
                        <Shield size={15} className="text-slate-400 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medical Council State</span>
                          <span className="text-sm font-semibold text-slate-700">{user.state_medical_council}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!statusDialogTarget}
        onOpenChange={(open) => !open && setStatusDialogTarget(null)}
        title={statusDialogTarget === 'seen' ? 'Mark Enquiry as Seen' : 'Mark Enquiry as Pending'}
        description={statusDialogTarget === 'seen'
          ? 'Are you sure you want to mark this enquiry as Seen?'
          : 'Are you sure you want to mark this enquiry as Pending?'}
        confirmText={statusDialogTarget === 'seen' ? 'Mark as Seen' : 'Mark as Pending'}
        onConfirm={handleStatusChange}
        loading={isUpdatingStatus}
      />
    </div>
  );
}
