'use client';

import { Icon } from '@iconify-icon/react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  TTableExportOptions,
  exportRowsToCsv,
  exportRowsToExcel,
  exportRowsToPdf,
  TExportFormat,
} from '@/@core/utils/table-export';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ITableExportButtonProps<T> {
  exportOptions: TTableExportOptions<T>;
  disabled?: boolean;
}

export function TableExportButton<T>({
  exportOptions,
  disabled = false,
}: ITableExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: TExportFormat) => {
    setIsExporting(true);

    try {
      const rows = await exportOptions.getData();

      if (format === 'csv') {
        exportRowsToCsv(exportOptions.fileName, rows, exportOptions.columns, exportOptions.prefixRows);
      } else if (format === 'pdf') {
        exportRowsToPdf(exportOptions.fileName, rows, exportOptions.columns, exportOptions.prefixRows);
      } else {
        await exportRowsToExcel(exportOptions.fileName, rows, exportOptions.columns, format, exportOptions.prefixRows);
      }

      toast.success(`${format.toUpperCase()} export downloaded successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export table data';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const availableFormats = exportOptions.formats?.length ? exportOptions.formats : ['csv', 'pdf'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-lg border-slate-200 bg-white px-4 shadow-sm hover:bg-slate-50"
          disabled={disabled || isExporting}
        >
          <Icon icon="mdi:download-outline" className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : exportOptions.buttonLabel || 'Export'}
          <Icon icon="mdi:chevron-down" className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {availableFormats.includes('csv') ? (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <Icon icon="ph:file-csv" className="h-4 w-4" />
            Export CSV
          </DropdownMenuItem>
        ) : null}
        {availableFormats.includes('pdf') ? (
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <Icon icon="mdi:file-pdf-box" className="h-4 w-4" />
            Export PDF
          </DropdownMenuItem>
        ) : null}
        {availableFormats.includes('xls') ? (
          <DropdownMenuItem onClick={() => handleExport('xls')}>
            <Icon icon="mdi:file-excel" className="h-4 w-4" />
            Export XLS
          </DropdownMenuItem>
        ) : null}
        {/* {availableFormats.includes('xlsx') ? (
          <DropdownMenuItem onClick={() => handleExport('xlsx')}>
            <Icon icon="mdi:file-excel-outline" className="h-4 w-4" />
            Export XLSX
          </DropdownMenuItem>
        ) : null} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
