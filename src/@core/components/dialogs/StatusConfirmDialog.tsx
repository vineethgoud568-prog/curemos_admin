'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type TStatusConfirmDialogProps = {
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function StatusConfirmDialog({
  open,
  loading = false,
  onOpenChange,
  onConfirm,
}: TStatusConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl sm:max-w-[420px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-slate-900">
            Change Status
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-500">
            Are you sure you want to change the status of this User?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-10 rounded-lg px-6 font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 h-10 rounded-lg px-8 font-semibold text-white shadow-sm transition-all"
          >
            {loading ? 'Updating...' : 'Confirm'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
