'use client';

import LegalPageEditForm from '@/module/legalPages/components/LegalPageEditForm';

export default function TermsAndConditionsPage() {
  return (
    <LegalPageEditForm
      slug="terms-and-conditions"
      pageTitle="Terms & Conditions"
      pageDescription="Manage the Terms & Conditions content displayed in the app."
      icon="mdi:scale-balance"
    />
  );
}
