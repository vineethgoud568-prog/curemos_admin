export type TLegalPageSlug = 'terms-and-conditions' | 'privacy-policy';

export type TLegalPage = {
  id: number;
  slug: TLegalPageSlug;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
};

export type TLegalPagePayload = {
  slug: TLegalPageSlug;
  title: string;
  content: string;
  is_published: boolean;
};

export enum LegalPageQueryEnum {
  LegalPageBySlug = 'legal-page-by-slug',
}
