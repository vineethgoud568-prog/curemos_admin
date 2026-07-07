'use client';

import { cn } from '@/lib/utils';

export interface ITabOption {
  label: string;
  value: string;
}

interface ITableTabFilterProps {
  tabs: ITabOption[];
  value: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function TableTabFilter({ tabs, value, onTabChange, className }: ITableTabFilterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
