'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ReferralQueryEnum } from './key';
import { TAuditLog, TReferral, TReferralStatus } from './schema';

import { TTableParams } from '@/@core/utils/supabase-query';
import { createClient } from '@/utils/supabase/client';

type TReferralTableParams = TTableParams & { status?: string };

const REFERRAL_SELECT = `
  *,
  patient:patients(*),
  doctor_a:profiles!referrals_doctor_a_id_fkey(*),
  doctor_b:profiles!referrals_doctor_b_id_fkey(*)
`;

const buildReferralsQuery = async (
  supabase: ReturnType<typeof createClient>,
  params: TReferralTableParams,
  withPagination: boolean,
) => {
  let query = supabase.from('referrals').select(REFERRAL_SELECT, { count: 'exact' });

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.search) {
    const { data: patients } = await supabase
      .from('patients')
      .select('id')
      .ilike('full_name', `%${params.search}%`);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', `%${params.search}%`);

    const patientIds = (patients || []).map((patient) => patient.id);
    const profileIds = (profiles || []).map((profile) => profile.id);
    const orConditions = [`diagnosis.ilike.%${params.search}%`, `notes.ilike.%${params.search}%`];

    if (patientIds.length > 0) {
      orConditions.push(`patient_id.in.(${patientIds.join(',')})`);
    }

    if (profileIds.length > 0) {
      orConditions.push(`doctor_a_id.in.(${profileIds.join(',')})`);
      orConditions.push(`doctor_b_id.in.(${profileIds.join(',')})`);
    }

    query = query.or(orConditions.join(','));
  }

  if (withPagination) {
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);
  }

  return query.order('created_at', { ascending: false });
};

export const getReferralsForExport = async (params: TReferralTableParams) => {
  const supabase = createClient();
  const { data, error } = await buildReferralsQuery(supabase, params, false);

  if (error) throw new Error(error.message);
  const referrals = (data || []) as TReferral[];
  const subadminIds = Array.from(
    new Set(
      referrals
        .map((r: any) => r.assigned_subadmin_id)
        .filter((id): id is string => !!id),
    ),
  );

  if (subadminIds.length > 0) {
    const { data: subadmins } = await supabase
      .from('admin_users')
      .select('id, full_name, email')
      .in('id', subadminIds);

    if (subadmins) {
      const subadminMap = new Map(subadmins.map((s) => [s.id, s]));
      referrals.forEach((r: any) => {
        r.assigned_person = subadminMap.get(r.assigned_subadmin_id) || null;
      });
    }
  }

  return referrals;
};

export const useGetReferrals = (params: TReferralTableParams) => {
  const supabase = createClient();

  return useQuery<{ data: TReferral[]; total: number }, Error>({
    queryKey: [ReferralQueryEnum.ReferralAll, params],
    queryFn: async () => {
      const { data, count, error } = await buildReferralsQuery(supabase, params, true);

      if (error) throw new Error(error.message);
      const referrals = (data || []) as TReferral[];
      const subadminIds = Array.from(
        new Set(
          referrals
            .map((r: any) => r.assigned_subadmin_id)
            .filter((id): id is string => !!id),
        ),
      );

      if (subadminIds.length > 0) {
        const { data: subadmins } = await supabase
          .from('admin_users')
          .select('id, full_name, email')
          .in('id', subadminIds);

        if (subadmins) {
          const subadminMap = new Map(subadmins.map((s) => [s.id, s]));
          referrals.forEach((r: any) => {
            r.assigned_person = subadminMap.get(r.assigned_subadmin_id) || null;
          });
        }
      }

      return {
        data: referrals,
        total: count || 0,
      };
    },
  });
};

export const useGetReferralById = (id: string) => {
  const supabase = createClient();

  return useQuery<TReferral, Error>({
    queryKey: [ReferralQueryEnum.ReferralGet, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select(
          `
          *,
          patient:patients(*),
          doctor_a:profiles!referrals_doctor_a_id_fkey(*),
          doctor_b:profiles!referrals_doctor_b_id_fkey(*)
          `,
        )
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      const referral = data as any;
      if (referral && referral.assigned_subadmin_id) {
        const { data: subadmin } = await supabase
          .from('admin_users')
          .select('id, full_name, email')
          .eq('id', referral.assigned_subadmin_id)
          .single();
        referral.assigned_person = subadmin || null;
      }
      return referral as TReferral;
    },
    enabled: !!id,
  });
};

export const useUpdateReferralStatus = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<
    void,
    Error,
    { id: string; status: TReferralStatus; adminId: string; details?: Record<string, unknown> }
  >({
    mutationFn: async ({ id, status, adminId, details }) => {
      const response = await fetch(`/api/referrals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminId, details }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update referral');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ReferralQueryEnum.ReferralAll] });
      queryClient.invalidateQueries({ queryKey: [ReferralQueryEnum.ReferralGet, variables.id] });
      queryClient.invalidateQueries({
        queryKey: [ReferralQueryEnum.ReferralAuditLogs, variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['ReferralPendingCount'] });
    },
  });
};

export const useDeleteReferral = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('referrals').delete().eq('id', id).select('id');

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        throw new Error('Referral was not deleted');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ReferralQueryEnum.ReferralAll] });
      queryClient.invalidateQueries({ queryKey: ['ReferralPendingCount'] });
    },
  });
};

export const useGetReferralAuditLogs = (referralId: string) => {
  const supabase = createClient();

  return useQuery<TAuditLog[], Error>({
    queryKey: [ReferralQueryEnum.ReferralAuditLogs, referralId],
    queryFn: async () => {
      // 1. Fetch audit logs
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('target_type', 'referral')
        .eq('target_id', referralId)
        .order('created_at', { ascending: false });

      if (logsError) throw new Error(logsError.message);
      if (!logs || logs.length === 0) return [];

      // 2. Extract unique admin IDs
      const adminIds = Array.from(new Set(logs.map((log) => log.admin_id)));

      // 3. Fetch admin profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', adminIds);

      if (profilesError) {
        return logs as TAuditLog[];
      }

      // 4. Map profiles back to logs
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      return logs.map((log) => ({
        ...log,
        admin_profile: profileMap.get(log.admin_id),
      })) as TAuditLog[];
    },
    enabled: !!referralId,
  });
};

export const usePendingReferralsCount = () => {
  const supabase = createClient();

  return useQuery<number, Error>({
    queryKey: ['ReferralPendingCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw new Error(error.message);
      return count || 0;
    },
    refetchInterval: 30000, // 30 seconds // Backup option in case client's internet flickers or fails to establish a connection
  });
};

export const useReferralRealtime = (id?: string) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(id ? `referral-detail-${id}-${channelId}` : `referral-changes-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          ...(id && { filter: `id=eq.${id}` }),
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ReferralPendingCount'] });
          queryClient.invalidateQueries({ queryKey: [ReferralQueryEnum.ReferralAll] });
          if (id) {
            queryClient.invalidateQueries({ queryKey: [ReferralQueryEnum.ReferralGet, id] });
            queryClient.invalidateQueries({
              queryKey: [ReferralQueryEnum.ReferralAuditLogs, id],
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, id]);
};
