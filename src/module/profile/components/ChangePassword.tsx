'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify-icon/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { passwordSchema, TPasswordFormValues } from '../zod/profile.zod';

import { profileService } from '@/api/hooks/profile/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export function ChangePasswordForm() {
  const { mutate, isPending } = profileService.useChangePassHook();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<TPasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: TPasswordFormValues) => {
    mutate(
      {
        currentPassword: data.currentPassword,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success('Password changed successfully');
          form.reset();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to change password');
        },
      },
    );
  };

  return (
    <Card className="border-border/60 bg-card/60 shadow-primary/5 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-7 sm:p-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-wider text-amber-600/80 uppercase">
            Security
          </p>
          <CardTitle className="text-lg font-bold sm:text-xl">Change Password</CardTitle>
        </div>
        <Badge
          variant="outline"
          className="border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 sm:px-3 sm:py-1 sm:text-xs"
        >
          Protected
        </Badge>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
          {/* Left Side - Requirements */}
          <div className="border-border/40 self-start rounded-2xl border bg-white/40 p-5 shadow-sm sm:p-6 lg:col-span-4">
            <div className="mb-4 flex items-center justify-between sm:mb-6">
              <h3 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase sm:text-xs">
                Requirements
              </h3>
              <Badge
                variant="outline"
                className="border-amber-200/50 bg-amber-100/50 px-2 py-0 text-[9px] font-bold text-amber-700 sm:text-[10px]"
              >
                STRONG
              </Badge>
            </div>
            <Separator className="mb-4 opacity-40 sm:mb-6" />
            <ul className="space-y-3 text-left sm:space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span className="text-[11px] leading-relaxed font-medium text-slate-600 sm:text-xs">
                  Minimum 8 characters long.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span className="text-[11px] leading-relaxed font-medium text-slate-600 sm:text-xs">
                  Upper & lowercase characters.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span className="text-[11px] leading-relaxed font-medium text-slate-600 sm:text-xs">
                  At least one number & symbol.
                </span>
              </li>
            </ul>
          </div>

          {/* Right Side - Form */}
          <div className="lg:col-span-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="mb-6 space-y-1">
                  <h3 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase sm:text-xs">
                    Set New Password
                  </h3>
                  <p className="text-muted-foreground text-[10px] font-medium sm:text-[11px]">
                    Make sure it's different from your old one.
                  </p>
                </div>

                <div className="grid gap-5 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-slate-700 sm:text-xs">
                          Old Password <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="relative">
                          <Icon
                            icon="lucide:lock"
                            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                          />
                          <FormControl>
                            <Input
                              type={showCurrentPassword ? 'text' : 'password'}
                              placeholder="Enter Old Password..."
                              className="border-border/40 h-10 rounded-xl bg-white/50 pr-10 pl-10 text-sm transition-all focus:border-amber-400/50 focus:ring-amber-400/10 sm:h-11"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                          >
                            <Icon
                              icon={showCurrentPassword ? 'lucide:eye-off' : 'lucide:eye'}
                              className="h-4 w-4"
                            />
                          </button>
                        </div>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-bold text-slate-700 sm:text-xs">
                            New Password <span className="text-red-500">*</span>
                          </FormLabel>
                          <div className="relative">
                            <Icon
                              icon="lucide:lock"
                              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                            />
                            <FormControl>
                              <Input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Enter New Password..."
                                className="border-border/40 h-10 rounded-xl bg-white/50 pr-10 pl-10 text-sm transition-all focus:border-amber-400/50 focus:ring-amber-400/10 sm:h-11"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                            >
                              <Icon
                                icon={showNewPassword ? 'lucide:eye-off' : 'lucide:eye'}
                                className="h-4 w-4"
                              />
                            </button>
                          </div>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-bold text-slate-700 sm:text-xs">
                            Confirm Password <span className="text-red-500">*</span>
                          </FormLabel>
                          <div className="relative">
                            <Icon
                              icon="lucide:lock"
                              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                            />
                            <FormControl>
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Enter Confirm Password..."
                                className="border-border/40 h-10 rounded-xl bg-white/50 pr-10 pl-10 text-sm transition-all focus:border-amber-400/50 focus:ring-amber-400/10 sm:h-11"
                                {...field}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                            >
                              <Icon
                                icon={showConfirmPassword ? 'lucide:eye-off' : 'lucide:eye'}
                                className="h-4 w-4"
                              />
                            </button>
                          </div>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:gap-4">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-10 w-full rounded-xl bg-amber-600 px-8 font-bold text-white shadow-lg shadow-amber-600/20 transition-all hover:bg-amber-700 active:scale-95 sm:h-11 sm:w-auto"
                  >
                    {isPending && <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => form.reset()}
                    className="h-10 w-full rounded-xl border-none bg-slate-100 px-8 text-slate-600 transition-all hover:bg-slate-200 sm:h-11 sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
