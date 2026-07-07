import { UserRole } from '@/types/apps/userTypes';
import { TCommonSchema } from '@/types/common/common.schema';

export type TUserModel = {
  IDoc: {
    _id: string;
    fullName: string;
    email: string;
    userName: string;
    profileImage: string | null;
    status: string;
    createdAt: string;
  };
  IUserGetAllPayload: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortOrder?: string;
  };
  IUserGetAllResponse: {
    meta: TCommonSchema['BaseMetaResponse'];
    docs: TUserModel['IDoc'][];
  };
  IUserSavePayload: FormData;
  IUserUpdatePayload: FormData;
  IUserStatusChangePayload: {
    status: string;
    id: string;
  };
  IUserDeletePayload: {
    id: string;
  };
  IUserGetRolePayload: {
    roleGroup: string;
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortOrder?: string;
  };
  IUserPassWordChangePayload: {
    currentPassword: string;
    password: string;
    id: string;
  };
  IAdminResponseBody: {
    _id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    userName: string;
    profileImage: string;
    isEmailVerified: boolean;
    status: string;
    createdAt: string; // ISO date string
  };
  IAdminDeleteResponse: {
    statusCode: number;
    message: string;
  };
  getUserAdminResponseById: TCommonSchema['BaseApiResponse'] & {
    data: TUserModel['IAdminResponseBody'];
  };
  getAllUserAdminSuccessResponse: TCommonSchema['BaseApiResponse'] & {
    data: TUserModel['IUserGetAllResponse'];
  };
};

export type TUserFrontEndModel = {
  IDoc: {
    _id: string;
    fullName: string;
    email: string;
    userName: string;
    profileImage: string | null;
    status: string;
    createdAt: string;
    address: string;
  };
  IUserGetAllPayload: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortOrder?: string;
  };
  IUserGetAllResponse: {
    meta: TCommonSchema['BaseMetaResponse'];
    docs: TUserFrontEndModel['IDoc'][];
  };
  IUserSavePayloadFromData: FormData;
  IUserSavePayload: {
    fullName: string;
    email: string;
    userName: string;
    password: string;
    profileImage: string | null;
    role: string;
  };
  IUserUpdatePayload: {
    id: string;
    fullName: string;
    email: string;
    userName: string;
    profileImage: string | null;
    role: string;
  };
  IUserStatusChangePayload: {
    status: string;
    id: string;
  };
  IUserDeletePayload: {
    id: string;
  };
  IUserGetRolePayload: {
    roleGroup: string;
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortOrder?: string;
  };
  IUserFrontendResponseBody: {
    _id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    userName: string;
    profileImage: string;
    isEmailVerified: boolean;
    status: string;
    createdAt: string;
  };
  IUserFrontendDeleteResponse: {
    statusCode: number;
    message: string;
  };
  getUserFrontendResponseById: TCommonSchema['BaseApiResponse'] & {
    data: TUserFrontEndModel['IUserFrontendResponseBody'];
  };
  getAllUserFrontendSuccessResponse: TCommonSchema['BaseApiResponse'] & {
    data: TUserFrontEndModel['IUserGetAllResponse'];
  };
};
