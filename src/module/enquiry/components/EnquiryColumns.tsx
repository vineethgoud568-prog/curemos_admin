'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Mail } from 'lucide-react';

import { TableActions } from '@/@core/components/Table/tanstack-table/TableActions';
import { TEnquiry } from '@/api/hooks/enquiry/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { TModuleActionPermissions } from '@/types/common/common.schema';

interface EnquiryColumnProps {
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (enquiry: TEnquiry, targetStatus: 'pending' | 'seen') => void;
  actionPermissions: TModuleActionPermissions;
}

export const getEnquiryColumns = ({
  onView,
  onDelete,
  onStatusChange,
  actionPermissions,
}: EnquiryColumnProps): ColumnDef<TEnquiry>[] => {
  const { canView, canDelete } = actionPermissions;

  const columns: ColumnDef<TEnquiry>[] = [
    {
      accessorKey: 'user',
      header: 'Sender',
      size: 250,
      cell: ({ row }) => {
        const user = row.original.user;
        const fullName = user?.full_name || row.original.name || 'Anonymous User';
        const email = user?.email || row.original.email || 'No Email';
        const avatarUrl = user?.avatar_url;
        const initials = fullName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
              <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-600">
                {initials || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 text-sm line-clamp-1">{fullName}</span>
              <span className="text-xs text-slate-500 line-clamp-1">{email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'subject',
      header: 'Subject & Message',
      size: 400,
      cell: ({ row }) => {
        const enquiry = row.original;
        return (
          <div className="flex items-start gap-2.5 py-1">
            <div className="bg-slate-50 border border-slate-200/60 text-slate-500 flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5">
              <Mail size={15} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 text-sm line-clamp-1">
                {enquiry.subject || 'No Subject'}
              </span>
              <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {enquiry.message || 'No Message Content'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 150,
      cell: ({ row }) => {
        const enquiry = row.original;
        const status = enquiry.status;

        if (status === 'pending') {
          return (
            <button
              onClick={() => onStatusChange(enquiry, 'seen')}
              title="Click to mark as Seen"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/80 shadow-sm cursor-pointer',
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Pending
            </button>
          );
        }

        if (status === 'seen') {
          return (
            <button
              onClick={() => onStatusChange(enquiry, 'pending')}
              title="Click to mark as Pending"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100/80 shadow-sm cursor-pointer',
              )}
            >
              <div className="size-2 rounded-full bg-blue-500" />
              Seen
            </button>
          );
        }

        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
            <div className="size-2 rounded-full bg-emerald-500" />
            Replied
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Received On',
      size: 150,
      cell: ({ row }) => {
        const dateVal = row.original.created_at;
        return (
          <span className="text-xs font-medium text-slate-500">
            {dateVal ? format(new Date(dateVal), 'dd MMM, yyyy hh:mm a') : 'N/A'}
          </span>
        );
      },
    },
  ];

  if (canView || canDelete) {
    columns.push({
      id: 'actions',
      header: 'Actions',
      size: 100,
      cell: ({ row }) => (
        <TableActions
          onView={canView ? () => onView(row.original.id) : undefined}
          onDelete={canDelete ? () => onDelete(row.original.id) : undefined}
          viewLabel="View Details"
          deleteLabel="Delete Enquiry"
        />
      ),
    });
  }

  return columns;
};
