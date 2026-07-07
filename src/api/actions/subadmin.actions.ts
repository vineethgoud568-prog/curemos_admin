'use server';

import { createAdminClient } from '@/utils/supabase/admin';

const getPermissionRows = (
  adminUserId: string,
  permissions: Record<string, string[] | undefined>,
  modules: readonly string[],
) =>
  modules
    .map((moduleName) => ({
      admin_user_id: adminUserId,
      module: moduleName,
      permission: permissions[moduleName] || [],
    }))
    .filter((row) => row.permission.length > 0);

export async function inviteSubadminAction(payload: {
  email: string;
  full_name: string;
  category: string;
  image: string;
  permissions: Record<string, string[] | undefined>;
  subadminPermissionModules: readonly string[];
}) {
  const adminAuthClient = createAdminClient();

  // 1. Invite User using Supabase Auth Admin
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
  const protocol =
    headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const redirectTo = `${protocol}://${host}/api/auth/callback?next=/auth/reset-password`;

  const { data: authData, error: authError } = await adminAuthClient.auth.admin.inviteUserByEmail(
    payload.email,
    { redirectTo },
  );

  if (authError) {
    throw new Error(authError.message);
  }

  const userId = authData.user.id;

  // 1.5 Clean up auto-generated doctor profiles
  // Since a database trigger automatically adds new auth users to `profiles` and `user_roles`
  // as default doctors, we must explicitly remove them to keep subadmins out of the doctor list.
  await Promise.all([
    adminAuthClient.from('profiles').delete().eq('id', userId),
    adminAuthClient.from('user_roles').delete().eq('user_id', userId),
  ]);

  // 1.6 Insert explicitly into user_roles as sub_admin
  const { error: roleInsertError } = await adminAuthClient.from('user_roles').insert([
    {
      user_id: userId,
      role: 'sub_admin',
    },
  ]);

  if (roleInsertError) {
    await adminAuthClient.auth.admin.deleteUser(userId);
    throw new Error(roleInsertError.message);
  }

  // 2. Create Profile in public.admin_users
  const { error: profileError } = await adminAuthClient.from('admin_users').insert([
    {
      id: userId,
      email: payload.email,
      full_name: payload.full_name,
      category: payload.category,
      image: payload.image,
      role: 'sub_admin',
    },
  ]);

  if (profileError) {
    // Rollback by deleting user
    await adminAuthClient.auth.admin.deleteUser(userId);
    throw new Error(profileError.message);
  }

  // 3. Insert Permissions into public.admin_permission
  const permissionRows = getPermissionRows(
    userId,
    payload.permissions,
    payload.subadminPermissionModules,
  );

  if (permissionRows.length > 0) {
    const { error: permissionError } = await adminAuthClient
      .from('admin_permission')
      .insert(permissionRows);

    if (permissionError) {
      // Rollback
      await adminAuthClient.auth.admin.deleteUser(userId);
      throw new Error(permissionError.message);
    }
  }

  return { success: true, userId };
}

export async function updateSubadminAction(
  userId: string,
  payload: {
    email: string;
    full_name: string;
    category: string;
    image: string;
    permissions: Record<string, string[] | undefined>;
    subadminPermissionModules: readonly string[];
  },
) {
  const adminAuthClient = createAdminClient();

  // 1. Update email in Auth if necessary
  const { error: authError } = await adminAuthClient.auth.admin.updateUserById(userId, {
    email: payload.email,
  });
  if (authError) throw new Error(authError.message);

  // 2. Update Profile
  const { error: profileError } = await adminAuthClient
    .from('admin_users')
    .update({
      email: payload.email,
      full_name: payload.full_name,
      category: payload.category,
      image: payload.image,
    })
    .eq('id', userId);

  if (profileError) throw new Error(profileError.message);

  // 3. Update permissions: Delete old ones and insert new ones
  const { error: deletePermissionError } = await adminAuthClient
    .from('admin_permission')
    .delete()
    .eq('admin_user_id', userId);

  if (deletePermissionError) throw new Error(deletePermissionError.message);

  const permissionRows = getPermissionRows(
    userId,
    payload.permissions,
    payload.subadminPermissionModules,
  );

  if (permissionRows.length > 0) {
    const { error: permissionError } = await adminAuthClient
      .from('admin_permission')
      .insert(permissionRows);

    if (permissionError) throw new Error(permissionError.message);
  }

  return { success: true };
}
