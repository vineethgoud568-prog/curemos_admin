import { TTableParams } from '@/@core/utils/supabase-query';

export type TConsultationReview = {
  id: string;
  consultation_id: string | null;
  rating: number | null;
  review: string | null;
  created_at: string | null;
  updated_at: string | null;
  doctor_a_id: string | null;
  gp_doctor_name: string | null;
  gp_doctor_email: string | null;
  doctor_b_id: string | null;
  curemos_doctor_name: string | null;
  curemos_doctor_email: string | null;
  consultation_type: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
};

export type TConsultationReviewParams = TTableParams & {
  rating?: string;
  consultationType?: string;
};

export type TConsultationReviewResponse = {
  data: TConsultationReview[];
  total: number;
  consultationTypes: string[];
};

export enum ConsultationReviewQueryEnum {
  ConsultationReviewAll = 'consultation-review-all',
}
