import { EnquiryQueryEnum } from './schema';

import { TTableParams } from '@/@core/utils/supabase-query';

export const enquiryKeys = {
  all: (params: TTableParams & { status?: string; type?: string }) => [EnquiryQueryEnum.EnquiryAll, params] as const,
  detail: (id: string) => [EnquiryQueryEnum.EnquiryGet, id] as const,
  pendingCount: () => [EnquiryQueryEnum.EnquiryPendingCount] as const,
};
