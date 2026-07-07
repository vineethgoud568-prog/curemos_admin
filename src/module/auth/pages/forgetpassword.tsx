'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify-icon/react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import LoginWrapper from '../components/LoginWrapper';

import { useAuthForgotPasswordHook } from '@/api/hooks/auth/hooks';
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

const FormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});
const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

const defaultValues = {
  email: '',
};

export default function ForgotPassword() {
  const { forgotPassword, loading, error } = useAuthForgotPasswordHook();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const redirectTo = `${baseUrl}/auth/reset-password`;

    const success = await forgotPassword(data.email, redirectTo);

    if (success) {
      toast.success('Link sent successfully');
    } else {
      toast.error(error || 'Failed to send reset link');
    }
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
              <h1 className="text-1.5xl sm:text-1.5xl font-extrabold tracking-tight text-slate-900">
                Forgot Password?🔒
              </h1>
              <p className="font-medium text-slate-500">
                Enter your email and we will send you instructions to reset your password.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold tracking-tight text-slate-700">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="group relative">
                          <div className="group-focus-within:text-primary pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors">
                            <Icon icon="tabler:mail" className="" />
                          </div>
                          <Input
                            placeholder="Enter your email"
                            className="focus:ring-primary/20 focus:border-primary h-10 rounded-xl border-slate-200 bg-slate-50/50 pl-11 transition-all focus:bg-white focus:ring-2"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs font-medium text-rose-500" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 shadow-primary/20 h-11 w-full rounded-xl text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Icon icon="tabler:loader-2" className="mr-2 animate-spin" />
                  ) : (
                    <Icon icon="tabler:mail-forward" className="mr-2" />
                  )}
                  Send Reset Link
                </Button>
              </form>
            </Form>

            <div className="mt-2 text-center">
              <Link
                href={ROUTES.auth.login}
                className="text-primary hover:text-primary/80 flex items-center justify-center gap-1 text-sm font-bold transition-colors"
              >
                <Icon icon="tabler:arrow-left" className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </LoginWrapper>
  );
}
