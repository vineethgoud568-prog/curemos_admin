import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/auth/login', '/auth/forgotPassword'];

type UserRole = {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'editor' | 'doctor_a' | 'doctor_b';
  created_at: string;
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('❌ Missing Supabase ENV');
    return res;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('❌ Auth error:', userError.message);
  }

  const { pathname } = req.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (isPublicRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isDashboardRoute && user) {
    // 1. Check admin_users for subadmins
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (adminUser) {
      if (adminUser.status !== 'active') {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      // If it's a valid admin_user, allow access
      return res;
    }

    // 2. Fallback to legacy user_roles
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('id, user_id, role, created_at')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('❌ Role fetch error:', roleError.message);
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (!userRoles || userRoles.length === 0) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    const hasAdminAccess = userRoles.some((r) => ['super_admin', 'admin', 'sub_admin'].includes(r.role));

    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
