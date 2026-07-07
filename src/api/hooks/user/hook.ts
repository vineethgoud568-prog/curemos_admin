import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { UserQueryEnum } from './key';
import { TUserFrontEndModel, TUserModel } from './schema';

import axiosInstance from '@/api/axiosInstance/axiosInstance';
import { endpoints } from '@/api/endpoints/endpoints';
import { TCommonSchema } from '@/types/common/common.schema';

export const useFontEndGetAllusers = (payload: TCommonSchema['BaseApiPaginationPayload']) => {
  return useQuery<TUserFrontEndModel['getAllUserFrontendSuccessResponse'], Error>({
    queryKey: [UserQueryEnum.UserAll, JSON.stringify(payload)],
    queryFn: async () => {
      const res = await axiosInstance.post<TUserFrontEndModel['getAllUserFrontendSuccessResponse']>(
        endpoints.user.fontend.all,
        payload,
      );

      return res?.data;
    },
  });
};

export const useGetUser = (id: string | string[] | undefined) => {
  return useQuery<TUserModel['getUserAdminResponseById'], Error>({
    queryKey: [UserQueryEnum.UserGet, id],
    queryFn: async () => {
      const res = await axiosInstance.get<TUserModel['getUserAdminResponseById']>(
        `${endpoints.user.users.get}/${id}`,
      );

      return res?.data;
    },
    enabled: !!id,
  });
};

export const useFrontEndUserSave = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TUserFrontEndModel['getUserFrontendResponseById'],
    Error,
    TUserFrontEndModel['IUserSavePayloadFromData']
  >({
    mutationKey: [UserQueryEnum.UserSave],
    mutationFn: async (payload: TUserFrontEndModel['IUserSavePayloadFromData']) => {
      const res = await axiosInstance.post<TUserFrontEndModel['getUserFrontendResponseById']>(
        endpoints.user.fontend.save,
        payload,
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [UserQueryEnum.UserAll],
      });
    },
  });
};

export const useFrontEndUserDelete = () => {
  const queryClient = useQueryClient();

  return useMutation<TUserFrontEndModel['IUserFrontendDeleteResponse'], Error, string>({
    mutationKey: [UserQueryEnum.UserDelete],
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete<TUserFrontEndModel['IUserFrontendDeleteResponse']>(
        `${endpoints.user.fontend.delete}/${id}`,
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [UserQueryEnum.UserAll],
      });
    },
  });
};

export const useFrontEndUserUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TUserFrontEndModel['getUserFrontendResponseById'],
    Error,
    TUserFrontEndModel['IUserSavePayloadFromData']
  >({
    mutationKey: [UserQueryEnum.UserUpdate],
    mutationFn: async (payload: TUserFrontEndModel['IUserSavePayloadFromData']) => {
      const res = await axiosInstance.put<TUserFrontEndModel['getUserFrontendResponseById']>(
        endpoints.user.fontend.update,
        payload,
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [UserQueryEnum.UserAll],
      });
    },
  });
};

export const useFrontEndUserStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TUserFrontEndModel['getUserFrontendResponseById'],
    Error,
    TUserFrontEndModel['IUserStatusChangePayload']
  >({
    mutationKey: [UserQueryEnum.UserStatusChange],
    mutationFn: async (payload: TUserFrontEndModel['IUserStatusChangePayload']) => {
      const res = await axiosInstance.put<TUserFrontEndModel['getUserFrontendResponseById']>(
        endpoints.user.fontend.status,
        payload,
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [UserQueryEnum.UserAll],
      });
    },
  });
};
export const useUserChangeStatus = () => {
  return useMutation<
    TUserModel['getUserAdminResponseById'],
    Error,
    TUserModel['IUserStatusChangePayload']
  >({
    mutationKey: [UserQueryEnum.UserStatusChange],
    mutationFn: async (payload: TUserModel['IUserStatusChangePayload']) => {
      const res = await axiosInstance.patch<TUserModel['getUserAdminResponseById']>(
        `${endpoints.user.users.status}/${payload.id}`,
        { status: payload.status },
      );

      return res?.data;
    },
  });
};

export const useAdminPasswordUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TUserModel['getUserAdminResponseById'],
    Error,
    TUserModel['IUserPassWordChangePayload']
  >({
    mutationKey: [UserQueryEnum.UserPasswordUpdate],
    mutationFn: async (payload: TUserModel['IUserPassWordChangePayload']) => {
      const res = await axiosInstance.put<TUserModel['getUserAdminResponseById']>(
        endpoints.user.users.changePassword,
        payload,
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [UserQueryEnum.UserAll],
      });
    },
  });
};

export const userService = {
  useFontEndGetAllusers,
  useGetUser,
  useFrontEndUserSave,
  useFrontEndUserDelete,
  useFrontEndUserUpdate,
  useFrontEndUserStatusChange,
  useUserChangeStatus,
  useAdminPasswordUpdate,
};
