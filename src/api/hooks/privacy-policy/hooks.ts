import { useMutation, useQuery } from '@tanstack/react-query';

//import axiosInstance from 'src/api/axiosInstance/axioInstance';
//import { endpoints } from 'src/api/endpoints';
import { PrivacyPolicyQueryEnum } from './key';
import { TPrivacyPolicyModel } from './schema';

import axiosInstance from '@/api/axiosInstance/axiosInstance';
import { endpoints } from '@/api/endpoints/endpoints';

export const useGetPrivacyPolicy = () => {
  return useQuery<TPrivacyPolicyModel['getPrivacyPolicyResponse'], Error>({
    queryKey: [PrivacyPolicyQueryEnum.PrivacyPolicyGet],
    queryFn: async () => {
      const res = await axiosInstance.get<TPrivacyPolicyModel['getPrivacyPolicyResponse']>(
        `${endpoints.cms.privacyPolicy.get}`,
      );

      return res?.data;
    },
  });
};

export const useUpdatePrivacyPolicy = () => {
  return useMutation<
    TPrivacyPolicyModel['getPrivacyPolicyResponse'],
    Error,
    TPrivacyPolicyModel['IPrivacyPolicyCreatePayload']
  >({
    mutationKey: [PrivacyPolicyQueryEnum.PrivacyPolicyUpdate],
    mutationFn: async (payload: TPrivacyPolicyModel['IPrivacyPolicyCreatePayload']) => {
      const res = await axiosInstance.post<TPrivacyPolicyModel['getPrivacyPolicyResponse']>(
        endpoints.cms.privacyPolicy.update,
        payload,
      );

      return res?.data;
    },
  });
};
