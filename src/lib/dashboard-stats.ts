import { createClient as createServerClient } from '@/utils/supabase/server';

type TDoctorRole = 'doctor_a' | 'doctor_b';

type TDoctorRoleRow = {
  user_id: string;
  role: TDoctorRole;
};

type TDoctorProfileStatusRow = {
  id: string;
  status: 'active' | 'inactive' | null;
};

export type TDashboardStats = {
  activeGpDoctors: number;
  activeCuremosDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  totalPatients: number;
  totalReports: number;
};

const DOCTOR_ROLES: TDoctorRole[] = ['doctor_a', 'doctor_b'];

export async function getDashboardStats(): Promise<TDashboardStats> {
  const supabase = await createServerClient();

  const [
    { data: doctorRoles, error: doctorRolesError },
    { count: patientCount, error: patientCountError },
    { count: reportCount, error: reportCountError },
  ] = await Promise.all([
    supabase.from('user_roles').select('user_id, role').in('role', DOCTOR_ROLES),
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }),
  ]);

  if (doctorRolesError) {
    throw new Error(doctorRolesError.message);
  }

  if (patientCountError) {
    throw new Error(patientCountError.message);
  }

  if (reportCountError) {
    throw new Error(reportCountError.message);
  }

  const uniqueDoctorIds = Array.from(new Set((doctorRoles || []).map((row) => row.user_id)));

  if (uniqueDoctorIds.length === 0) {
    return {
      activeGpDoctors: 0,
      activeCuremosDoctors: 0,
      activeDoctors: 0,
      inactiveDoctors: 0,
      totalPatients: patientCount || 0,
      totalReports: reportCount || 0,
    };
  }

  const { data: doctorProfiles, error: doctorProfilesError } = await supabase
    .from('profiles')
    .select('id, status')
    .in('id', uniqueDoctorIds);

  if (doctorProfilesError) {
    throw new Error(doctorProfilesError.message);
  }

  const profileStatusById = new Map(
    ((doctorProfiles || []) as TDoctorProfileStatusRow[]).map((profile) => [
      profile.id,
      profile.status,
    ]),
  );

  let activeGpDoctors = 0;
  let activeCuremosDoctors = 0;
  let activeDoctors = 0;
  let inactiveDoctors = 0;

  for (const doctorId of uniqueDoctorIds) {
    const status = profileStatusById.get(doctorId);

    if (status === 'active') {
      activeDoctors += 1;
    } else if (status === 'inactive') {
      inactiveDoctors += 1;
    }
    // ignore undefined/null
  }

  for (const roleRow of (doctorRoles || []) as TDoctorRoleRow[]) {
    if (profileStatusById.get(roleRow.user_id) !== 'active') {
      continue;
    }

    if (roleRow.role === 'doctor_a') {
      activeGpDoctors += 1;
    }

    if (roleRow.role === 'doctor_b') {
      activeCuremosDoctors += 1;
    }
  }

  return {
    activeGpDoctors,
    activeCuremosDoctors,
    activeDoctors,
    inactiveDoctors,
    totalPatients: patientCount || 0,
    totalReports: reportCount || 0,
  };
}
