'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify-icon/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';


import { useAuthResetPasswordHook } from '@/api/hooks/auth/hooks';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { projectConfig } from '@/config/project-config';
import { ROUTES } from '@/navigation/sidebar/routes';
import { createClient } from '@/utils/supabase/client';

const FormSchema = z
  .object({
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Confirm Password must be at least 6 characters long' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type Props = {
  token: string;
};

export default function ResetPasswordPage({ token }: Props) {
  const router = useRouter();
  const { resetPassword, loading, error } = useAuthResetPasswordHook();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Parse the hash token if Supabase fails to do it automatically
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        const supabase = createClient();
        supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
          if (!error) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        });
      }
    }
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const success = await resetPassword(data.password);
    if (success) {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.replace(ROUTES.auth.login);
      toast.success('Password changed successfully, please login with updated credentials.');
    } else {
      toast.error(error || 'Failed to reset password');
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      {/* Left Side - Image/Banner Section */}
      <div className="relative hidden border-r border-slate-100 lg:flex lg:w-1/2">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/login-banner.webp"
            alt="Login Banner"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-6 sm:p-12 md:p-20">
        <div className="w-full max-w-[400px] space-y-8">
            
          {/* Mobile Logo Visibility */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
              <Image
                src={projectConfig.logo}
                alt={projectConfig.name}
                width={40}
                height={40}
                priority
                className="h-auto w-auto object-contain"
              />
            </div>
          </div>

          {/* Header Section */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Reset Password? 🔒
            </h1>
            <p className="font-medium text-slate-500">
                Set your new password below.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-bold tracking-tight text-slate-700">
                        New Password
                    </FormLabel>
                    <FormControl>
                      <div className="group relative">
                        <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors">
                          <Icon icon="tabler:lock" className="" />
                        </div>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          className="focus:ring-primary/20 focus:border-primary h-12 rounded-xl border-slate-200 bg-slate-50/50 pr-11 pl-11 transition-all focus:bg-white focus:ring-2"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600"
                        >
                          <Icon
                            icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'}
                            className=""
                          />
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-rose-500" />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-bold tracking-tight text-slate-700">
                        Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="group relative">
                        <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors">
                          <Icon icon="tabler:lock" className="" />
                        </div>
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          className="focus:ring-primary/20 focus:border-primary h-12 rounded-xl border-slate-200 bg-slate-50/50 pr-11 pl-11 transition-all focus:bg-white focus:ring-2"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-600"
                        >
                          <Icon
                            icon={showConfirm ? 'tabler:eye-off' : 'tabler:eye'}
                            className=""
                          />
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium text-rose-500" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 shadow-primary/20 h-12 w-full rounded-xl text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <Icon icon="tabler:loader-2" className="mr-2 animate-spin" />
                ) : (
                  <Icon icon="tabler:lock-open" className="mr-2" />
                )}
                  Set New Password
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <Link
              href={ROUTES.auth.login}
              className="text-primary hover:text-primary/80 text-sm font-bold transition-colors flex items-center justify-center gap-1"
            >
              <Icon icon="tabler:arrow-left" className="w-4 h-4" />
                Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
