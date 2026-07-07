import { TCommonSchema } from '@/types/common/common.schema';

export type TCategoryModel = {
  IDoc: {
    _id: string;
    name: string;
    status: string;
    createdAt: string;
    description: string;
    categoryImage: string;
  };
  ICategoryGetAllPayload: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortOrder?: string;
    parentId?: string;
  };
  ICategoryGetAllResponse: {
    meta: TCommonSchema['BaseMetaResponse'];
    docs: TCategoryModel['IDoc'][];
  };
  ICategoryUpdatePayload: {
    id?: string;
    data: FormData;
  };
  ICategoryStatusPayload: {
    status: string;
    id: string | null;
  };
  ICategoryCreatePayload: FormData;

  ICategoryResponseBody: {
    _id: string;
    name: string;
    description: string;
    categoryImage: File | string;
    status: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    parentId: unknown;
  };
  ICategoryDeleteResponse: {
    statusCode: number;
    message: string;
  };
  getCategoryResponseById: TCommonSchema['BaseApiResponse'] & {
    data: TCategoryModel['ICategoryResponseBody'];
  };
  getAllCategorySuccessResponse: TCommonSchema['BaseApiResponse'] & {
    data: TCategoryModel['ICategoryGetAllResponse'];
  };
};
