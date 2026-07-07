import { createAdminClient } from '@/utils/supabase/admin';
import { createClient as createServerClient } from '@/utils/supabase/server';

async function ensureAdminAccess() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Please log in to perform this action');
  }

  const { data: roles, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'super_admin']);

  if (roleError || !roles?.length) {
    throw new Error('Forbidden: You do not have permission to manage referrals');
  }

  return user;
}

export async function updateReferralStatus(
  id: string,
  status: string,
  adminId: string,
  details: Record<string, unknown>,
) {
  const user = await ensureAdminAccess();
  const adminClient = createAdminClient();

  // 1. Update the referral status
  const { data, error: updateError } = await adminClient
    .from('referrals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Referral Update Error: ${updateError.message}`);
  }

  // 2. Add audit log entry
  const { error: auditError } = await adminClient.from('audit_logs').insert([
    {
      admin_id: adminId || user.id,
      action: `Updated referral status to ${status}`,
      target_type: 'referral',
      target_id: id,
      details: details || {},
    },
  ]);

  if (auditError) {
    // Audit log error is non-blocking
  }

  return data;
}
