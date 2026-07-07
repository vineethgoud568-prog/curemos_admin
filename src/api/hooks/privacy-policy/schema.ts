import { TCommonSchema } from '@/types/common/common.schema';
export type TPrivacyPolicyModel = {
  IPrivacyPolicyResponseBody: {
    privacyPolicy: string;
  };
  IPrivacyPolicyCreatePayload: TPrivacyPolicyModel['IPrivacyPolicyResponseBody'];

  getPrivacyPolicyResponse: TCommonSchema['BaseApiResponse'] & {
    data: TPrivacyPolicyModel['IPrivacyPolicyResponseBody'];
  };
};
