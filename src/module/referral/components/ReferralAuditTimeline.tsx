'use client';

import { format } from 'date-fns';
import { History as HistoryIcon, UserCog } from 'lucide-react';
import React from 'react';

import ReferralStatusBadge from './ReferralStatusBadge';

import { TAuditLog, TReferralStatus } from '@/api/hooks/referral/schema';
// 


interface ReferralAuditTimelineProps {
  logs: TAuditLog[];
}

const ReferralAuditTimeline: React.FC<ReferralAuditTimelineProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <HistoryIcon size={40} className="mb-2 opacity-20" />
        <p>No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-100/80">
      {logs.map((log) => {
        const isStatusChange = log.action.includes('status to');
        const newStatus = isStatusChange
          ? (log.action.split('status to ')[1] as TReferralStatus)
          : null;
        const prevStatus = log.details?.previous_status as TReferralStatus | undefined;

        return (
          <div key={log.id} className="group relative flex items-start pl-12">
            <div className="group-hover:bg-primary/5 group-hover:text-primary absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-slate-50 text-slate-400 shadow-sm transition-colors">
              <UserCog size={16} />
            </div>

            <div className="flex flex-1 flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-md">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="group-hover:text-primary text-sm font-bold text-slate-900 transition-colors">
                    {isStatusChange ? 'Status Changed' : log.action}
                  </span>
                </div>
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium tracking-tight text-slate-400 uppercase">
                  {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                </span>
              </div>

              <p className="mb-3 text-xs text-slate-500">
                by{' '}
                <span className="font-semibold text-slate-700">
                  {log.admin_profile?.full_name || 'Administrator'}
                </span>
                <span className="mx-1.5 opacity-30">|</span>
                <span className="opacity-70">{log.admin_profile?.email || 'System'}</span>
              </p>

              {isStatusChange && newStatus && (
                <div className="flex items-center gap-3 rounded-lg border border-slate-100/50 bg-slate-50/50 p-2.5">
                  {prevStatus && (
                    <>
                      <ReferralStatusBadge status={prevStatus} className="h-5 text-[10px]" />
                      <span className="text-slate-300">→</span>
                    </>
                  )}
                  <ReferralStatusBadge status={newStatus} className="h-5 text-[10px]" />
                  <span className="ml-auto text-[10px] font-medium text-slate-400 italic">
                    Action: {newStatus === 'referralSent' ? 'Referral Sent' : newStatus === 'admitted' ? 'Admitted' : newStatus === 'discharged' ? 'Discharged' : 'Pending'}
                  </span>
                </div>
              )}

              {log.details &&
                !log.details.previous_status &&
                Object.keys(log.details).length > 0 && (
                <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-3 font-mono text-[11px] text-slate-600">
                  {JSON.stringify(log.details, null, 2)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReferralAuditTimeline;
