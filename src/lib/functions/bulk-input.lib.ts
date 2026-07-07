import { mediaConfig } from '../constants';
import regex from '../regex';

import { formatLabel } from './format.lib';

// ─── Bulk Paste Types ────────────────────────────────────────────────────────
export type TKeyCaseType = 'snake_case' | 'camelCase' | 'kebab-case' | 'PascalCase';
export interface IBulkPasteColumn {
  key: string;
  label?: string;
  required?: boolean;
  defaultValue?: string;
  maxDecimalPlaces?: number;
  specialCharacters?: string[];
  type?: 'alpha' | 'alphanumeric' | 'number' | 'float' | 'link' | 'email';
}
export interface IParsedRow {
  _id: string;
  [key: string]: string;
}
export interface IParseResult {
  rows: IParsedRow[];
  detectedColumns: IBulkPasteColumn[];
}
interface IParseOptions {
  minColumns?: number;
  maxColumns?: number;
  keyCase?: TKeyCaseType;
  delimiter?: string | RegExp;
  columns?: IBulkPasteColumn[];
}

// ─── Utility Functions ───────────────────────────────────────────────────────
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const getColLabel = (col: IBulkPasteColumn): string => col.label || formatLabel(col.key);

export const hasInvalidChars = (val: string, pat: RegExp, spec?: string[]) =>
  val.split('').some((ch) => !pat.test(ch) && !spec?.includes(ch));

export const toKeyCase = (str: string, keyCase: TKeyCaseType): string => {
  const normalized = str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '');
  const words = normalized.split(/\s+/).filter(Boolean);

  switch (keyCase) {
    case 'camelCase':
      return words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join('');
    case 'PascalCase':
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    case 'kebab-case':
      return words.join('-');
    case 'snake_case':
    default:
      return words.join('_');
  }
};

export const ensureUniqueKeys = (columns: IBulkPasteColumn[]): IBulkPasteColumn[] => {
  const keyCount: Record<string, number> = {};
  return columns.map((col) => {
    let key = col.key;
    if (keyCount[key] !== undefined) {
      keyCount[key] = keyCount[key]! + 1;
      key = `${key}_${keyCount[key]}`;
    } else {
      keyCount[key] = 0;
    }
    return { ...col, key };
  });
};

export const parseTabularData = (text: string, options: IParseOptions = {}): IParseResult => {
  const { columns, delimiter = /\t/, keyCase = 'snake_case', minColumns, maxColumns } = options;
  const lines = text.split(/\r?\n/).filter((line) => line.trim());

  if (lines.length === 0) {
    return { rows: [], detectedColumns: columns || [] };
  }

  const splitLine = (line: string): string[] => {
    if (typeof delimiter === 'string') {
      return line.split(delimiter);
    }
    return line.split(delimiter);
  };

  const headerRow = splitLine(lines[0] || '');
  let dataStartIndex = 0;
  let detectedColumns: IBulkPasteColumn[] = [];

  if (columns && columns.length > 0) {
    detectedColumns = columns;
    // Check if first row matches column headers
    const firstRowIsHeader = headerRow.some((cell) =>
      columns.some(
        (col) =>
          col.key === toKeyCase(cell, keyCase) || col.label?.toLowerCase() === cell.toLowerCase(),
      ),
    );
    dataStartIndex = firstRowIsHeader ? 1 : 0;
  } else {
    // Auto-detect columns from first row
    detectedColumns = headerRow.map((header) => ({
      key: toKeyCase(header, keyCase) || `column_${headerRow.indexOf(header)}`,
      label: header.trim(),
    }));
    dataStartIndex = 1;
  }

  // Apply column limits
  if (minColumns && detectedColumns.length < minColumns) {
    while (detectedColumns.length < minColumns) {
      detectedColumns.push({
        key: `column_${detectedColumns.length}`,
        label: `Column ${detectedColumns.length + 1}`,
      });
    }
  }
  if (maxColumns && detectedColumns.length > maxColumns) {
    detectedColumns = detectedColumns.slice(0, maxColumns);
  }

  // Ensure unique keys before processing rows
  let activeColumns = ensureUniqueKeys(detectedColumns);

  const rows: IParsedRow[] = [];
  for (let i = dataStartIndex; i < lines.length; i++) {
    const cells = splitLine(lines[i] || '');
    const row: IParsedRow = { _id: generateId() };
    activeColumns.forEach((col, idx) => {
      row[col.key] = (cells[idx] || '').trim();
    });
    rows.push(row);
  }

  // Filter out columns that have no data in any row if they were auto-detected
  if (!columns || columns.length === 0) {
    activeColumns = activeColumns.filter((col) =>
      rows.some((row) => {
        const value = row[col.key];
        return value !== undefined && value.trim() !== '';
      }),
    );
  }

  return { rows, detectedColumns: activeColumns };
};
export const parseCSVFile = async (
  file: File,
  options: IParseOptions = {},
): Promise<IParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // CSV uses comma as delimiter
        const result = parseTabularData(text, { ...options, delimiter: ',' });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
};
export const parseExcelFile = async (
  file: File,
  options: IParseOptions = {},
): Promise<IParseResult> => {
  // Dynamically import xlsx library for Excel parsing
  try {
    const XLSX = await import('xlsx');
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { rows: [], detectedColumns: options.columns || [] };
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return { rows: [], detectedColumns: options.columns || [] };
    }
    const csvText = XLSX.utils.sheet_to_csv(worksheet);
    return parseTabularData(csvText, { ...options, delimiter: ',' });
  } catch {
    throw new Error('Failed to parse Excel file. Please ensure xlsx library is installed.');
  }
};

// File accept string for CSV and Excel files using mediaConfig
export const bulkPasteAccept = [...mediaConfig.csv.extensions, ...mediaConfig.excel.extensions]
  .map((ext) => `.${ext}`)
  .join(',');

// ─── Constants ───────────────────────────────────────────────────────────────
export const typeValidators: Record<string, (val: string, col: IBulkPasteColumn) => string | null> =
  {
    alpha: (v, c) =>
      hasInvalidChars(v, regex.alphabetic, c.specialCharacters)
        ? 'must contain only Letters'
        : null,
    alphanumeric: (v, c) =>
      hasInvalidChars(v, regex.alphanumeric, c.specialCharacters)
        ? 'must contain only Letters and Numbers'
        : null,
    number: (v, c) =>
      isNaN(Number(v)) && hasInvalidChars(v, /[0-9]/, c.specialCharacters)
        ? 'must be a Number'
        : null,
    float: (v, c) =>
      isNaN(Number(v)) && hasInvalidChars(v, /[0-9.]/, c.specialCharacters)
        ? 'must be a Number'
        : null,
    link: (v) => (!regex.url.test(v) ? 'must be a valid URL' : null),
    email: (v) => (!regex.email.test(v) ? 'must be a valid Email' : null),
  };
