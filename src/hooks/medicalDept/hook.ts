import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { UsersQueryEnum } from './key';
import { TModel } from './schema';

import axiosInstance from '@/api/axiosInstance/axiosInstance';
import { endpoints } from '@/api/endpoints/endpoints';
import { TCommonSchema } from '@/types/common/common.schema';

export const useGetAllUsers = (payload: TCommonSchema['BaseApiPaginationPayload']) => {
  return useQuery<TModel['getAllSuccessResponse'], Error>({
    queryKey: [UsersQueryEnum.usersAll, payload],
    queryFn: async () => {
      const res = await axiosInstance.post<TModel['getAllSuccessResponse']>(
        endpoints.user.users.all,
        payload,
      );

      return res.data;
    },
  });
};
export const useGetUserDetails = (id: string) => {
  return useQuery<TModel['getResponseById'], Error>({
    queryKey: [UsersQueryEnum.userGet, id],
    queryFn: async () => {
      const res = await axiosInstance.get<TModel['getResponseById']>(
        `${endpoints.user.users.get}/${id}`,
      );

      return res?.data;
    },
    // refetchOnMount: true,
    enabled: !!id,
  });
};
export const useUsersStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation<TModel['getResponseById'], Error, TModel['IStatusChangePayload']>({
    mutationKey: [UsersQueryEnum.userStatusChange],
    mutationFn: async (payload: TModel['IStatusChangePayload']) => {
      const res = await axiosInstance.patch<TModel['getResponseById']>(
        `${endpoints.user.users.status}/${payload.id}`,
        { status: payload.status },
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [UsersQueryEnum.usersAll],
      });
    },
  });
};

export const useUserDelete = () => {
  const queryClient = useQueryClient();

  return useMutation<TModel['IDeleteResponse'], Error, string>({
    mutationKey: [UsersQueryEnum.userDelete],
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete<TModel['IDeleteResponse']>(
        `${endpoints.user.users.delete}/${id}`,
        {
          data: { isDeleted: true },
        },
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [UsersQueryEnum.usersAll],
      });
    },
  });
};

export const UsersService = {
  useGetAllUsers,
  useUsersStatusChange,
  useUserDelete,
};
