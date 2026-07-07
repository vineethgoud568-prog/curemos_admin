'use client';

import { useQuery } from '@tanstack/react-query';

import { consultationReviewKeys } from './key';
import { TConsultationReviewParams, TConsultationReviewResponse } from './schema';

const buildConsultationReviewUrl = (params: TConsultationReviewParams) => {
  const searchParams = new URLSearchParams();

  searchParams.set('page', String(params.page || 1));
  searchParams.set('limit', String(params.limit || 10));

  if (params.search?.trim()) searchParams.set('search', params.search.trim());
  if (params.rating) searchParams.set('rating', params.rating);
  if (params.consultationType) searchParams.set('consultationType', params.consultationType);

  return `/api/consultation-reviews?${searchParams.toString()}`;
};

export const useGetConsultationReviews = (params: TConsultationReviewParams) =>
  useQuery<TConsultationReviewResponse, Error>({
    queryKey: consultationReviewKeys.all(params),
    queryFn: async () => {
      const response = await fetch(buildConsultationReviewUrl(params), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || 'Failed to fetch consultation reviews');
      }

      return payload as TConsultationReviewResponse;
    },
  });
