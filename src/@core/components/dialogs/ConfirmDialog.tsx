'use client';

import { AlertDialog, AlertDialogContent, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="text-lg font-semibold">{title}</div>
        <p className="text-muted-foreground text-sm">{description}</p>
        <AlertDialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Updating...' : `${confirmText}`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
