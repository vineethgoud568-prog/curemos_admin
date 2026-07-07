import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CategoryQueryEnum } from './key';
import { TCategoryModel } from './schema';

import axiosInstance from '@/api/axiosInstance/axiosInstance';
import { endpoints } from '@/api/endpoints/endpoints';
import { TCommonSchema } from '@/types/common/common.schema';

export const useCategoryGetAll = (payload: TCommonSchema['BaseApiPaginationPayload']) => {
  return useQuery<TCategoryModel['getAllCategorySuccessResponse'], Error>({
    queryKey: [CategoryQueryEnum.CategoryGetAll, JSON.stringify(payload)],
    queryFn: async () => {
      const res = await axiosInstance.post<TCategoryModel['getAllCategorySuccessResponse']>(
        endpoints.category.all,
        payload,
      );

      return res?.data;
    },
  });
};

export const useGetCategory = (id: string | string[] | undefined) => {
  return useQuery<TCategoryModel['getCategoryResponseById'], Error>({
    queryKey: [CategoryQueryEnum.CategoryGet],
    queryFn: async () => {
      const res = await axiosInstance.get<TCategoryModel['getCategoryResponseById']>(
        `${endpoints.category.get}/${id}`,
      );

      return res?.data;
    },
    enabled: !!id,
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TCategoryModel['getCategoryResponseById'],
    Error,
    TCategoryModel['ICategoryUpdatePayload']
  >({
    mutationKey: [CategoryQueryEnum.CategoryUpdate],
    mutationFn: async (payload: TCategoryModel['ICategoryUpdatePayload']) => {
      // console.log(payload)
      const res = await axiosInstance.patch<TCategoryModel['getCategoryResponseById']>(
        `${endpoints.category.update}/${payload.id}`,
        payload.data,
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CategoryQueryEnum.CategoryGetAll],
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<TCategoryModel['ICategoryDeleteResponse'], Error, string>({
    mutationKey: [CategoryQueryEnum.CategoryDelete],
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete<TCategoryModel['ICategoryDeleteResponse']>(
        `${endpoints.category.delete}/${id}`,
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CategoryQueryEnum.CategoryGetAll],
      });
    },
  });
};

export const useSaveCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TCategoryModel['getCategoryResponseById'],
    Error,
    TCategoryModel['ICategoryCreatePayload']
  >({
    mutationKey: [CategoryQueryEnum.CategorySave],
    mutationFn: async (payload: TCategoryModel['ICategoryCreatePayload']) => {
      const res = await axiosInstance.post<TCategoryModel['getCategoryResponseById']>(
        endpoints.category.create,
        payload,
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CategoryQueryEnum.CategoryGetAll],
      });
    },
  });
};

export const useStatusChangeCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TCategoryModel['getCategoryResponseById'],
    Error,
    TCategoryModel['ICategoryStatusPayload']
  >({
    mutationKey: [CategoryQueryEnum.CategoryStatusChange],
    mutationFn: async (payload: TCategoryModel['ICategoryStatusPayload']) => {
      const res = await axiosInstance.patch<TCategoryModel['getCategoryResponseById']>(
        `${endpoints.category.status}/${payload.id}`,
        { status: payload.status },
      );

      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CategoryQueryEnum.CategoryGetAll],
      });
    },
  });
};
