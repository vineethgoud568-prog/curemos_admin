/* eslint-disable no-console */
import { TDoctor, TDoctorPayload, TDoctorRole } from '@/api/hooks/doctor/schema';
import { sendTemplatedEmail } from '@/lib/email/send-email';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient as createServerClient } from '@/utils/supabase/server';

const DOCTOR_ROLES: TDoctorRole[] = ['doctor_a', 'doctor_b'];

const randomPassword = () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const all = lower + upper + digits;

  // Guarantee at least one of each character class to prevent auth policy failures
  const chars = [
    lower[Math.floor(Math.random() * lower.length)],
    upper[Math.floor(Math.random() * upper.length)],
    digits[Math.floor(Math.random() * digits.length)],
  ];

  // Fill the remaining 9 characters
  for (let i = 3; i < 12; i++) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Shuffle and join
  return chars.sort(() => Math.random() - 0.5).join('');
};

async function ensureAdminAccess() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('ensureAdminAccess: Auth failed', authError?.message);
    throw new Error('Unauthorized: Please log in to perform this action');
  }

  const { data: roles, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'super_admin']);

  if (roleError) {
    console.error('ensureAdminAccess: Role fetch error', roleError.message);
    throw new Error('Internal Server Error: Failed to verify permissions');
  }

  // if (!roles?.length) {
  //   throw new Error('Forbidden: You do not have permission to manage doctors');
  // }

  return user;
}

export async function createDoctorWithAuth(payload: TDoctorPayload): Promise<{ doctor: TDoctor; tempPassword?: string }> {
  await ensureAdminAccess();

  const adminClient = createAdminClient();
  const { role, ...profilePayload } = payload;
  const tempPassword = randomPassword();

  const { data: authUserData, error: authError } = await adminClient.auth.admin.createUser({
    email: payload.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: payload.full_name,
      role,
    },
  });

  if (authError || !authUserData.user) {
    throw new Error(authError?.message || 'Failed to create doctor auth user');
  }

  const authUserId = authUserData.user.id;

  try {
    // Small delay to ensure the database trigger has finished creating the skeleton records.
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 1. Update the profile with the specific doctor metadata.
    // We use .update() because the trigger has already created the row.
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .update({
        ...profilePayload,
        isVerified: true,
        isProfileComplete: true,
        is_otp_verified: true,
        status: 'active',
      })
      .eq('id', authUserId)
      .select('*')
      .single();

    if (profileError) {
      throw new Error(`Profile Update Error: ${profileError.message}`);
    }

    // 2. Update the role.
    // We update the existing role record that the trigger likely created.
    const { data: roleRow, error: roleError } = await adminClient
      .from('user_roles')
      .update({ role })
      .eq('user_id', authUserId)
      .select('id, user_id, role, created_at')
      .single();

    // If for some reason the trigger didn't create a role, we'll insert one.
    if (roleError || !roleRow) {
      const { data: insertedRole, error: insertError } = await adminClient
        .from('user_roles')
        .insert([{ user_id: authUserId, role }])
        .select('id, user_id, role, created_at')
        .single();

      if (insertError) throw new Error(`Role Error: ${insertError.message}`);

      return {
        doctor: {
          ...profile,
          role: insertedRole.role,
          role_id: insertedRole.id,
        } as TDoctor,
        tempPassword,
      };
    }

    return {
      doctor: {
        ...profile,
        role: roleRow.role,
        role_id: roleRow.id,
      } as TDoctor,
      tempPassword,
    };
  } catch (error) {
    await adminClient.from('profiles').delete().eq('id', authUserId);
    await adminClient.auth.admin.deleteUser(authUserId);
    throw error;
  }
}

export async function updateDoctorWithAuth(
  id: string,
  payload: Partial<TDoctorPayload>,
): Promise<TDoctor> {
  await ensureAdminAccess();

  const adminClient = createAdminClient();
  const { role, ...profilePayload } = payload;
  const shouldNotifyVerificationChange = Object.prototype.hasOwnProperty.call(
    profilePayload,
    'isVerified',
  );

  const { data: existingProfile, error: existingProfileError } = shouldNotifyVerificationChange
    ? await adminClient.from('profiles').select('isVerified').eq('id', id).single()
    : { data: null, error: null };

  if (existingProfileError) {
    throw new Error(existingProfileError.message);
  }

  // 1. Only update Auth if relevant fields are provided
  if (payload.email || payload.full_name || role) {
    const authUpdateData: Record<string, any> = {};
    if (payload.email) authUpdateData.email = payload.email;
    if (payload.full_name || role) {
      authUpdateData.user_metadata = {
        ...(payload.full_name && { full_name: payload.full_name }),
        ...(role && { role }),
      };
    }

    const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(
      id,
      authUpdateData,
    );
    if (authUpdateError) throw new Error(authUpdateError.message);
  }

  // 2. Update Profile
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .update(profilePayload)
    .eq('id', id)
    .select('*')
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (
    shouldNotifyVerificationChange &&
    existingProfile?.isVerified !== profile.isVerified &&
    profile.email
  ) {
    await sendTemplatedEmail({
      email: profile.email,
      template: {
        title: 'Doctor Verification Status',
        description: profile.isVerified
          ? `Hello ${profile.full_name || 'Doctor'}, your account has been verified by admin.`
          : `Hello ${profile.full_name || 'Doctor'}, your account has been unverified by admin. Please contact support for more details.`,
      },
    });
  }

  // 3. Handle Role update only if provided
  const { data: existingRoles, error: roleLookupError } = await adminClient
    .from('user_roles')
    .select('id, user_id, role, created_at')
    .eq('user_id', id)
    .in('role', DOCTOR_ROLES);

  if (roleLookupError) throw new Error(roleLookupError.message);

  let finalRole = existingRoles?.[0];

  if (role && finalRole) {
    const { data: updatedRole, error: roleUpdateError } = await adminClient
      .from('user_roles')
      .update({ role })
      .eq('id', finalRole.id)
      .select('id, user_id, role, created_at')
      .single();

    if (roleUpdateError) throw new Error(roleUpdateError.message);
    finalRole = updatedRole;
  } else if (role && !finalRole) {
    const { data: insertedRole, error: roleInsertError } = await adminClient
      .from('user_roles')
      .insert([{ user_id: id, role }])
      .select('id, user_id, role, created_at')
      .single();

    if (roleInsertError) throw new Error(roleInsertError.message);
    finalRole = insertedRole;
  }

  return {
    ...profile,
    role: finalRole?.role || 'doctor_a',
    role_id: finalRole?.id,
  } as TDoctor;
}

export async function deleteDoctorWithAuth(id: string) {
  await ensureAdminAccess();

  const adminClient = createAdminClient();

  const { error: roleDeleteError } = await adminClient
    .from('user_roles')
    .delete()
    .eq('user_id', id)
    .in('role', DOCTOR_ROLES);

  if (roleDeleteError) {
    throw new Error(roleDeleteError.message);
  }

  // Delete from users_locations first to satisfy foreign key constraints
  const { error: locationDeleteError } = await adminClient
    .from('users_locations')
    .delete()
    .eq('user_id', id);

  if (locationDeleteError) {
    throw new Error(locationDeleteError.message);
  }

  const { error: profileDeleteError } = await adminClient.from('profiles').delete().eq('id', id);

  if (profileDeleteError) {
    throw new Error(profileDeleteError.message);
  }

  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(id);

  if (authDeleteError) {
    throw new Error(authDeleteError.message);
  }
}
