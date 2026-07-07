import React from 'react';

import { TReferralStatus } from '@/api/hooks/referral/schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReferralStatusBadgeProps {
  status: TReferralStatus;
  className?: string;
}

const statusConfig: Record<TReferralStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100/80',
  },
  admitted: {
    label: 'Admitted',
    className: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100/80',
  },
  discharged: {
    label: 'Discharged',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
  },
  referralSent: {
    label: 'Referral Sent',
    className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100/80',
  },
};

const ReferralStatusBadge: React.FC<ReferralStatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant="outline"
      className={cn(
        'px-2.5 py-0.5 font-medium capitalize shadow-none',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
};

export default ReferralStatusBadge;
