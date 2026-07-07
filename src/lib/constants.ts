import { TCommonSchema } from '@/types/common/common.schema';

export const mediaConfig = {
  image: {
    size: 5 * 1024 * 1024,
    mimes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
    extensions: ['png', 'jpg', 'jpeg', 'webp'],
    icon: 'hugeicons:image-01',
  },
  video: {
    size: 15 * 1024 * 1024,
    mimes: ['video/mp4', 'video/webm', 'video/ogg'],
    extensions: ['mp4', 'webm', 'ogv'],
    icon: 'hugeicons:video-01',
  },
  audio: {
    size: 10 * 1024 * 1024,
    mimes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    extensions: ['mp3', 'mp3', 'wav', 'ogg'],
    icon: 'ph:file-audio',
  },
  pdf: {
    size: 5 * 1024 * 1024,
    mimes: ['application/pdf'],
    extensions: ['pdf'],
    icon: 'hugeicons:pdf-01',
  },
  excel: {
    size: 20 * 1024 * 1024,
    mimes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    extensions: ['xls', 'xlsx'],
    icon: 'file-icons:microsoft-excel',
  },
  csv: {
    size: 10 * 1024 * 1024,
    mimes: ['text/csv', 'application/csv'],
    extensions: ['csv'],
    icon: 'ph:file-csv',
  },
  doc: {
    size: 10 * 1024 * 1024,
    mimes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    extensions: ['doc', 'docx'],
    icon: 'hugeicons:doc-01',
  },
  text: {
    size: 2 * 1024 * 1024,
    mimes: ['text/plain'],
    extensions: ['txt'],
    icon: 'hugeicons:txt-01',
  },
} as const satisfies Record<
  TCommonSchema['media'],
  { size: number; mimes: readonly string[]; extensions: readonly string[]; icon: string }
>;

export const dateFields = ['createdAt', 'updatedAt'];

export const encryptionKey = process.env.NEXT_APP_ENCRYPTION_KEY_NAME!;

export const rememberMeKey = 'remember-me-credentials';
export const accessTokenKey = process.env.NEXT_PUBLIC_TOKEN_NAME || 'accessToken';
export const refreshTokenKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_NAME || 'refreshToken';
