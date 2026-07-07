export type TExportFormat = 'csv' | 'pdf' | 'xls' | 'xlsx';

export type TExportColumn<T> = {
  header: string;
  accessor: (row: T) => unknown;
};

export type TTableExportOptions<T> = {
  fileName: string;
  columns: TExportColumn<T>[];
  getData: () => Promise<T[]> | T[];
  formats?: TExportFormat[];
  buttonLabel?: string;
  prefixRows?: string[][];
};

type TCreateTableExportOptionsArgs<T, TParams> = {
  fileName: string;
  columns: TExportColumn<T>[];
  params: TParams;
  fetchData: (params: TParams) => Promise<T[]> | T[];
  formats?: TExportFormat[];
  buttonLabel?: string;
  prefixRows?: string[][];
};

const MAX_COLUMN_CHAR_WIDTH = 24;
const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PDF_MARGIN_X = 40;
const PDF_MARGIN_Y = 40;
const PDF_LINE_HEIGHT = 14;
const PDF_FONT_SIZE = 10;

const sanitizeFileName = (fileName: string) => fileName.trim().replace(/\s+/g, '-').toLowerCase();

const formatExportValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'string') return value;
  return String(value);
};

const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

const escapePdfText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const downloadBlob = (content: BlobPart, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

const fitPdfCell = (value: string, width: number) => {
  if (value.length <= width) return value.padEnd(width, ' ');
  if (width <= 3) return value.slice(0, width);
  return `${value.slice(0, width - 3)}...`;
};

const getExcelColumnWidths = (headers: string[], rows: string[][]) =>
  headers.map((header, columnIndex) => {
    const widestValue = rows.reduce(
      (maxWidth, row) => Math.max(maxWidth, row[columnIndex]?.length || 0),
      header.length,
    );

    return {
      wch: Math.min(Math.max(widestValue + 2, 12), 32),
    };
  });

const buildPdfDocument = (title: string, lines: string[]) => {
  const linesPerPage = Math.max(
    1,
    Math.floor((PDF_PAGE_HEIGHT - PDF_MARGIN_Y * 2) / PDF_LINE_HEIGHT) - 1,
  );
  const pageChunks: string[][] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pageChunks.push(lines.slice(index, index + linesPerPage));
  }

  const fontObjectId = pageChunks.length * 2 + 3;
  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';

  pageChunks.forEach((pageLines, pageIndex) => {
    const pageObjectId = 3 + pageIndex * 2;
    const contentObjectId = pageObjectId + 1;

    pageObjectIds.push(pageObjectId);

    const contentLines = [title, ...pageLines];
    const startY = PDF_PAGE_HEIGHT - PDF_MARGIN_Y;
    const stream = [
      'BT',
      `/F1 ${PDF_FONT_SIZE} Tf`,
      `${PDF_MARGIN_X} ${startY} Td`,
      `${PDF_LINE_HEIGHT} TL`,
      ...contentLines.map((line, lineIndex) =>
        lineIndex === 0 ? `(${escapePdfText(line)}) Tj` : `T* (${escapePdfText(line)}) Tj`,
      ),
      'ET',
    ].join('\n');

    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;
  objects[fontObjectId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (let index = 1; index < objects.length; index += 1) {
    if (!objects[index]) continue;
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index < objects.length; index += 1) {
    const offset = offsets[index] || 0;
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
};

export const exportRowsToCsv = <T>(
  fileName: string,
  rows: T[],
  columns: TExportColumn<T>[],
  prefixRows?: string[][],
) => {
  const prefixCsv = prefixRows ? `${prefixRows.map(row => row.map(escapeCsvValue).join(',')).join('\n')  }\n` : '';
  const headerRow = columns.map((column) => escapeCsvValue(column.header)).join(',');
  const bodyRows = rows.map((row) =>
    columns.map((column) => escapeCsvValue(formatExportValue(column.accessor(row)))).join(','),
  );
  const csvContent = prefixCsv + [headerRow, ...bodyRows].join('\n');

  downloadBlob(csvContent, `${sanitizeFileName(fileName)}.csv`, 'text/csv;charset=utf-8;');
};

export const exportRowsToPdf = <T>(
  fileName: string,
  rows: T[],
  columns: TExportColumn<T>[],
  prefixRows?: string[][],
) => {
  const rawValues = rows.map((row) =>
    columns.map((column) => formatExportValue(column.accessor(row)).replace(/\s+/g, ' ').trim()),
  );
  const widths = columns.map((column, columnIndex) => {
    const contentWidth = rawValues.reduce(
      (maxWidth, row) => Math.max(maxWidth, row[columnIndex]?.length || 0),
      column.header.length,
    );

    return Math.min(MAX_COLUMN_CHAR_WIDTH, Math.max(column.header.length, contentWidth));
  });

  const headerLine = columns
    .map((column, index) => fitPdfCell(column.header, widths[index]))
    .join(' | ');
  const separatorLine = widths.map((width) => '-'.repeat(width)).join('-+-');
  const rowLines = rawValues.map((row) =>
    row.map((value, index) => fitPdfCell(value, widths[index])).join(' | '),
  );

  const lines = [];
  if (prefixRows) {
    prefixRows.forEach(row => lines.push(row.join(' | ')));
    lines.push('');
  }
  lines.push(headerLine, separatorLine, ...rowLines);

  const pdfContent = buildPdfDocument(fileName, lines);

  downloadBlob(pdfContent, `${sanitizeFileName(fileName)}.pdf`, 'application/pdf');
};

export const exportRowsToExcel = async <T>(
  fileName: string,
  rows: T[],
  columns: TExportColumn<T>[],
  format: Extract<TExportFormat, 'xls' | 'xlsx'>,
  prefixRows?: string[][],
) => {
  const XLSX = await import('xlsx');
  const headers = columns.map((column) => column.header);
  const bodyRows = rows.map((row) =>
    columns.map((column) => formatExportValue(column.accessor(row)).replace(/\s+/g, ' ').trim()),
  );
  
  const allRows: any[] = [];
  if (prefixRows) {
    allRows.push(...prefixRows);
    allRows.push([]); // blank row before headers
  }
  allRows.push(headers);
  allRows.push(...bodyRows);

  const worksheet = XLSX.utils.aoa_to_sheet(allRows);
  const workbook = XLSX.utils.book_new();

  worksheet['!cols'] = getExcelColumnWidths(headers, bodyRows);

  const headerRowIndex = prefixRows ? prefixRows.length + 1 : 0;

  headers.forEach((_, columnIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: columnIndex });
    const cell = worksheet[cellAddress];

    if (!cell) return;

    cell.s = {
      font: {
        italic: true,
      },
      alignment: {
        vertical: 'center',
        horizontal: 'left',
      },
    };
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${sanitizeFileName(fileName)}.${format}`, {
    bookType: format,
    cellStyles: true,
  });
};

export const createTableExportOptions = <T, TParams>({
  fileName,
  columns,
  params,
  fetchData,
  formats,
  buttonLabel,
  prefixRows,
}: TCreateTableExportOptionsArgs<T, TParams>): TTableExportOptions<T> => ({
    fileName,
    columns,
    formats,
    buttonLabel,
    prefixRows,
    getData: () => fetchData(params),
  });
