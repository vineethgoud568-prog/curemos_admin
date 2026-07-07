import { TCommonSchema } from '@/types/common/common.schema';

export type TTermsConditionsModel = {
  ITermsConditionsResponseBody: {
    termCondition: string;
  };
  ITermsConditionsCreatePayload: TTermsConditionsModel['ITermsConditionsResponseBody'];

  getTermsConditionsResponse: TCommonSchema['BaseApiResponse'] & {
    data: TTermsConditionsModel['ITermsConditionsResponseBody'];
  };
};
