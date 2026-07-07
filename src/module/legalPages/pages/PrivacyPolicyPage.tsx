'use client';

import LegalPageEditForm from '@/module/legalPages/components/LegalPageEditForm';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageEditForm
      slug="privacy-policy"
      pageTitle="Privacy Policy"
      pageDescription="Manage the Privacy Policy content displayed in the app."
      icon="mdi:shield-lock-outline"
    />
  );
}
