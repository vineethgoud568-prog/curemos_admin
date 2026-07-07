// ─── Bulk Paste Types ────────────────────────────────────────────────────────

import { mediaConfig } from '../constants';

import { getFileExtension } from './file-input.lib';

import { TCommonSchema } from '@/types/common/common.schema';

// MIME type mappings for common file extensions, derived from mediaConfig
export const extensionMimeMap: Record<string, string[]> = Object.values(mediaConfig).reduce(
  (acc, item) => {
    const mimes = item.mimes ?? [];
    item.extensions.forEach((ext) => {
      const key = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key] = Array.from(new Set([...acc[key]!, ...mimes]));
    });
    return acc;
  },
  {} as Record<string, string[]>,
);

export const validateUploadFile = (
  file: File,
  ACCEPT: string | { [key: string]: unknown },
  maxSize?: number | null,
  existingFileNames?: Set<string | undefined>,
  maxCount?: number,
): {
  validFile: File | null;
  errorMessage: string;
} => {
  let errorMessage = '';

  if (maxCount !== undefined && existingFileNames && existingFileNames.size >= maxCount) {
    errorMessage = `You can only upload up to ${maxCount} file${maxCount > 1 ? 's' : ''}!`;
    return { validFile: null, errorMessage };
  }

  if (existingFileNames?.has(file.name)) {
    errorMessage = `'${file.name}' has already been uploaded!`;
    return { validFile: null, errorMessage };
  }

  let acceptableTypes: string[] = [];
  if (typeof ACCEPT === 'string') {
    acceptableTypes = ACCEPT.split(',').map((type) => type.trim().toLowerCase());
  } else if (typeof ACCEPT === 'object') {
    acceptableTypes = Object.keys(ACCEPT).map((type) => type.toLowerCase());
  }

  // Check if file is valid by extension or MIME type
  const fileExtension = getFileExtension(file.name);
  const fileMimeType = file.type.toLowerCase();

  const isValidType = acceptableTypes.some((acceptType) => {
    // If acceptType is an extension (starts with .)
    if (acceptType.startsWith('.')) {
      // Check if file extension matches
      if (fileExtension === acceptType) return true;
      // Also check if file MIME type matches known MIME types for this extension
      const knownMimes = extensionMimeMap[acceptType];
      if (knownMimes && knownMimes.includes(fileMimeType)) return true;
    } else if (fileMimeType === acceptType) {
      // acceptType is a MIME type, check directly
      return true;
    }
    return false;
  });

  if (!isValidType) {
    errorMessage = `'${file?.name}' has an unsupported format!`;
    return { validFile: null, errorMessage };
  }

  if (maxSize != null && file.size > maxSize) {
    errorMessage = `'${file?.name}' exceeds the maximum size limit!`;
    return { validFile: null, errorMessage };
  }

  return { validFile: file, errorMessage };
};

export const multiUploader = ({
  formData,
  existingData = [],
}: {
  existingData: string[];
  formData: TCommonSchema['file'];
}) => {
  // Normalize input safely
  const normalizedData: (string | File | { name: string })[] = Array.isArray(formData)
    ? formData
    : formData
      ? [formData]
      : [];

  const newFiles: File[] = [];
  const currentUploadedNames: string[] = [];

  for (const item of normalizedData) {
    if (!item || (typeof item === 'string' && !item.trim())) continue;

    if (typeof item === 'string') {
      currentUploadedNames.push(item.trim());
      continue;
    }

    if (item instanceof File) {
      newFiles.push(item);
      continue;
    }

    if (typeof item === 'object' && 'name' in item && typeof item.name === 'string') {
      newFiles.push(item as File);
      continue;
    }
  }

  const currentSet = new Set(currentUploadedNames.map((n) => n.toLowerCase()));

  const removedFiles = existingData.filter((name) => !currentSet.has(name.toLowerCase().trim()));

  return { newFiles, removedFiles };
};
