'use client';

import { Icon } from '@iconify-icon/react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TableFooterProps {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  dataLength: number;
  onPageSizeChange: (size: string) => void;
  handlePageChange: (page: number) => void;
}

export const TableFooter: React.FC<TableFooterProps> = ({
  page,
  pageSize,
  pageCount,
  total,
  dataLength,
  onPageSizeChange,
  handlePageChange,
}) => {
  const from = dataLength > 0 ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 text-sm text-slate-500">
      {/* Left: entry count */}
      <span className="tabular-nums">
        Showing {from} to {to} of {total} Entries
      </span>

      {/* Right: rows per page + navigation */}
      <div className="flex items-center gap-5">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <Label
            htmlFor="rows-per-page"
            className="text-sm font-medium whitespace-nowrap text-slate-500"
          >
            Rows Per Page
          </Label>
          <Select value={`${pageSize}`} onValueChange={onPageSizeChange}>
            <SelectTrigger id="rows-per-page" className="h-8 w-16 text-sm">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <span className="font-medium whitespace-nowrap text-slate-600 tabular-nums">
          Page {page} of {pageCount || 1}
        </span>

        {/* Navigation buttons — matching reference style */}
        <div className="flex items-center gap-1">
          {/* First */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            onClick={() => handlePageChange(1)}
            disabled={page <= 1}
          >
            <Icon icon="tabler:chevrons-left" height={15} width={15} />
          </Button>

          {/* Prev */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <Icon icon="tabler:chevron-left" height={15} width={15} />
          </Button>

          {/* Next */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= pageCount}
          >
            <Icon icon="tabler:chevron-right" height={15} width={15} />
          </Button>

          {/* Last */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            onClick={() => handlePageChange(pageCount)}
            disabled={page >= pageCount}
          >
            <Icon icon="tabler:chevrons-right" height={15} width={15} />
          </Button>
        </div>
      </div>
    </div>
  );
};
