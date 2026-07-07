import { Icon } from '@iconify-icon/react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface FilterOption {
  label: string;
  value: string;
}

interface ExtraFilter {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
}

interface TableHeaderProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  placeholder?: string;
  statusOptions?: FilterOption[];
  extraFilters?: ExtraFilter[];
  onExtraFilterChange?: (key: string, value: string) => void;
}

export function TableHeader({
  searchValue,
  onSearchChange,
  status,
  onStatusChange,
  placeholder = 'Search...',
  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ],
  extraFilters = [],
  onExtraFilterChange,
}: TableHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 px-6 md:flex-row md:items-center">
      <div className="flex w-full flex-wrap items-center gap-3">
        <div className="relative w-full md:w-64">
          <Icon
            icon="mdi:search"
            className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <Input
            placeholder={placeholder}
            className="h-10 w-full pl-9"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex h-10 items-center gap-2 text-sm">
              Status:&nbsp;&nbsp;{statusOptions.find((o) => o.value === status)?.label || 'All'}
              <Icon icon="chevron-down" className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onStatusChange('')}>All</DropdownMenuItem>
            {statusOptions.map((opt) => (
              <DropdownMenuItem key={opt.value} onClick={() => onStatusChange(opt.value)}>
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {extraFilters.map((filter) => (
          <DropdownMenu key={filter.key}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex h-10 items-center gap-2 text-sm">
                {filter.label}:&nbsp;&nbsp;
                {filter.options.find((o) => o.value === filter.value)?.label || 'All'}
                <Icon icon="chevron-down" className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onExtraFilterChange?.(filter.key, '')}>
                All
              </DropdownMenuItem>
              {filter.options.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => onExtraFilterChange?.(filter.key, opt.value)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  );
}
