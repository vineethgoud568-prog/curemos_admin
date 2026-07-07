import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/utils/supabase/admin';
import { createClient as createServerClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

const SEARCH_COLUMNS = [
  'review',
  'gp_doctor_name',
  'gp_doctor_email',
  'curemos_doctor_name',
  'curemos_doctor_email',
];

const ALLOWED_ADMIN_ROLES = ['admin', 'super_admin', 'sub_admin'];

async function ensureSubAdminPermission(
  userId: string,
  supabase: Awaited<ReturnType<typeof createServerClient>>,
) {
  const { data: permissionRows, error: permissionError } = await supabase
    .from('admin_permission')
    .select('permission')
    .eq('admin_user_id', userId)
    .eq('module', 'consultation-review')
    .contains('permission', ['list']);

  if (permissionError || !permissionRows?.length) {
    throw new Error('Forbidden: You do not have permission to view consultation reviews');
  }
}

async function ensureAdminAccess() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Please log in to view consultation reviews');
  }

  const { data: adminUser, error: adminUserError } = await supabase
    .from('admin_users')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (adminUserError && adminUserError.code !== 'PGRST116') {
    throw new Error(adminUserError.message);
  }

  if (adminUser) {
    if (adminUser.status !== 'active' || !ALLOWED_ADMIN_ROLES.includes(adminUser.role)) {
      throw new Error('Forbidden: You do not have permission to view consultation reviews');
    }

    if (adminUser.role === 'sub_admin') {
      await ensureSubAdminPermission(user.id, supabase);
    }

    return user;
  }

  const { data: roles, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ALLOWED_ADMIN_ROLES);

  if (roleError || !roles?.length) {
    throw new Error('Forbidden: You do not have permission to view consultation reviews');
  }

  if (roles.every((role) => role.role === 'sub_admin')) {
    await ensureSubAdminPermission(user.id, supabase);
  }

  return user;
}

const getPositiveNumberParam = (request: NextRequest, key: string, fallback: number) => {
  const rawValue = request.nextUrl.searchParams.get(key);
  const value = rawValue ? Number(rawValue) : fallback;

  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
};

const escapeSearchValue = (value: string) => value.trim().replace(/[%_]/g, (char) => `\\${char}`);

export async function GET(request: NextRequest) {
  try {
    await ensureAdminAccess();

    const page = getPositiveNumberParam(request, 'page', 1);
    const limit = Math.min(getPositiveNumberParam(request, 'limit', 10), 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const adminClient = createAdminClient();
    const search = request.nextUrl.searchParams.get('search')?.trim();
    const rating = request.nextUrl.searchParams.get('rating');
    const consultationType = request.nextUrl.searchParams.get('consultationType');

    let query = adminClient.from('consultation_reviews_admin').select('*', { count: 'exact' });

    if (search) {
      const searchValue = escapeSearchValue(search);
      query = query.or(
        SEARCH_COLUMNS.map((column) => `${column}.ilike.%${searchValue}%`).join(','),
      );
    }

    if (rating) {
      const ratingValue = Number(rating);
      if (Number.isInteger(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
        query = query.eq('rating', ratingValue);
      }
    }

    if (consultationType) {
      query = query.eq('consultation_type', consultationType);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const typeQuery = adminClient
      .from('consultation_reviews_admin')
      .select('consultation_type')
      .not('consultation_type', 'is', null)
      .order('consultation_type', { ascending: true });

    const [{ data, count, error }, { data: typeRows, error: typeError }] = await Promise.all([
      query,
      typeQuery,
    ]);

    if (error) throw new Error(error.message);
    if (typeError) throw new Error(typeError.message);

    const consultationTypes = Array.from(
      new Set(
        (typeRows || [])
          .map((row) => row.consultation_type)
          .filter((type): type is string => Boolean(type)),
      ),
    );

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      consultationTypes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch consultation reviews';
    const normalizedMessage = message.toLowerCase();
    let status = 500;

    if (normalizedMessage.includes('unauthorized')) status = 401;
    if (normalizedMessage.includes('forbidden')) status = 403;

    return NextResponse.json({ message }, { status });
  }
}
