import { TCommonSchema } from '@/types/common/common.schema';

export type TModel = {
  IRes: {
    _id: string;
    name: string;
    email: string;
    phone_number: string;
    createdAt: string;
    course_info: {
      course_name: string;
    };
  };
  IDoc: {
    _id: string;
    rating: string;
    review_text: string;
    fullName: string;
    email: string;
    phone: string;
    address: {
      country: string;
      state: string;
      city: string;
      zipCode: string;
    };
    status: string;
    createdAt: string;
  };
  IGetAllPayload: {
    page: number;
    limit: number;
    search?: string;
    type: string;
    status?: string;
    sortField?: string;
    sortOrder?: string;
  };
  IGetAllResponse: {
    meta: TCommonSchema['BaseMetaResponse'];
    docs: TModel['IDoc'][];
  };
  IGetAllDownloadResponse: {
    meta: TCommonSchema['BaseMetaResponse'];
    docs: TModel['IRes'][];
  };
  ISavePayload: {
    project_name: string;
    content: string;
  };
  IDeleteResponse: {
    statusCode: number;
    message: string;
  };
  IUpdatePayload: {
    id: string;
    project_name: string;
    content: string;
  };
  IStatusChangePayload: {
    id: string;
    status: string;
  };
  IResponseBody: {
    _id: string;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    role: {
      _id: string;
      role: string;
      roleDisplayName: string;
    };
    countryCode: string;
    phoneNumber: string;
    profileImage: string;
    isOtpVerified: boolean;
    privacyPolicyAccepted: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    address: Array<{
      firstName: string;
      lastName: string;
      address_line_1: string;
      address_line_2: string;
      city: string;
      state: string;
      zip_code: string;
      address_type: string;
    }>;
  };

  getResponseById: TCommonSchema['BaseApiResponse'] & {
    data: TModel['IResponseBody'];
  };
  getAllSuccessResponse: TCommonSchema['BaseApiResponse'] & {
    data: TModel['IGetAllResponse'];
  };
  getAllDownloadSuccessResponse: TCommonSchema['BaseApiResponse'] & {
    data: TModel['IGetAllDownloadResponse'];
  };
};
