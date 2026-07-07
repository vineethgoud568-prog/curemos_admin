'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TTableActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
};

export function TableActions({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}: TTableActionsProps) {
  const baseClassName =
    'size-8 rounded-md transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2';

  return (
    <div className="flex items-center gap-1">
      {onEdit ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`${baseClassName} text-slate-600 hover:bg-slate-100 hover:text-slate-900`}
              onClick={onEdit}
              aria-label={editLabel}
            >
              <Pencil className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {editLabel}
          </TooltipContent>
        </Tooltip>
      ) : null}

      {onView ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`${baseClassName} text-slate-500 hover:bg-slate-100 hover:text-slate-800`}
              onClick={onView}
              aria-label={viewLabel}
            >
              <Eye className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {viewLabel}
          </TooltipContent>
        </Tooltip>
      ) : null}

      {onDelete ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`${baseClassName} text-red-500 hover:bg-red-50 hover:text-red-600`}
              onClick={onDelete}
              aria-label={deleteLabel}
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {deleteLabel}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}
