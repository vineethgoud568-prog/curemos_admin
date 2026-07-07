import { TTableParams } from '@/@core/utils/supabase-query';

export type TFaqStatus = 'active' | 'inactive';
export type TFaqType = 'doctor_a' | 'doctor_b';

export type TFaq = {
  id: string;
  question: string;
  answer: string;
  type: TFaqType;
  status: TFaqStatus;
  created_at: string;
  updated_at?: string | null;
};

export type TFaqPayload = Omit<TFaq, 'id' | 'created_at' | 'updated_at'>;

export enum FaqQueryEnum {
  FaqAll = 'faq-all',
  FaqGet = 'faq-get',
}
