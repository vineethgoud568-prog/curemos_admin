'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify-icon/react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useGetLegalPageBySlug, useUpsertLegalPage } from '@/api/hooks/legalPages/hook';
import { TLegalPageSlug } from '@/api/hooks/legalPages/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Switch } from '@/components/ui/switch';
import {
  legalPageFormSchema,
  mapLegalPageFormToPayload,
  TLegalPageFormValues,
} from '@/module/legalPages/zod/legalPage.schema';
import { ROUTES } from '@/navigation/sidebar/routes';

interface LegalPageEditFormProps {
  slug: TLegalPageSlug;
  pageTitle: string;
  pageDescription: string;
  icon: string;
}

export default function LegalPageEditForm({
  slug,
  pageTitle,
  pageDescription,
  icon,
}: LegalPageEditFormProps) {
  const { data: legalPage, isLoading } = useGetLegalPageBySlug(slug);
  const { mutate: upsertPage, isPending } = useUpsertLegalPage();

  const form = useForm<TLegalPageFormValues>({
    resolver: zodResolver(legalPageFormSchema),
    defaultValues: {
      title: '',
      content: '',
      is_published: true,
    },
  });

  // Populate form once data is fetched
  useEffect(() => {
    if (legalPage) {
      form.reset({
        title: legalPage.title ?? '',
        content: legalPage.content ?? '',
        is_published: legalPage.is_published ?? true,
      });
    }
  }, [legalPage, form]);

  const onSubmit = (values: TLegalPageFormValues) => {
    const payload = mapLegalPageFormToPayload(values, slug);
    upsertPage(payload, {
      onSuccess: () => {
        toast.success(`${pageTitle} saved successfully`);
      },
      onError: (err) => {
        toast.error(err.message ?? 'Failed to save. Please try again.');
      },
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.faq.list}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <Icon icon="mdi:arrow-left" width={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Icon icon={icon} width={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
            <p className="text-sm text-slate-500">{pageDescription}</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <Card className="border-slate-200/60 shadow-sm">
          <CardContent className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading content...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Content Card */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-semibold text-slate-800">
                  Page Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder={`e.g. ${pageTitle}`} className="h-11" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-400">
                        Displayed as the main title on the public page.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rich Text Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Start writing the page content..."
                          minHeight="400px"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-semibold text-slate-800">
                  Publication Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-semibold text-slate-800">
                          Published
                        </FormLabel>
                        <FormDescription className="text-xs text-slate-500">
                          When enabled, this page will be visible to users in the app.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pb-6">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-8"
                onClick={() => form.reset()}
                disabled={isPending}
              >
                Reset
              </Button>
              <Button type="submit" className="h-11 px-10" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
