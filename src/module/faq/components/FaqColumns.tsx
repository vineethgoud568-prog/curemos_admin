'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { HelpCircle } from 'lucide-react';

import { TableActions } from '@/@core/components/Table/tanstack-table/TableActions';
import { TFaq } from '@/api/hooks/faq/schema';
import { cn } from '@/lib/utils';
import { TModuleActionPermissions } from '@/types/common/common.schema';

interface FaqColumnProps {
  onEdit: (faq: TFaq) => void;
  onDelete: (id: string) => void;
  onStatusChange: (faq: TFaq) => void;
  actionPermissions: TModuleActionPermissions;
}

export const getFaqColumns = ({
  onEdit,
  onDelete,
  onStatusChange,
  actionPermissions,
}: FaqColumnProps): ColumnDef<TFaq>[] => {
  const { canEdit, canDelete } = actionPermissions;

  const columns: ColumnDef<TFaq>[] = [
    {
      accessorKey: 'question',
      header: 'Question',
      size: 400,
      cell: ({ row }) => {
        const faq = row.original;
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <HelpCircle size={16} />
            </div>
            <span className="line-clamp-2 font-medium text-slate-800">{faq.question}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Target User',
      size: 150,
      cell: ({ row }) => {
        const type = row.original.type;
        const displayType =
          type === 'doctor_a'
            ? 'doctor'
            : type === 'doctor_b'
              ? 'curemos doctor'
              : (type as string) || '';
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 uppercase">
            {displayType}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => {
        const isActive = row.original.status === 'active';
        return (
          <button
            onClick={() => onStatusChange(row.original)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95',
              isActive
                ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                : 'border border-rose-200 bg-rose-100 text-rose-700',
            )}
          >
            <div
              className={cn('size-2 rounded-full', isActive ? 'bg-emerald-500' : 'bg-rose-500')}
            />
            {isActive ? 'Active' : 'Inactive'}
          </button>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created On',
      size: 150,
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-500">
          {format(new Date(row.original.created_at), 'dd MMM, yyyy')}
        </span>
      ),
    },
  ];

  if (canEdit || canDelete) {
    columns.push({
      id: 'actions',
      header: 'Actions',
      size: 100,
      cell: ({ row }) => (
        <TableActions
          onEdit={canEdit ? () => onEdit(row.original) : undefined}
          onDelete={canDelete ? () => onDelete(row.original.id) : undefined}
        />
      ),
    });
  }

  return columns;
};
