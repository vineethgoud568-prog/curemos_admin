import { useMutation, useQuery } from '@tanstack/react-query';

//import axiosInstance from 'src/api/axiosInstance/axioInstance';
import { TermsConditionsQueryEnum } from './key';
import { TTermsConditionsModel } from './schema';

import axiosInstance from '@/api/axiosInstance/axiosInstance';
//import { endpoints } from 'src/api/endpoints';
import { endpoints } from '@/api/endpoints/endpoints';

export const useGetTermsConditions = () => {
  return useQuery<TTermsConditionsModel['getTermsConditionsResponse'], Error>({
    queryKey: [TermsConditionsQueryEnum.TermsConditionsGet],
    queryFn: async () => {
      const res = await axiosInstance.get<TTermsConditionsModel['getTermsConditionsResponse']>(
        `${endpoints.cms.termsConditions.get}`,
      );

      return res?.data;
    },
  });
};

export const useUpdateTermsConditions = () => {
  return useMutation<
    TTermsConditionsModel['getTermsConditionsResponse'],
    Error,
    TTermsConditionsModel['ITermsConditionsCreatePayload']
  >({
    mutationKey: [TermsConditionsQueryEnum.TermsConditionsUpdate],
    mutationFn: async (payload: TTermsConditionsModel['ITermsConditionsCreatePayload']) => {
      const res = await axiosInstance.post<TTermsConditionsModel['getTermsConditionsResponse']>(
        endpoints.cms.termsConditions.update,
        payload,
      );

      return res?.data;
    },
  });
};
