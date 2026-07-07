'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e0e0e] bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(255,255,255,0.05)_39px,rgba(255,255,255,0.05)_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,rgba(255,255,255,0.05)_39px,rgba(255,255,255,0.05)_40px)]">
      <h1 className="text-[120px] leading-none font-bold text-red-600 md:text-[170px]">500</h1>
      <h2 className="mb-8 text-2xl text-white md:text-3xl">Server Error</h2>
      <div className="flex gap-4">
        <Button asChild className="bg-white text-black hover:bg-gray-200">
          <Link href={ROUTES.dashboard}>Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
