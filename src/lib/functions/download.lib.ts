import { dateFields } from '../constants';

import { formatDateAndTime } from './date.lib';
import { formatLabel } from './format.lib';

import { projectConfig } from '@/config/project-config';

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
const processExportColumns = <T extends Record<string, unknown>>(
  data: T[],
  columns?: (keyof T | Record<string, string>)[],
): { keys: (keyof T)[]; headers: string[] } => {
  if (!data.length) return { keys: [], headers: [] };

  const defaultColumns = Object.keys(data[0]) as (keyof T)[];
  const columnsToProcess = columns || defaultColumns;

  const keys: (keyof T)[] = [];
  const headers: string[] = [];

  columnsToProcess.forEach((col) => {
    if (typeof col === 'string') {
      // Simple string column
      keys.push(col as keyof T);
      headers.push(formatLabel(String(col)));
    } else if (typeof col === 'object' && col !== null) {
      // Object with mapping: { originalKey: 'Custom Header' }
      const [originalKey, customHeader] = Object.entries(col)[0];
      keys.push(originalKey as keyof T);
      headers.push(customHeader);
    }
  });

  return { keys, headers };
};
export const exportToCSV = <T extends Record<string, unknown>>(
  data: T[],
  columns?: (keyof T | Record<string, string>)[],
) => {
  if (!data.length) return;

  const { keys: columnsToExport, headers } = processExportColumns(data, columns);

  const rows = data.map((item) =>
    columnsToExport.map((col) => {
      const rawValue = item[col];
      let stringValue: string;

      if (dateFields.includes(String(col)) && typeof rawValue === 'string') {
        stringValue = formatDateAndTime(rawValue).full;
      } else if (rawValue === null || rawValue === undefined) {
        stringValue = '';
      } else if (typeof rawValue === 'object') {
        stringValue = JSON.stringify(rawValue);
      } else {
        stringValue = String(rawValue);
      }

      // Escape for CSV
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }),
  );

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `${projectConfig.name}_${timestamp}.csv`, 'text/csv;charset=utf-8;');
};
export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[],
  columns?: (keyof T | Record<string, string>)[],
) => {
  if (!data.length) return;

  const { keys: columnsToExport, headers } = processExportColumns(data, columns);

  const worksheetData = [
    headers,
    ...data.map((item) =>
      columnsToExport.map((col) => {
        const rawValue = item[col];
        let stringValue: string;

        if (dateFields.includes(String(col)) && typeof rawValue === 'string') {
          stringValue = formatDateAndTime(rawValue).full;
        } else if (rawValue === null || rawValue === undefined) {
          stringValue = '';
        } else if (typeof rawValue === 'object') {
          stringValue = JSON.stringify(rawValue);
        } else if (typeof rawValue === 'boolean') {
          stringValue = rawValue ? 'true' : 'false';
        } else {
          stringValue = String(rawValue);
        }

        return stringValue;
      }),
    ),
  ];

  // 🔹 Calculate max width per column (rough estimation: 7 pixels per char)
  const columnWidths = headers.map((_, colIndex) => {
    let maxLen = 0;
    worksheetData.forEach((row) => {
      const cellLen = String(row[colIndex] || '').length;
      if (cellLen > maxLen) maxLen = cellLen;
    });
    return maxLen * 7; // adjust multiplier (6–8px) to match Excel font
  });

  let excelContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Sheet1">
<Table>`;

  // 🔹 Insert column definitions
  columnWidths.forEach((width) => {
    excelContent += `<Column ss:AutoFitWidth="0" ss:Width="${width}" />`;
  });

  worksheetData.forEach((row) => {
    excelContent += '<Row>';
    row.forEach((cell) => {
      const cellValue = String(cell || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      excelContent += `<Cell><Data ss:Type="String">${cellValue}</Data></Cell>`;
    });
    excelContent += '</Row>';
  });

  excelContent += `</Table>
</Worksheet>
</Workbook>`;

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(excelContent, `${projectConfig.name}_${timestamp}.xls`, 'application/vnd.ms-excel');
};

export const exportToJSON = <T extends Record<string, unknown>>(
  data: T[],
  columns?: (keyof T | Record<string, string>)[],
  filename?: string,
) => {
  if (!data.length) return;

  const { keys: columnsToExport } = processExportColumns(data, columns);

  const jsonData = data.map((item) => {
    const row: Record<string, unknown> = {};
    columnsToExport.forEach((col) => {
      row[String(col)] = item[col];
    });
    return row;
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const name = filename || projectConfig.name;
  downloadFile(JSON.stringify(jsonData, null, 2), `${name}_${timestamp}.json`, 'application/json');
};
