'use client';

import { Icon } from '@iconify-icon/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface ICardHeaderProps {
  title: string;
  children?: React.ReactNode;
  addButtonLabel?: string;
  addButtonUrl?: string;
  button?: boolean;
  backButton?: boolean;
  hideAddButton?: boolean;
  icon?: string;
}

export function PageCardHeader({
  title,
  children,
  addButtonLabel = 'Add Item',
  addButtonUrl,
  backButton = false,
  hideAddButton = false,
  icon = 'tabler:plus',
}: ICardHeaderProps) {
  const router = useRouter();

  // Split title so the last word gets a primary-colour accent (matching the reference)
  const words = title.trim().split(' ');
  const titleMain = words.slice(0, -1).join(' ');
  const titleAccent = words[words.length - 1];

  return (
    <div className="flex flex-row items-center justify-between py-1">
      {/* Title */}
      <div className="flex items-center gap-3">
        {backButton && (
          <Button
            variant="outline"
            className="flex h-9 w-9 items-center justify-center rounded-lg border-slate-200 transition-colors hover:bg-slate-50"
            size="icon"
            onClick={() => router.back()}
          >
            <Icon icon="mdi:arrow-left" className="h-5 w-5 text-slate-600" />
          </Button>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {titleMain && <span>{titleMain} </span>}
          <span className="text-primary">{titleAccent}</span>
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!hideAddButton && (
          <Button
            className="bg-primary hover:bg-primary/90 h-10 rounded-lg px-5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95"
            onClick={() => router.push(addButtonUrl || '')}
          >
            <Icon icon={icon} className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
