'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BannerQueryEnum, TBanner, TBannerPayload } from './schema';

import { TBannerFormValues } from '@/module/banner/zod/banner.schema';
import { createClient } from '@/utils/supabase/client';

const BANNER_BUCKET = 'banner';
const BANNER_FOLDER = 'banner';

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');

const uploadBannerAsset = async (file: File, supabase: ReturnType<typeof createClient>) => {
  const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const filePath = `${BANNER_FOLDER}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from(BANNER_BUCKET).upload(filePath, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

const resolveImageValues = async (
  values: TBannerFormValues['banner_slides'][number]['image'],
  supabase: ReturnType<typeof createClient>,
) => {
  const normalizedValues = Array.isArray(values) ? values : values ? [values] : [];

  return Promise.all(
    normalizedValues.map((value) => {
      if (value instanceof File) {
        return uploadBannerAsset(value, supabase);
      }

      return value;
    }),
  );
};

const buildSlidePayload = async (
  slides: TBannerFormValues['banner_slides'],
  slide_speed: string,
  supabase: ReturnType<typeof createClient>,
  slug: 'banner' | 'home',
) => {
  return Promise.all(
    slides.map(async (slide) => {
      const resolvedImages = await resolveImageValues(slide.image, supabase);

      return {
        image: resolvedImages[0] || null,
        title: slide?.title?.trim(),
        description: slide?.description?.trim(),
        url: slide?.url?.trim(),
        slug,
        slide_speed,
      };
    }),
  );
};

export const useGetBanner = () => {
  const supabase = createClient();

  return useQuery<TBanner[], Error>({
    queryKey: [BannerQueryEnum.BannerAll],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banner')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw new Error(error.message);
      return (data || []) as TBanner[];
    },
  });
};

export const useUpsertBanner = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TBanner[], Error, { data: TBannerFormValues }>({
    mutationFn: async ({ data }) => {
      const [bannerPayload, homePayload] = await Promise.all([
        buildSlidePayload(data.banner_slides, data.banner_slide_speed, supabase, 'banner'),
        buildSlidePayload(data.home_slides, data.home_slide_speed, supabase, 'home'),
      ]);

      const [deleteBannerResult, deleteHomeResult] = await Promise.all([
        supabase.from('banner').delete().eq('slug', 'banner'),
        supabase.from('banner').delete().eq('slug', 'home'),
      ]);

      if (deleteBannerResult.error) throw new Error(deleteBannerResult.error.message);
      if (deleteHomeResult.error) throw new Error(deleteHomeResult.error.message);

      const { data: savedBanners, error } = await supabase
        .from('banner')
        .insert([...bannerPayload, ...homePayload] satisfies TBannerPayload[])
        .select();

      if (error) throw new Error(error.message);
      return (savedBanners || []) as TBanner[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BannerQueryEnum.BannerAll] });
    },
  });
};
