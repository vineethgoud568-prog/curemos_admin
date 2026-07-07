import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

import { sanitizePayload } from '@/@core/utils/sanitizePayload';
import { baseUrlApi } from '@/api/endpoints/endpoints';
import { TCommonSchema } from '@/types/common/common.schema';
import { createClient } from '@/utils/supabase/client';

const axiosInstance = axios.create({
  baseURL: baseUrlApi,
});

// Backward compatibility helper exports for AuthContext
export const setOAuthAppAccessToken = (_accessToken: string | null) => {};
export const getOAuthAppAccessToken = () => null;

export const refreshToken = async () => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
};

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.data && typeof config.data === 'object') {
      config.data = sanitizePayload(config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<TCommonSchema['BaseApiErrorResponse']>) => {
    const apiError = error.response?.data;
    const message =
      (typeof apiError?.message === 'string'
        ? apiError?.message
        : (apiError?.message as unknown as { message?: string })?.message) ||
      'Something went wrong';

    // Prevent showing generic toast for unauthenticated status codes (401)
    if (error.response?.status !== 401) {
      const capitalizeMessage = message.charAt(0).toUpperCase() + message.slice(1);
      toast.error(capitalizeMessage);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
