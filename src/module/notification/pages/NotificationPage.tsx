'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useSendNotification } from '../hooks/notification.hooks';
import { notificationSchema, TNotificationForm } from '../zod/notification.schema';

import { TableTabFilter } from '@/@core/components/Table/tanstack-table/TableTabFilter';
import { MediaUploader } from '@/components/shared/media-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const DOCTOR_TYPE_TABS = [
  { label: 'All Doctors', value: 'doctor_a' },
  { label: 'All Curemos Doctors', value: 'doctor_b' },
];

export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState('doctor_a');

  const { mutate: sendNotification, isPending: isSending } = useSendNotification();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TNotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
    },
  });

  const imageValue = watch('image');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageValue instanceof File) {
      const url = URL.createObjectURL(imageValue);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof imageValue === 'string' && imageValue.startsWith('http')) {
      setPreviewUrl(imageValue);
    } else {
      setPreviewUrl(null);
    }
  }, [imageValue]);

  const onTabChange = (value: string) => {
    setActiveTab(value);
  };

  const onSubmit = async (data: TNotificationForm) => {
    sendNotification(
      { ...data, role: activeTab },
      {
        onSuccess: () => {
          toast.success('Notification sent successfully!');
          reset();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to send notification');
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/50 p-6 text-slate-900">
      <div className="mb-6 flex w-full max-w-full shrink-0 items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Push Notifications</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 flex-1 overflow-y-auto pr-1">
        <div className="lg:col-span-8">
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">Send New Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label className="mb-2 block">Target Audience</Label>
                <TableTabFilter
                  tabs={DOCTOR_TYPE_TABS}
                  value={activeTab}
                  onTabChange={onTabChange}
                  className="w-full sm:w-fit"
                />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Notification Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter notification title"
                    {...register('title')}
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-xs font-medium text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Notification Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter notification message"
                    rows={4}
                    {...register('message')}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  {errors.message && (
                    <p className="text-xs font-medium text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <MediaUploader
                    label="Notification Image"
                    description="Upload an image to be displayed in the push notification."
                    value={imageValue ? [imageValue] : []}
                    onChange={(files) => {
                      const file = files[0];
                      setValue('image', file || '');
                    }}
                    maxFiles={1}
                    className="max-w-2xl"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSending}
                    className="min-w-[120px] bg-primary hover:bg-primary/90"
                  >
                    {isSending ? 'Sending...' : 'Send Notification'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-[2.5rem] border-[8px] border-slate-800 bg-slate-900 shadow-2xl">
                <div className="h-6 w-full bg-slate-800 flex justify-center items-center">
                  <div className="w-16 h-3 bg-black rounded-full"></div>
                </div>
                <div className="aspect-[9/19] bg-slate-100 p-4">
                  <div className="mt-8 rounded-2xl bg-white/80 p-3 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">CUREMOS</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {watch('title') || 'Notification Title'}
                    </p>
                    <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">
                      {watch('message') || 'Notification message preview will appear here...'}
                    </p>
                    {previewUrl && (
                      <div className="relative mt-2 h-20 w-full overflow-hidden rounded-lg">
                        <Image src={previewUrl} fill className="object-cover" alt="Preview" unoptimized />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-slate-500 italic">
                Approximate mobile notification preview
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
