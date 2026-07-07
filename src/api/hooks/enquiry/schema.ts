import { TTableParams } from '@/@core/utils/supabase-query';

export type TEnquiryStatus = 'pending' | 'seen' | 'replied';

export type TEnquiryProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  specialization?: string | null;
  hospital_affiliation?: string | null;
  state_medical_council?: string | null;
};

export type TEnquiry = {
  id: string;
  created_at: string;
  user_id: string | null;
  subject: string | null;
  message: string | null;
  reply: string | null;
  status: TEnquiryStatus;
  user?: TEnquiryProfile | null;
  name?: string | null;
  email?: string | null;
};

export type TEnquiryPayload = {
  reply: string;
};

export enum EnquiryQueryEnum {
  EnquiryAll = 'enquiry-all',
  EnquiryGet = 'enquiry-get',
  EnquiryPendingCount = 'enquiry-pending-count',
}
