import { mediaConfig } from '@/lib/constants';
import { TCommonSchema } from '@/types/common/common.schema';

// ===== UTILITY FUNCTIONS =====
export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : '';
};

export const getMediaExtension = (mimeType: string): string => {
  for (const group of Object.values(mediaConfig)) {
    const index = (group.mimes as readonly string[]).indexOf(mimeType);
    if (index !== -1) {
      return group.extensions[index];
    }
  }
  return 'file';
};

export const detectFileType = (urlOrExt: string): TCommonSchema['media'] => {
  if (!urlOrExt) return 'image';

  // Check base64 data URLs by MIME type
  if (urlOrExt.startsWith('data:')) {
    const mediaTypes = Object.keys(mediaConfig) as TCommonSchema['media'][];
    for (const type of mediaTypes) {
      if (mediaConfig[type].mimes.some((mime) => urlOrExt.startsWith(`data:${mime}`))) {
        return type;
      }
    }

    // Generic fallbacks for data URLs that might not match specific mimes in config
    if (urlOrExt.startsWith('data:image')) return 'image';
    if (urlOrExt.startsWith('data:video')) return 'video';
    if (urlOrExt.startsWith('data:audio')) return 'audio';
  }

  // Otherwise, detect by extension
  const lowerExt = urlOrExt.toLowerCase().replace(/^\./, '');
  const mediaTypes = Object.keys(mediaConfig) as TCommonSchema['media'][];
  for (const type of mediaTypes) {
    if ((mediaConfig[type].extensions as readonly string[]).includes(lowerExt)) {
      return type;
    }
  }

  return 'image';
};

export const getFileIcon = (extOrType: string): string => {
  // First check if it's a valid media type key directly
  if (extOrType in mediaConfig) {
    return mediaConfig[extOrType as TCommonSchema['media']]?.icon || 'pepicons-pencil:file';
  }
  // Otherwise, detect the type from extension
  const type = detectFileType(extOrType);
  return mediaConfig[type]?.icon || 'pepicons-pencil:file';
};

export const getFileTypeLabel = (fileName: string): string => {
  const ext = getFileExtension(fileName);
  const type = detectFileType(ext);
  return type.toUpperCase();
};

export const getReadableSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ===== MIME & EXTENSION HELPERS =====
export const getAcceptString = (
  types: TCommonSchema['media'] | TCommonSchema['media'][],
): string => {
  const typeArray = Array.isArray(types) ? types : [types];
  return typeArray.flatMap((t) => mediaConfig[t].mimes).join(',');
};

export const getMaxSize = (types: TCommonSchema['media'] | TCommonSchema['media'][]): number => {
  const typeArray = Array.isArray(types) ? types : [types];
  return Math.max(...typeArray.map((t) => mediaConfig[t].size));
};

export const getReadableExtensions = (
  types: TCommonSchema['media'] | TCommonSchema['media'][],
): string => {
  const typeArray = Array.isArray(types) ? types : [types];
  const exts = Array.from(new Set(typeArray.flatMap((t) => mediaConfig[t].extensions)));
  return exts.map((e) => e.toUpperCase()).join(' or ');
};

export const isValidMimeType = (file: File, acceptString: string): boolean => {
  const acceptedMimes = acceptString.split(',').map((m) => m.trim());
  return acceptedMimes.includes(file.type);
};
