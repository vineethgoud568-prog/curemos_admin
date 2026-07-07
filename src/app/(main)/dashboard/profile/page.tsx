'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify-icon/react';
import Image from 'next/image';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { mediaUrl } from '@/api/endpoints/endpoints';
import { profileService } from '@/api/hooks/profile/hooks';
import ImageUpload from '@/components/shared/ImageUpload';
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
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';
import { ChangePasswordForm } from '@/module/profile/components/ChangePassword';
import { profileSchema, TProfileFormValues } from '@/module/profile/zod/profile.zod';

export default function MyProfile() {
  const { user, refreshUser } = useAuth();
  const { mutate, isPending } = profileService.useProfileChange();

  const getUserDefaults = () => ({
    email: user?.email || '',
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage ? mediaUrl(user.profileImage) : undefined,
  });

  const form = useForm<TProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: getUserDefaults(),
  });

  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (user) {
      reset(getUserDefaults());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, reset]);

  const onSubmit = async (data: TProfileFormValues) => {
    const profileImage =
      data.profileImage instanceof File || data.profileImage === null
        ? data.profileImage
        : undefined;

    mutate(
      {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        profileImage,
      },
      {
        onSuccess: () => {
          toast.success('Profile updated successfully');
          refreshUser();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update profile');
        },
      },
    );
  };

  const isActive = (user?.status || '').toLowerCase() === 'active';

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your personal information and account security.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column - Profile Summary Card */}
            <Card className="border-border/60 bg-card/60 shadow-primary/5 h-fit shadow-lg lg:col-span-4 lg:h-full">
              <CardContent className="pt-6 sm:pt-8">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <FormField
                      control={form.control}
                      name="profileImage"
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          error={form.formState.errors.profileImage?.message as string}
                          circle={true}
                          initials={getInitials(user?.fullName || '')}
                          className="mx-auto"
                        />
                      )}
                    />
                  </div>

                  <div className="mt-2 space-y-1">
                    <h2 className="text-lg font-bold sm:text-xl">{user?.fullName || '---'}</h2>
                    <p className="text-muted-foreground text-xs break-all sm:text-sm">
                      {user?.email || '---'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {/* <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary text-[10px] sm:text-xs"
                  >
                    {user?.role?.roleDisplayName || 'User'}
                  </Badge> */}
                      <Badge
                        variant="outline"
                        className={
                          isActive
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600 sm:text-xs'
                            : 'border-red-500/20 bg-red-500/10 text-[10px] text-red-600 sm:text-xs'
                        }
                      >
                        <span
                          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}
                        />
                        {user?.status || 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6 opacity-60 sm:my-8" />

                <div className="space-y-4 px-2 text-left">
                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <Icon icon="lucide:mail" className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="font-medium break-all text-slate-600">
                      {user?.email || 'No email provided'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <Icon icon="lucide:phone" className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="font-medium text-slate-600">
                      {user?.phone || 'No phone provided'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm">
                    <Icon icon="lucide:calendar" className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="font-medium whitespace-nowrap text-slate-600">
                      Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '---'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Personal Information Card */}
            <Card className="border-border/60 bg-card/60 shadow-primary/5 shadow-lg lg:col-span-8">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg font-bold sm:text-xl">Personal Information</CardTitle>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Update your name and contact details.
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold tracking-wider text-slate-500 uppercase sm:text-xs">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            className="focus:ring-primary/10 border-border/40 h-10 rounded-xl bg-white/50 text-sm transition-all sm:h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold tracking-wider text-slate-500 uppercase sm:text-xs">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email address"
                            disabled
                            className="border-border/40 h-10 rounded-xl bg-slate-50 text-sm sm:h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-[10px] font-bold tracking-wider text-slate-500 uppercase sm:text-xs">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your phone number"
                            className="focus:ring-primary/10 border-border/40 h-10 rounded-xl bg-white/50 text-sm transition-all sm:h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row sm:pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset(getUserDefaults());
                    }}
                    disabled={isPending}
                    className="border-border/40 h-10 w-full rounded-xl bg-slate-50 px-8 font-medium transition-all hover:bg-slate-100 sm:h-11 sm:w-auto"
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="shadow-primary/20 h-10 w-full rounded-xl px-10 font-bold shadow-lg transition-all active:scale-95 sm:h-11 sm:w-auto"
                  >
                    {isPending && <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      <ChangePasswordForm />
    </div>
  );
}
