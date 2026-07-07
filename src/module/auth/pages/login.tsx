'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify-icon/react';
import { ReloadIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import LoginWrapper from '../components/LoginWrapper';

import { useAuthLoginHook, useAuthPermissionHook } from '@/api/hooks/auth/hooks';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { rememberMeKey } from '@/lib/constants';
import { encryptedLS } from '@/lib/functions/localStorage.lib';
import { ROUTES } from '@/navigation/sidebar/routes';

const FormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().default(false),
});

type TLoginFormValues = z.infer<typeof FormSchema>;

export default function Loginpage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
          <ReloadIcon className="h-8 w-8 animate-spin text-slate-800" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const { login, loading, error } = useAuthLoginHook();
  const { getPermissions } = useAuthPermissionHook();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true);

  const form = useForm<TLoginFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const { reset, handleSubmit } = form;

  // Load saved credentials on mount
  useEffect(() => {
    const saved = encryptedLS.get<TLoginFormValues>(rememberMeKey);
    if (saved) {
      reset(saved);
    }
    setIsLoadingCredentials(false);
  }, [reset]);

  const onSubmit = async (data: TLoginFormValues) => {
    const res = await login({ email: data.email, password: data.password });

    if (!res) {
      toast.error(error || 'Login failed');
      return;
    }
    await getPermissions(res.user.id);

    // Handle Remember Me
    if (data.rememberMe) {
      encryptedLS.set(rememberMeKey, data);
    } else {
      encryptedLS.remove(rememberMeKey);
    }

    toast.success('Signed in successfully');
    router.refresh();
    router.push(callbackUrl ?? ROUTES.dashboard);
  };

  return (
    <LoginWrapper>
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

        {/* Right Side - Login Form Section */}
        <div className="flex flex-1 flex-col items-center justify-center bg-white p-6 sm:p-12 md:p-20">
          <div className="w-full max-w-[400px] space-y-8">
            {isLoadingCredentials && (
              <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md transition-all">
                <div className="relative">
                  <div className="border-t-primary h-12 w-12 animate-spin rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-primary/10 h-6 w-6 animate-pulse rounded-full" />
                  </div>
                </div>
                <p className="mt-4 animate-pulse text-sm font-semibold tracking-wide text-slate-600">
                  Syncing Secure Session...
                </p>
              </div>
            )}

            {/* Mobile Logo Visibility */}
            <div className="mb-4 flex justify-center">
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
            <div className="space-y-1 text-center">
              <h1 className="text-1.5xl sm:text-1.5xl font-extrabold tracking-tight text-slate-900">
                Welcome to Admin! 👋
              </h1>
              <p className="font-medium text-slate-500">
                Please sign-in to your account and start the adventure
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold tracking-tight text-slate-700">
                        Work Email
                      </FormLabel>
                      <FormControl>
                        <div className="group relative">
                          <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors">
                            <Icon icon="tabler:mail" className="" />
                          </div>
                          <Input
                            placeholder="Enter email"
                            className="focus:ring-primary/20 focus:border-primary h-10 rounded-xl border-slate-200 bg-slate-50/50 pl-11 transition-all focus:bg-white focus:ring-2"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-medium text-rose-500" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-bold tracking-tight text-slate-700">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="group relative">
                          <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors">
                            <Icon icon="tabler:lock" className="" />
                          </div>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            className="focus:ring-primary/20 focus:border-primary h-10 rounded-xl border-slate-200 bg-slate-50/50 pr-11 pl-11 transition-all focus:bg-white focus:ring-2"
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

                {/* Auth Actions: Remember Me & Forgot Password */}
                <div className="flex items-center justify-between py-1">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-y-0 space-x-2.5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary h-5 w-5 rounded-md border-slate-300 transition-all"
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
                          Keep me signed in
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Link
                    href={ROUTES.auth.forgetPassword}
                    className="text-primary hover:text-primary/80 text-sm font-bold transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading || isLoadingCredentials}
                  className="bg-primary hover:bg-primary/90 shadow-primary/20 mt-2 h-11 w-full rounded-xl text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Icon icon="tabler:loader-2" className="mr-2 animate-spin" />
                  ) : (
                    <Icon icon="tabler:login" className="mr-2" />
                  )}
                  Sign In to Dashboard
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </LoginWrapper>
  );
}
