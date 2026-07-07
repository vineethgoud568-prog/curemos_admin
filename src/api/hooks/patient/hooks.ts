'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { PatientQueryEnum } from './key';
import { TPatient, TPatientPayload } from './schema';

import { applyTableParams, TTableParams } from '@/@core/utils/supabase-query';
import { createClient } from '@/utils/supabase/client';

type TPatientTableParams = TTableParams & {
  doctor_a_id?: string;
};

type TPatientAddPayload = TPatientPayload & {
  doctorname?: string;
  doctoremail?: string;
};

const PATIENT_SELECT = `
  *,
  doctor_a:profiles!patients_doctor_a_id_fkey(
    id,
    full_name,
    email
  )
`;

const buildPatientsQuery = (
  supabase: ReturnType<typeof createClient>,
  params: TPatientTableParams,
  withPagination: boolean,
) => {
  let query = supabase.from('patients').select(PATIENT_SELECT, { count: 'exact' });

  if (params.doctor_a_id) {
    query = query.eq('doctor_a_id', params.doctor_a_id);
  }

  if (withPagination) {
    query = applyTableParams(query, params, ['full_name', 'email', 'phone']);
  } else if (params.search) {
    const searchValue = encodeURIComponent(params.search);
    query = query.or(
      [
        `full_name.ilike.%${searchValue}%`,
        `email.ilike.%${searchValue}%`,
        `phone.ilike.%${searchValue}%`,
      ].join(','),
    );
  }

  return query.order('created_at', { ascending: false });
};

export const getPatientsForExport = async (params: TPatientTableParams) => {
  const supabase = createClient();
  const { data, error } = await buildPatientsQuery(supabase, params, false);

  if (error) throw new Error(error.message);
  return (data || []) as TPatient[];
};

export const useGetPatients = (params: TPatientTableParams) => {
  const supabase = createClient();

  return useQuery<{ data: TPatient[]; total: number }, Error>({
    queryKey: [PatientQueryEnum.PatientAll, params],
    queryFn: async () => {
      const { data, count, error } = await buildPatientsQuery(supabase, params, true);

      if (error) throw new Error(error.message);
      return {
        data: (data || []) as TPatient[],
        total: count || 0,
      };
    },
  });
};

export const useGetPatientsNames = () => {
  const supabase = createClient();

  return useQuery<string[], Error>({
    queryKey: [PatientQueryEnum.PatientNames],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('full_name') // ✅ only fetch names
        .order('full_name', { ascending: true });

      if (error) throw new Error(error.message);

      return (data || []).map((item) => item.full_name);
    },
  });
};

export const useGetPatientById = (id: string) => {
  const supabase = createClient();

  return useQuery<TPatient, Error>({
    queryKey: [PatientQueryEnum.PatientGet, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select(PATIENT_SELECT)
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as TPatient;
    },
    enabled: !!id,
  });
};

export const useAddPatient = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TPatient, Error, TPatientAddPayload>({
    mutationFn: async (payload: TPatientAddPayload) => {
      const { doctorname: _doctorname, doctoremail: _doctoremail, ...patientPayload } = payload;
      const { data, error } = await supabase
        .from('patients')
        .insert([patientPayload])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as TPatient;
    },
    onSuccess: async (_, variables) => {
      try {
        await Promise.all([
          fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: variables.email,
              template: {
                title: 'Patient Account Created Successfully',
                description: `Hello ${variables.full_name}, your patient account has been successfully created by the admin and assigned under Dr. ${variables.doctorname || 'your doctor'}. Please reset your password to activate your account and log in to access your dashboard and services.`,
              },
            }),
          }),

          fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: variables.doctoremail,
              template: {
                title: 'New Patient Assigned',
                description: `Hello Dr. ${variables.doctorname}, a new patient account for ${variables.full_name} has been successfully created by the admin and assigned under your care. You can now manage and access the patient details from your dashboard.`,
              },
            }),
          }),
        ]);

        queryClient.invalidateQueries({
          queryKey: [PatientQueryEnum.PatientAll],
        });
      } catch (error) {
        console.error('Email sending failed:', error);
      }
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TPatient, Error, { id: string; data: TPatientPayload }>({
    mutationFn: async ({ id, data }) => {
      const { data: updatedPatient, error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updatedPatient as TPatient;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PatientQueryEnum.PatientAll] });
      queryClient.invalidateQueries({ queryKey: [PatientQueryEnum.PatientGet, variables.id] });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      // Check for active or scheduled today consultations involving this patient
      const { data: activeConsultations, error: checkError } = await supabase
        .from('consultations')
        .select('id')
        .eq('patient_id', id)
        .in('status', ['active', 'today']);

      if (checkError) throw new Error(checkError.message);

      if (activeConsultations && activeConsultations.length > 0) {
        throw new Error(
          'Cannot delete patient: The patient is currently involved in an active consultation call or scheduled for consultation today.',
        );
      }

      const { error } = await supabase.from('patients').delete().eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PatientQueryEnum.PatientAll] });
      queryClient.invalidateQueries({ queryKey: ['PatientCount'] });
    },
  });
};

export const usePatientsCount = () => {
  const supabase = createClient();

  return useQuery<number, Error>({
    queryKey: ['PatientCount'],
    queryFn: async () => {
      if (typeof window === 'undefined') return 0;
      const lastSeen = localStorage.getItem('last_seen_patient_time');
      if (!lastSeen) {
        // If not set yet, initialize it to now so they start with 0
        localStorage.setItem('last_seen_patient_time', new Date().toISOString());
        return 0;
      }

      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastSeen);

      if (error) throw new Error(error.message);
      return count || 0;
    },
    refetchInterval: 30000,
  });
};

export const usePatientRealtime = (id?: string) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(id ? `patient-detail-${id}-${channelId}` : `patient-changes-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          ...(id && { filter: `id=eq.${id}` }),
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['PatientCount'] });
          queryClient.invalidateQueries({ queryKey: [PatientQueryEnum.PatientAll] });
          if (id) {
            queryClient.invalidateQueries({ queryKey: [PatientQueryEnum.PatientGet, id] });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, id]);
};
