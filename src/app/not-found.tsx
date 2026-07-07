import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(255,255,255,0.05)_39px,rgba(255,255,255,0.05)_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,rgba(255,255,255,0.05)_39px,rgba(255,255,255,0.05)_40px)]">
      <h1 className="text-[120px] leading-none font-bold text-white md:text-[170px]">404</h1>
      <h2 className="mb-8 text-2xl text-white md:text-3xl">Page Not Found</h2>
      <Button asChild className="bg-white text-black hover:bg-gray-200">
        <Link href={ROUTES.dashboard}>Back to Home</Link>
      </Button>
    </div>
  );
}
