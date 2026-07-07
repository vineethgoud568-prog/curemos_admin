'use client';

import { Icon } from '@iconify/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface IFilterBadge {
  label: string;
  icon?: string;
}

interface ITableSearchHeaderProps {
  onSearch: (value: string) => void;
  filters: IFilterBadge[];
  placeholder?: string;
  className?: string;
}

export function TableSearchHeader({
  onSearch,
  filters,
  placeholder = 'Search...',
  className,
}: ITableSearchHeaderProps) {
  return (
    <div className={cn('flex items-end justify-start gap-3 py-4', className)}>
      <div className="relative w-full max-w-sm">
        <Icon
          icon="tabler:search"
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border-slate-200 bg-white pl-10 shadow-sm focus-visible:ring-slate-400"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="h-10 rounded-lg border-dashed border-slate-300 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50"
          >
            <Icon icon={filter.icon || 'tabler:plus'} className="mr-2 h-4 w-4 text-slate-400" />
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
