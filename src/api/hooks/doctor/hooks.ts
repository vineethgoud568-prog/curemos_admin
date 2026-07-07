'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { TDepartment } from '../department/schema';

import { DoctorQueryEnum } from './key';
import { TDoctor, TDoctorPayload, TDoctorProfile, TDoctorRole, TDoctorUserRole } from './schema';

import { applyTableParams, TTableParams } from '@/@core/utils/supabase-query';
import { createClient } from '@/utils/supabase/client';

const DOCTOR_ROLES: TDoctorRole[] = ['doctor_a', 'doctor_b'];

type TDoctorTableParams = TTableParams & {
  role?: string;
  state?: string; // Practice state
  district?: string; // Practice district
  state_medical_council?: string;
  dept?: string;
  status?: string;
};

const mergeDoctorsWithRoles = (
  profiles: TDoctorProfile[],
  userRoles: TDoctorUserRole[],
): TDoctor[] => {
  const rolesByUserId = new Map<string, TDoctorUserRole>();

  userRoles.forEach((role) => {
    if (!rolesByUserId.has(role.user_id)) {
      rolesByUserId.set(role.user_id, role);
    }
  });

  return profiles
    .filter((profile) => rolesByUserId.has(profile.id))
    .map((profile) => {
      const role = rolesByUserId.get(profile.id)!;

      return {
        ...profile,
        role: role.role,
        role_id: role.id,
      };
    });
};

interface IProfileWithDepartmentQuery {
  id: string;
  department_id?: string | null;
  department?: string | { id: string; name: string } | null;
  department_obj?: { id: string; name: string } | null;
}

const mapProfileDepartment = <T extends IProfileWithDepartmentQuery>(profile: T) => {
  if (!profile) return profile;
  const deptObj = profile.department_obj;
  let departmentVal = null;

  if (deptObj) {
    departmentVal = deptObj;
  } else if (typeof profile.department === 'string' && profile.department.trim()) {
    departmentVal = {
      id: profile.department_id || '',
      name: profile.department,
    };
  }

  return {
    ...profile,
    department: departmentVal,
  };
};

type TStatsProfile = {
  id: string;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const attachConsultationStats = async <TProfile extends TStatsProfile>(
  supabase: ReturnType<typeof createClient>,
  profiles: TProfile[],
): Promise<TProfile[]> => {
  if (profiles.length === 0) return profiles;

  const profileIds = profiles.map((p) => p.id);
  const idList = profileIds.join(',');

  const [consultationsRes, referralsRes] = await Promise.all([
    supabase
      .from('consultations')
      .select('doctor_a_id, doctor_b_id, status, start_time, end_time')
      .or(`doctor_a_id.in.(${idList}),doctor_b_id.in.(${idList})`),
    supabase
      .from('referrals')
      .select('doctor_a_id, doctor_b_id, status')
      .or(`doctor_a_id.in.(${idList}),doctor_b_id.in.(${idList})`),
  ]);

  const consultations = consultationsRes.data || [];
  const referrals = referralsRes.data || [];

  return profiles.map((profile) => {
    const profileConsultations = consultations.filter(
      (c) => c.doctor_a_id === profile.id || c.doctor_b_id === profile.id,
    );

    const profileReferrals = referrals.filter(
      (r) => r.doctor_a_id === profile.id || r.doctor_b_id === profile.id,
    );

    let totalDuration = 0;
    let validDurationCount = 0;
    profileConsultations.forEach((c) => {
      if (c.start_time && c.end_time) {
        const start = new Date(c.start_time).getTime();
        const end = new Date(c.end_time).getTime();
        if (end > start) {
          totalDuration += (end - start) / (1000 * 60);
          validDurationCount++;
        }
      }
    });

    const avg_consultation_duration =
      validDurationCount > 0 ? Math.round(totalDuration / validDurationCount) : 0;

    const no_of_referrals = profileReferrals.length;
    const no_of_patient_turned_around = profileReferrals.filter((r) =>
      ['admitted', 'completed', 'discharged'].includes(r.status),
    ).length;
    const no_of_patient_not_turned_around = profileReferrals.filter(
      (r) => r.status === 'rejected',
    ).length;

    const referral_conversion_rate =
      no_of_referrals > 0 ? Math.round((no_of_patient_turned_around / no_of_referrals) * 100) : 0;

    return {
      ...profile,
      total_consultations: profileConsultations.length,
      live_consultations: profileConsultations.filter((c) => c.status === 'active').length,
      scheduled_consultations: profileConsultations.filter((c) => c.status === 'pending').length,
      completed_consultations: profileConsultations.filter((c) => c.status === 'completed').length,
      cancelled_scheduled_calls: profileConsultations.filter((c) => c.status === 'cancelled')
        .length,
      not_responded_calls: 0,
      no_of_referrals,
      no_of_patient_turned_around,
      no_of_patient_not_turned_around,
      avg_consultation_duration,
      referral_conversion_rate,
    };
  });
};

const buildDoctorsQuery = (
  supabase: ReturnType<typeof createClient>,
  params: TDoctorTableParams,
  withPagination: boolean,
) => {
  return async (doctorIds: string[]) => {
    if (doctorIds.length === 0) {
      return { profiles: [], count: 0 };
    }

    let query = supabase
      .from('profiles')
      .select(
        `
        *,
        department_obj:departments(
          id,
          name
        )
      `,
        { count: 'exact' },
      )
      .in('id', doctorIds);

    // 🔍 Search
    if (params.search) {
      const search = params.search.trim();

      query = query.or(
        `id_text.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }

    // 📍 Medical Council State filter
    const selectedMedState = (params.state_medical_council || '').trim();
    if (selectedMedState && selectedMedState !== 'all') {
      query = query.ilike('state_medical_council', selectedMedState);
    }

    // 📍 Practice State filter
    const selectedState = (params.state || '').trim();
    if (selectedState && selectedState !== 'all') {
      query = query.ilike('state', selectedState);
    }

    // 📍 Practice District filter
    const selectedDistrict = (params.district || '').trim();
    if (selectedDistrict && selectedDistrict !== 'all') {
      query = query.ilike('district', selectedDistrict);
    }

    // 🏥 Specialization filter
    const selectedDept = params.dept?.trim();

    if (selectedDept && !['all', 'loading', 'no-dept'].includes(selectedDept)) {
      query = isUuid(selectedDept)
        ? query.eq('department_id', selectedDept)
        : query.contains('specializations', [selectedDept]);
    }

    // 🟢 Status filter (active/inactive -> Verified/Not Verified)
    const selectedStatus = (params.status || '').trim();
    if (selectedStatus && selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        query = query.eq('isVerified', true);
      } else {
        query = query.eq('isVerified', false);
      }
    }

    // 📄 Pagination
    if (withPagination) {
      query = applyTableParams(query, { ...params, search: undefined }, []);
    }

    const {
      data: profiles,
      count,
      error,
    } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw new Error(error.message);

    const mappedProfiles = (profiles || []).map(mapProfileDepartment);
    const profilesWithStats = await attachConsultationStats(
      supabase,
      mappedProfiles as TDoctorProfile[],
    );

    return {
      profiles: profilesWithStats,
      count: count || 0,
    };
  };
};

const getDoctorRoles = async (supabase: ReturnType<typeof createClient>, role?: string) => {
  const rolesToFetch = role ? [role] : DOCTOR_ROLES;

  // 1. Fetch users with doctor roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role, id, created_at')
    .in('role', rolesToFetch);

  if (rolesError) throw new Error(rolesError.message);

  if (!userRoles || userRoles.length === 0) return [];

  // 2. Identify which of these users also have admin roles
  const doctorUserIds = Array.from(new Set(userRoles.map((r) => r.user_id)));

  const { data: adminRoles, error: adminRolesError } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('role', ['super_admin', 'admin', 'sub_admin'])
    .in('user_id', doctorUserIds);

  if (adminRolesError) throw new Error(adminRolesError.message);

  const adminUserIds = new Set((adminRoles || []).map((r) => r.user_id));

  // 3. Exclude any user who is an admin
  const filteredRoles = userRoles.filter((r) => !adminUserIds.has(r.user_id));

  return filteredRoles as TDoctorUserRole[];
};

export const getDoctorsForExport = async (params: TDoctorTableParams) => {
  const supabase = createClient();
  const userRoles = await getDoctorRoles(supabase, params.role);
  const doctorIds = userRoles.map((role) => role.user_id);
  const { profiles } = await buildDoctorsQuery(supabase, params, false)(doctorIds);

  return mergeDoctorsWithRoles(profiles, userRoles);
};

export const useGetDoctors = (params: TDoctorTableParams) => {
  const supabase = createClient();

  return useQuery<{ data: TDoctor[]; total: number }, Error>({
    queryKey: [DoctorQueryEnum.DoctorAll, params],
    queryFn: async () => {
      const userRoles = await getDoctorRoles(supabase, params.role);
      const doctorIds = userRoles.map((role) => role.user_id);

      if (doctorIds.length === 0) {
        return { data: [], total: 0 };
      }

      const { profiles, count } = await buildDoctorsQuery(supabase, params, true)(doctorIds);

      return {
        data: mergeDoctorsWithRoles(profiles, userRoles),
        total: count,
      };
    },
  });
};

export const useGetDoctorById = (id: string) => {
  const supabase = createClient();

  return useQuery<TDoctor, Error>({
    queryKey: [DoctorQueryEnum.DoctorGet, id],
    queryFn: async () => {
      const [
        { data: profile, error: profileError },
        { data: consultations, error: consultationsError },
        { data: referrals, error: referralsError },
        { data: userRoles, error: userRolesError },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            `
    *,
    department_obj:departments(
      id,
      name
    )
  `,
          )
          .eq('id', id)
          .single(),
        supabase
          .from('consultations')
          .select('doctor_a_id, doctor_b_id, status, start_time, end_time')
          .or(`doctor_a_id.eq.${id},doctor_b_id.eq.${id}`),
        supabase
          .from('referrals')
          .select('doctor_a_id, doctor_b_id, status')
          .or(`doctor_a_id.eq.${id},doctor_b_id.eq.${id}`),
        supabase
          .from('user_roles')
          .select('id, user_id, role, created_at')
          .eq('user_id', id)
          .in('role', DOCTOR_ROLES),
      ]);

      if (profileError) throw new Error(profileError.message);
      if (consultationsError) throw new Error(consultationsError.message);
      if (referralsError) throw new Error(referralsError.message);
      if (userRolesError) throw new Error(userRolesError.message);

      const role = (userRoles || [])[0] as TDoctorUserRole | undefined;

      if (!role) {
        throw new Error('Doctor role not found');
      }

      const activeConsultations = consultations || [];
      const activeReferrals = referrals || [];

      let totalDuration = 0;
      let validDurationCount = 0;
      activeConsultations.forEach((c) => {
        if (c.start_time && c.end_time) {
          const start = new Date(c.start_time).getTime();
          const end = new Date(c.end_time).getTime();
          if (end > start) {
            totalDuration += (end - start) / (1000 * 60);
            validDurationCount++;
          }
        }
      });

      const avg_consultation_duration =
        validDurationCount > 0 ? Math.round(totalDuration / validDurationCount) : 0;

      const no_of_referrals = activeReferrals.length;
      const no_of_patient_turned_around = activeReferrals.filter((r) =>
        ['admitted', 'completed', 'discharged'].includes(r.status),
      ).length;
      const no_of_patient_not_turned_around = activeReferrals.filter(
        (r) => r.status === 'rejected',
      ).length;

      const referral_conversion_rate =
        no_of_referrals > 0 ? Math.round((no_of_patient_turned_around / no_of_referrals) * 100) : 0;

      const mappedProfile = mapProfileDepartment(profile);

      return {
        ...(mappedProfile as TDoctorProfile),
        role: role.role,
        role_id: role.id,
        total_consultations: activeConsultations.length,
        live_consultations: activeConsultations.filter((c) => c.status === 'active').length,
        scheduled_consultations: activeConsultations.filter((c) => c.status === 'pending').length,
        completed_consultations: activeConsultations.filter((c) => c.status === 'completed').length,
        cancelled_scheduled_calls: activeConsultations.filter((c) => c.status === 'cancelled')
          .length,
        not_responded_calls: 0,
        no_of_referrals,
        no_of_patient_turned_around,
        no_of_patient_not_turned_around,
        avg_consultation_duration,
        referral_conversion_rate,
      };
    },
    enabled: !!id,
  });
};

export const useAddDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation<{ doctor: TDoctor; tempPassword?: string }, Error, TDoctorPayload>({
    mutationFn: async (payload: TDoctorPayload) => {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          isProfileComplete: true,
          isVerified: true,
          status: 'active',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create doctor');
      }

      return result as { doctor: TDoctor; tempPassword?: string };
    },
    onSuccess: async (data, variables) => {
      const passwordMessage = data.tempPassword
        ? `Your temporary password is: <strong>${data.tempPassword}</strong>.`
        : 'Please reset your password to activate your account.';

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: variables.email,
          template: {
            title: 'Doctor Account Created Successfully',
            description: `Hello ${variables.full_name}, your account has been successfully created by the admin. ${passwordMessage} Please log in and reset your password to activate your account.`,
            // buttonText: 'View Dashboard',
            // buttonLink: process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.curemos.com',
          },
        }),
      });

      const result = await res.json();

      if (!result.success) {
        console.error('❌ Email failed:', result.message);
      } else {
        console.log('✅ Email sent successfully');
      }
      queryClient.invalidateQueries({ queryKey: [DoctorQueryEnum.DoctorAll] });
      queryClient.invalidateQueries({ queryKey: ['DoctorCount'] });
    },
  });
};

export const useUpdateDoctorStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TDoctor,
    Error,
    { id: string; status: 'active' | 'inactive'; email: string; full_name: string }
  >({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body:
          status === 'active'
            ? JSON.stringify({ status, isVerified: true })
            : JSON.stringify({ status, isVerified: false }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      return result as TDoctor;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DoctorQueryEnum.DoctorAll] });
      queryClient.invalidateQueries({ queryKey: [DoctorQueryEnum.DoctorGet, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['DoctorCount'] });
    },
  });
};

export const useUpdateDoctorSequence = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<
    void,
    Error,
    { departmentId: string; doctors: Pick<TDoctor, 'id' | 'sequence_no'>[] }
  >({
    mutationFn: async ({ doctors }) => {
      const results = await Promise.all(
        doctors.map((doctor) =>
          supabase.from('profiles').update({ sequence_no: doctor.sequence_no }).eq('id', doctor.id),
        ),
      );
      const error = results.find((result) => result.error)?.error;

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [DoctorQueryEnum.DoctorByDepartment, variables.departmentId],
      });
      queryClient.invalidateQueries({ queryKey: [DoctorQueryEnum.DoctorAll] });
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation<TDoctor, Error, { id: string; data: TDoctorPayload }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update doctor');
      }

      return result as TDoctor;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DoctorQueryEnum.DoctorAll] });
      queryClient.invalidateQueries({ queryKey: [DoctorQueryEnum.DoctorGet, variables.id] });
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      // Check for active or scheduled today consultations
      const { data: activeConsultations, error: checkError } = await supabase
        .from('consultations')
        .select('id')
        .or(`doctor_a_id.eq.${id},doctor_b_id.eq.${id}`)
        .in('status', ['active', 'today']);

      if (checkError) throw new Error(checkError.message);

      if (activeConsultations && activeConsultations.length > 0) {
        throw new Error(
          'Cannot delete doctor: The doctor is currently involved in an active  consultation call or scheduled for consultation today.',
        );
      }

      // 1. Clean up locations
      const { error: locationError } = await supabase
        .from('users_locations')
        .delete()
        .eq('user_id', id);
      if (locationError) throw new Error(locationError.message);

      // 2. Clean up user roles
      const { error: roleError } = await supabase.from('user_roles').delete().eq('user_id', id);
      if (roleError) throw new Error(roleError.message);

      // 3. Delete profile
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
      if (profileError) throw new Error(profileError.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DoctorQueryEnum.DoctorAll] });
      queryClient.invalidateQueries({ queryKey: ['DoctorCount'] });
    },
  });
};

export const useGetDoctorsByDepartment = (
  departmentId: string,
  params?: TTableParams & { role?: string },
) => {
  const supabase = createClient();
  const normalizedDepartmentId = departmentId.trim();
  const queryParams: TTableParams & { role?: string } = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
    search: params?.search ?? '',
    role: params?.role,
  };

  return useQuery<{ data: TDoctor[]; total: number; department: TDepartment | null }, Error>({
    queryKey: [DoctorQueryEnum.DoctorByDepartment, normalizedDepartmentId, queryParams],
    queryFn: async () => {
      const { data: department, error: departmentError } = await supabase
        .from('departments')
        .select('*')
        .eq('id', normalizedDepartmentId)
        .maybeSingle();

      if (departmentError) throw new Error(departmentError.message);

      const departmentName = (department as TDepartment | null)?.name?.trim();

      if (!departmentName) {
        return { data: [], total: 0, department: (department as TDepartment | null) ?? null };
      }

      const userRoles = await getDoctorRoles(supabase, queryParams.role);

      const doctorIds = (userRoles || []).map((role) => role.user_id);

      if (doctorIds.length === 0) {
        return { data: [], total: 0, department: (department as TDepartment | null) ?? null };
      }

      let query = supabase
        .from('profiles')
        .select(
          `
    *
  `,
          { count: 'exact' },
        )
        .in('id', doctorIds)
        .contains('specializations', [departmentName]);

      if (queryParams.search) {
        const search = queryParams.search.trim();
        query = query.or(
          `id_text.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`,
        );
      }

      query = applyTableParams(query, { ...queryParams, search: undefined }, []);

      const {
        data: profiles,
        count,
        error: profileError,
      } = await query
        .order('sequence_no', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (profileError) throw new Error(profileError.message);

      const mappedProfiles = (profiles || []).map(mapProfileDepartment);
      const profilesWithStats = await attachConsultationStats(
        supabase,
        mappedProfiles as TDoctorProfile[],
      );

      return {
        data: mergeDoctorsWithRoles(profilesWithStats, (userRoles || []) as TDoctorUserRole[]),
        total: count || 0,
        department: (department as TDepartment | null) ?? null,
      };
    },
    enabled: !!normalizedDepartmentId,
  });
};

export const useDoctorFilterState = () => {
  const supabase = createClient();

  return useQuery<string[], Error>({
    queryKey: [DoctorQueryEnum.DoctorFilterState],
    queryFn: async () => {
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', DOCTOR_ROLES);

      if (userRolesError) throw new Error(userRolesError.message);

      const doctorIds = (userRoles || []).map((role) => role.user_id);

      if (doctorIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('state_medical_council')
        .in('id', doctorIds)
        .not('state_medical_council', 'is', null)
        .order('state_medical_council', { ascending: true });

      if (error) throw new Error(error.message);

      return Array.from(
        new Set(
          (data || [])
            .map((item) => item.state_medical_council?.trim())
            .filter((state): state is string => Boolean(state)),
        ),
      );
    },
  });
};

export const useDoctorFilterPracticeState = () => {
  const supabase = createClient();

  return useQuery<string[], Error>({
    queryKey: [DoctorQueryEnum.DoctorFilterState, 'practice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('state')
        .not('state', 'is', null)
        .order('state', { ascending: true });

      if (error) throw new Error(error.message);

      return Array.from(
        new Set(
          (data || [])
            .map((item) => item.state?.trim())
            .filter((state): state is string => Boolean(state)),
        ),
      );
    },
  });
};

export const useDoctorFilterDistrict = (state?: string) => {
  const supabase = createClient();

  return useQuery<string[], Error>({
    queryKey: [DoctorQueryEnum.DoctorFilterState, 'district', state],
    queryFn: async () => {
      if (!state || state === 'all') return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('district')
        .ilike('state', state)
        .not('district', 'is', null)
        .order('district', { ascending: true });

      if (error) throw new Error(error.message);

      return Array.from(
        new Set(
          (data || [])
            .map((item) => item.district?.trim())
            .filter((district): district is string => Boolean(district)),
        ),
      );
    },
    enabled: !!state && state !== 'all',
  });
};

export const useReportState = () => {
  const supabase = createClient();

  return useQuery<
    {
      totalScheduledConsultations: number;
      totalConsultationsCompleted: number;
      cancelledConsultations: number;
      activeAccountsGp: number;
      activeAccountsCuremos: number;
    },
    Error
  >({
    queryKey: [DoctorQueryEnum.DoctorReportState],
    queryFn: async () => {
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', DOCTOR_ROLES);

      if (userRolesError) throw new Error(userRolesError.message);

      const roles = userRoles || [];
      const doctorIds = roles.map((role) => role.user_id);

      if (doctorIds.length === 0) {
        return {
          totalScheduledConsultations: 0,
          totalConsultationsCompleted: 0,
          cancelledConsultations: 0,
          activeAccountsGp: 0,
          activeAccountsCuremos: 0,
        };
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, status')
        .in('id', doctorIds);

      if (profilesError) throw new Error(profilesError.message);

      let consultations: any[] = [];
      if (doctorIds.length > 0) {
        // Chunk doctorIds to avoid URL too long error
        const chunkSize = 100;
        for (let i = 0; i < doctorIds.length; i += chunkSize) {
          const chunk = doctorIds.slice(i, i + chunkSize);
          const idList = chunk.join(',');
          const { data, error } = await supabase
            .from('consultations')
            .select('doctor_a_id, doctor_b_id, status')
            .or(`doctor_a_id.in.(${idList}),doctor_b_id.in.(${idList})`);

          if (!error && data) {
            consultations = [...consultations, ...data];
          }
        }
      }

      const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

      return roles.reduce(
        (acc, role) => {
          const profile = profileMap.get(role.user_id);

          if (!profile) {
            return acc;
          }

          const profileConsultations = consultations.filter(
            (c) => c.doctor_a_id === profile.id || c.doctor_b_id === profile.id,
          );

          acc.totalScheduledConsultations += profileConsultations.filter(
            (c) => c.status === 'pending',
          ).length;
          acc.totalConsultationsCompleted += profileConsultations.filter(
            (c) => c.status === 'completed',
          ).length;
          acc.cancelledConsultations += profileConsultations.filter(
            (c) => c.status === 'cancelled',
          ).length;

          if (profile.status === 'active') {
            if (role.role === 'doctor_a') {
              acc.activeAccountsGp += 1;
            }

            if (role.role === 'doctor_b') {
              acc.activeAccountsCuremos += 1;
            }
          }

          return acc;
        },
        {
          totalScheduledConsultations: 0,
          totalConsultationsCompleted: 0,
          cancelledConsultations: 0,
          activeAccountsGp: 0,
          activeAccountsCuremos: 0,
        },
      );
    },
  });
};

export const useUpdateDoctorVerify = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TDoctor,
    Error,
    { id: string; isVerified: boolean; email: string; full_name: string }
  >({
    mutationFn: async ({ id, isVerified }) => {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: isVerified ? 'active' : 'inactive',
          isVerified,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      return result as TDoctor;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [DoctorQueryEnum.DoctorAll],
      });

      queryClient.invalidateQueries({
        queryKey: [DoctorQueryEnum.DoctorGet, variables.id],
      });

      queryClient.invalidateQueries({
        queryKey: ['DoctorCount'],
      });
    },
  });
};

export const useDoctorsCount = () => {
  const supabase = createClient();

  return useQuery<number, Error>({
    queryKey: ['DoctorCount'],
    queryFn: async () => {
      const userRoles = await getDoctorRoles(supabase);
      const doctorIds = userRoles.map((role) => role.user_id);

      if (doctorIds.length === 0) return 0;

      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .in('id', doctorIds)
        .or('isVerified.eq.false,isVerified.is.null');

      if (error) throw new Error(error.message);
      return count || 0;
    },
    refetchInterval: 30000,
  });
};

export const useDoctorRealtime = (id?: string) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(id ? `doctor-detail-${id}-${channelId}` : `doctor-changes-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          ...(id && { filter: `id=eq.${id}` }),
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['DoctorCount'] });
          queryClient.invalidateQueries({ queryKey: [DoctorQueryEnum.DoctorAll] });
          if (id) {
            queryClient.invalidateQueries({ queryKey: [DoctorQueryEnum.DoctorGet, id] });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, id]);
};

export const useGetAllMedicalCouncils = (status?: 'active' | 'inactive') => {
  const supabase = createClient();

  return useQuery<{ id: string; name: string; status: string }[], Error>({
    queryKey: [DoctorQueryEnum.MedicalCouncilsAll, status],
    queryFn: async () => {
      let query = supabase.from('medical_councils').select('id, name, status');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('name', {
        ascending: true,
      });

      if (error) throw new Error(error.message);

      return (data || []) as { id: string; name: string; status: string }[];
    },
  });
};
