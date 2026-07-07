import { AuthError, User } from '@supabase/supabase-js';

export type TProfileSchema = {
  IProfileUpdatePayload: {
    fullName?: string;
    phone?: string;
    email?: string;
    profileImage?: File | string;
  };

  IProfileUpdateResponse: {
    user: User | null;
    error: AuthError | null;
  };

  IPasswordChangePayload: {
    currentPassword: string;
    password: string;
  };

  IPasswordUpdateResponse: {
    statusCode: number;
    message: string;
    data: User | null;
  };
};
