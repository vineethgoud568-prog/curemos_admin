import { ConsultationReviewQueryEnum, TConsultationReviewParams } from './schema';

export const consultationReviewKeys = {
  all: (params: TConsultationReviewParams) =>
    [ConsultationReviewQueryEnum.ConsultationReviewAll, params] as const,
};
