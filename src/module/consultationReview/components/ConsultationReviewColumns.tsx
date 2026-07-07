'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Star } from 'lucide-react';

import { TConsultationReview } from '@/api/hooks/consultationReview/schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return format(date, 'dd MMM, yyyy hh:mm a');
};

const formatLabel = (value?: string | null) => {
  if (!value) return 'N/A';
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const statusClassName = (status?: string | null) => {
  const normalized = status?.toLowerCase();

  if (normalized === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }
  if (normalized === 'active') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (normalized === 'pending') return 'border-amber-200 bg-amber-50 text-amber-700';

  return 'border-slate-200 bg-slate-50 text-slate-600';
};

export const getConsultationReviewColumns = (): ColumnDef<TConsultationReview>[] => [
  {
    accessorKey: 'rating',
    header: 'Rating',
    size: 130,
    cell: ({ row }) => {
      const rating = row.original.rating;

      return (
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-slate-800">
            {typeof rating === 'number' ? `${rating}/5` : 'N/A'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'review',
    header: 'Review',
    size: 360,
    cell: ({ row }) => (
      <p className="line-clamp-3 max-w-[340px] text-sm leading-5 text-slate-600">
        {row.original.review || 'N/A'}
      </p>
    ),
  },
  {
    accessorKey: 'gp_doctor_name',
    header: 'GP Doctor Name',
    size: 210,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-slate-800">
        {row.original.gp_doctor_name || 'N/A'}
      </span>
    ),
  },
  {
    accessorKey: 'gp_doctor_email',
    header: 'GP Doctor Email',
    size: 240,
    cell: ({ row }) => (
      <span className="text-sm text-slate-500">{row.original.gp_doctor_email || 'N/A'}</span>
    ),
  },
  {
    accessorKey: 'curemos_doctor_name',
    header: 'Curemos Doctor Name',
    size: 230,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-slate-800">
        {row.original.curemos_doctor_name || 'N/A'}
      </span>
    ),
  },
  {
    accessorKey: 'curemos_doctor_email',
    header: 'Curemos Doctor Email',
    size: 250,
    cell: ({ row }) => (
      <span className="text-sm text-slate-500">{row.original.curemos_doctor_email || 'N/A'}</span>
    ),
  },
  {
    accessorKey: 'consultation_type',
    header: 'Consultation Type',
    size: 180,
    cell: ({ row }) => (
      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
        {formatLabel(row.original.consultation_type)}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={cn('font-semibold', statusClassName(row.original.status))}
      >
        {formatLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: 'start_time',
    header: 'Start Time',
    size: 190,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-500">
        {formatDateTime(row.original.start_time)}
      </span>
    ),
  },
  {
    accessorKey: 'end_time',
    header: 'End Time',
    size: 190,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-500">
        {formatDateTime(row.original.end_time)}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Submitted At',
    size: 190,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-500">
        {formatDateTime(row.original.created_at)}
      </span>
    ),
  },
];
