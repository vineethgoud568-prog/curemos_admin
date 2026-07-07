'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify-icon/react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import {
  FieldArrayWithId,
  useFieldArray,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useForm,
} from 'react-hook-form';
import { toast } from 'sonner';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { useGetBanner, useUpsertBanner } from '@/api/hooks/banner/hooks';
import { MediaUploader } from '@/components/shared/media-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  bannerFormSchema,
  createEmptyBannerSlide,
  mapBannerToFormValues,
  TBannerFormValues,
} from '@/module/banner/zod/banner.schema';

const FIVE_MB = 5 * 1024 * 1024;
const MAX_IMAGE_UPLOAD = 1;
type TSlideFieldName = 'banner_slides' | 'home_slides';

const SECTION_STYLES = [
  {
    key: 'banner',
    title: 'Banner Section',
    description: 'Update the main promotional banner content shown in the app.',
    icon: 'mdi:image-filter-hdr',
  },
  {
    key: 'home',
    title: 'Home Section',
    description:
      'Control the supporting home section content with its own visual and descriptive messaging.',
    icon: 'mdi:home-variant-outline',
  },
] as const;

type TSectionStyle = (typeof SECTION_STYLES)[number];

export default function BannerManagementForm() {
  const { data: banners, isLoading } = useGetBanner();
  const { mutate: upsertBanner, isPending } = useUpsertBanner();

  const form = useForm<TBannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: mapBannerToFormValues(),
  });
  const bannerSlideArray = useFieldArray({
    control: form.control,
    name: 'banner_slides',
  });
  const homeSlideArray = useFieldArray({
    control: form.control,
    name: 'home_slides',
  });

  useEffect(() => {
    form.reset(mapBannerToFormValues(banners));
  }, [banners, form]);

  const handleSubmit = (values: TBannerFormValues) => {
    upsertBanner(
      { data: values },
      {
        onSuccess: () => {
          toast.success('Banners saved successfully');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to save banners');
        },
      },
    );
  };

  const handleReset = () => {
    form.reset(mapBannerToFormValues(banners));
  };

  const renderSection = (
    section: TSectionStyle,
    fields: FieldArrayWithId<TBannerFormValues, TSlideFieldName, 'id'>[],
    append: UseFieldArrayAppend<TBannerFormValues, TSlideFieldName>,
    remove: UseFieldArrayRemove,
  ) => {
    const isBanner = section.key === 'banner';
    const slidesName: TSlideFieldName = isBanner ? 'banner_slides' : 'home_slides';
    const sectionLabel = isBanner ? 'Banner' : 'Home';
    const sectionErrors = form.formState.errors[slidesName];

    return (
      <Card key={section.key} className="border-slate-200/70 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-2xl">
              <Icon icon={section.icon} width={22} />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-slate-900">
                {section.title}
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-500">
                {section.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{sectionLabel} Slides</h3>
                  <p className="text-xs text-slate-500">Minimum one image is required per slide.</p>
                </div>
                <FormField
                  control={form.control}
                  name={isBanner ? 'banner_slide_speed' : 'home_slide_speed'}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{sectionLabel} Slides speed (in sec)</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-11" placeholder="Enter speed in second..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-fit"
                onClick={() => append(createEmptyBannerSlide())}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {typeof sectionErrors?.message === 'string' ? (
              <p className="text-destructive text-sm font-medium">{sectionErrors.message}</p>
            ) : null}

            {fields.map((slide, index) => {
              return (
                <div
                  key={slide.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {sectionLabel} Slide {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:text-red-600"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      aria-label={`Remove ${sectionLabel.toLowerCase()} slide ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <FormField
                      control={form.control}
                      name={`${slidesName}.${index}.image`}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormControl>
                            <MediaUploader
                              label={`${sectionLabel} Image`}
                              value={field.value}
                              onChange={(value) => {
                                form.setValue(field.name, value, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                });
                              }}
                              error={fieldState.error?.message}
                              acceptedTypes={['image']}
                              maxSize={FIVE_MB}
                              maxFiles={MAX_IMAGE_UPLOAD}
                              description="Accepted: PNG, JPG, JPEG, or WEBP. Maximum file size 5MB."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div>
                      <FormField
                        control={form.control}
                        name={`${slidesName}.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{sectionLabel} Title</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11" placeholder="Enter title..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`${slidesName}.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{sectionLabel} Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={6} placeholder="Enter description..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`${slidesName}.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{sectionLabel} Url</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11" placeholder="Enter url..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 lg:p-6">
        <PageCardHeader title="Banners Management" hideAddButton />
        <Card className="border-slate-200/70 shadow-sm">
          <CardContent className="flex h-72 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading banner settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageCardHeader title="Banners Management" hideAddButton backButton />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {renderSection(
            SECTION_STYLES[0],
            bannerSlideArray.fields,
            bannerSlideArray.append,
            bannerSlideArray.remove,
          )}
          {renderSection(
            SECTION_STYLES[1],
            homeSlideArray.fields,
            homeSlideArray.append,
            homeSlideArray.remove,
          )}

          <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6"
              onClick={handleReset}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button type="submit" className="h-11 px-6" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
