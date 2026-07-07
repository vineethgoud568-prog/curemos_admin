import { z } from 'zod';

import { TBannerPayload } from '@/api/hooks/banner/schema';
import { imageField } from '@/lib/schema/fileField';
import textField from '@/lib/schema/textField';

const slideSchema = z.object({
  image: imageField({ multiple: true, min: 1, max: 1 }),
  title: textField('Title', { required: false, max: 120 }),
  description: textField('Description', { required: false, max: 500 }),
  url: z
    .string()
    .trim()
    .max(500, 'Url must be less than 500 characters')
    .optional()
    .refine(
      (value) => {
        if (!value) return true;

        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'Please enter a valid URL',
      },
    ),
});

const sliderSectionSchema = (label: string) =>
  z.array(slideSchema).min(1, `At least one ${label} slide is required`);

export const bannerFormSchema = z.object({
  banner_slides: sliderSectionSchema('banner'),
  banner_slide_speed: z.string().min(1, 'Slide speed is required'),
  home_slides: sliderSectionSchema('home'),
  home_slide_speed: z.string().min(1, 'Slide speed is required'),
});

export type TBannerFormValues = z.infer<typeof bannerFormSchema>;
export type TBannerSlideFormValues = TBannerFormValues['banner_slides'][number];

const EMPTY_SLIDE: TBannerSlideFormValues = {
  image: [],
  title: '',
  description: '',
  url: '',
};

export const createEmptyBannerSlide = (): TBannerSlideFormValues => ({
  ...EMPTY_SLIDE,
});

const normalizeImageList = (value: string[] | string | null | undefined) => {
  const items = Array.isArray(value) ? value : value ? [value] : [];

  return items.filter((item): item is string => Boolean(item?.trim()));
};

const mapSectionToSlides = (rows: Partial<TBannerPayload>[] | undefined) => {
  if (!rows?.length) return [createEmptyBannerSlide()];

  return rows.map((row) => ({
    image: normalizeImageList(row.image),
    title: row.title?.trim() || '',
    description: row.description?.trim() || '',
    url: row.url?.trim() || '',
  }));
};

const hasSlug = (row: Partial<TBannerPayload>, slug: string) => row.slug === slug;

export const mapBannerToFormValues = (
  rows?: Partial<TBannerPayload>[] | null,
): TBannerFormValues => {
  const bannerRows = rows?.filter((row) => hasSlug(row, 'banner'));
  const homeRows = rows?.filter((row) => hasSlug(row, 'home'));

  return {
    banner_slides: mapSectionToSlides(bannerRows),
    banner_slide_speed: bannerRows?.[0]?.slide_speed || '',
    home_slides: mapSectionToSlides(homeRows),
    home_slide_speed: homeRows?.[0]?.slide_speed || '',
  };
};
