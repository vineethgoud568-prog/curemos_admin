export type TBanner = {
  id: number;
  created_at: string;
  image: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  slug: string | null;
  slide_speed: string | null;
};

export type TBannerPayload = Omit<TBanner, 'id' | 'created_at'>;

export enum BannerQueryEnum {
  BannerAll = 'banner-all',
}
