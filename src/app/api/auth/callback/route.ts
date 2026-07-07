import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard/default';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error);
    }
  }

  // Use the host header to construct the redirect URL to avoid localhost issues behind proxies
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || requestUrl.host;
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const redirectUrl = new URL(next, `${protocol}://${host}`);

  return NextResponse.redirect(redirectUrl);
}
