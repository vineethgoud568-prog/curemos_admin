'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { attachConsultationStats } from '../doctor/hooks';

import { ReportQueryEnum } from './key';
import { TReport, TReportDoctorProfile, TReportPayload } from './schema';

import { TTableParams } from '@/@core/utils/supabase-query';
import { createClient } from '@/utils/supabase/client';

const REPORT_SELECT = `
  *,
  doctor:profiles!reports_doctor_id_fkey(
    id,
    full_name,
    email,
    department_id
  ),
  patient:patients!reports_patient_id_fkey(
    id,
    full_name,
    email
  )
`;

type TReportDepartment = TReportDoctorProfile['department'];
type TReportDoctorProfileQueryRow = Omit<Partial<TReportDoctorProfile>, 'id' | 'department'> &
  Pick<TReportDoctorProfile, 'id'> & {
    department?: TReportDepartment | TReportDepartment[] | null;
  };
type TReportDoctorProfileNormalizedRow = Omit<Partial<TReportDoctorProfile>, 'id'> &
  Pick<TReportDoctorProfile, 'id'>;

const normalizeDoctorProfileRows = (
  rows: TReportDoctorProfileQueryRow[],
): TReportDoctorProfileNormalizedRow[] =>
  rows.map(({ department, ...row }) => ({
    ...row,
    department: Array.isArray(department) ? department[0] : department || undefined,
  }));

const getReportRowsWithStats = async (
  supabase: ReturnType<typeof createClient>,
  rows: TReportDoctorProfileQueryRow[],
) => {
  const normalizedRows = normalizeDoctorProfileRows(rows);

  return attachConsultationStats(supabase, normalizedRows);
};

const buildReportsQuery = (
  supabase: ReturnType<typeof createClient>,
  params: TTableParams,
  withPagination: boolean,
) => {
  let query = supabase
    .from('profiles')
    .select(
      `
      id,
      full_name,
      email,
      phone,
      state,
      district,
      department,
      department_id,
      total_consultations,
      live_consultations,
      scheduled_consultations,
      completed_consultations,
      cancelled_scheduled_calls,
      not_responded_calls,
      created_at,
      avg_consultation_duration,
      specialization,
      specializations
    `,
      { count: 'exact' },
    )
    .order('total_consultations', {
      ascending: false,
    });

  if (params.search) {
    query = query.or(`full_name.ilike.%${params.search}%, email.ilike.%${params.search}%`);
  }

  if (params.timeFilter && params.timeFilter !== 'all') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    if (params.timeFilter === 'daily') {
      const startOfDay = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));

      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    if (params.timeFilter === 'week') {
      const currentDay = now.getDay();
      const diffToWeekStart = currentDay === 0 ? -6 : 1 - currentDay;
      const startOfWeek = new Date(Date.UTC(year, month, date + diffToWeekStart, 0, 0, 0, 0));
      const endOfWeek = new Date(
        Date.UTC(year, month, date + diffToWeekStart + 6, 23, 59, 59, 999),
      );

      query = query
        .gte('created_at', startOfWeek.toISOString())
        .lte('created_at', endOfWeek.toISOString());
    }

    if (params.timeFilter === 'month') {
      const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      query = query
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());
    }
  }

  if (params.startRange && params.endRange) {
    query = query.gte('created_at', params.startRange).lte('created_at', params.endRange);
  } else if (params.startRange) {
    query = query.gte('created_at', params.startRange);
  } else if (params.endRange) {
    query = query.lte('created_at', params.endRange);
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

  // 🏥 Department filter (FIXED)
  const selectedDept = params.dept?.trim();

  if (selectedDept && selectedDept !== 'all') {
    // If dept is ID → use eq
    query = query.eq('department_id', selectedDept);

    // If instead you want to filter by department name:
    // query = query.ilike('department.name', `%${selectedDept}%`);
  }

  if (withPagination) {
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;

    query = query.range(from, to);
  }

  return query.order('created_at', {
    ascending: false,
  });
};

export const useGetConsultationsReports = (
  params: TTableParams,
  options?: { enabled?: boolean; reportType?: string },
) => {
  const supabase = createClient();

  return useQuery<{ data: Partial<TReportDoctorProfile>[]; total: number }, Error>({
    queryKey: [ReportQueryEnum.ReportConsultations, params, options?.reportType],
    queryFn: async () => {
      const { data, count, error } = await buildReportsQuery(supabase, params, true);

      if (error) throw new Error(error.message);

      const profilesWithStats = await getReportRowsWithStats(
        supabase,
        (data || []) as unknown as TReportDoctorProfileQueryRow[],
      );

      return {
        data: profilesWithStats || [],
        total: count || 0,
      };
    },
    enabled: options?.enabled,
  });
};

const buildDoctorPatientQuery = (
  supabase: ReturnType<typeof createClient>,
  params: TTableParams,
  withPagination: boolean,
) => {
  let query = supabase
    .from('profiles')
    .select(
      `
        id,
        full_name,
        email,
        phone,
      state,
      district,
      department,
      department_id,
    

        total_consultations,

        no_of_referrals,

        no_of_patient_turned_around,

        no_of_patient_not_turned_around,

        referral_conversion_rate,

        created_at,
        specialization,
        specializations,
        
        patients:patients(count)
      `,
      { count: 'exact' },
    )
    .order('total_consultations', {
      ascending: false,
    });

  // Search
  if (params.search) {
    query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
  }

  if (params.timeFilter && params.timeFilter !== 'all') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    if (params.timeFilter === 'daily') {
      const startOfDay = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));

      query = query
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
    }

    if (params.timeFilter === 'week') {
      const currentDay = now.getDay();
      const diffToWeekStart = currentDay === 0 ? -6 : 1 - currentDay;
      const startOfWeek = new Date(Date.UTC(year, month, date + diffToWeekStart, 0, 0, 0, 0));
      const endOfWeek = new Date(
        Date.UTC(year, month, date + diffToWeekStart + 6, 23, 59, 59, 999),
      );

      query = query
        .gte('created_at', startOfWeek.toISOString())
        .lte('created_at', endOfWeek.toISOString());
    }

    if (params.timeFilter === 'month') {
      const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      query = query
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());
    }
  }

  if (params.startRange && params.endRange) {
    query = query.gte('created_at', params.startRange).lte('created_at', params.endRange);
  } else if (params.startRange) {
    query = query.gte('created_at', params.startRange);
  } else if (params.endRange) {
    query = query.lte('created_at', params.endRange);
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

  // 🏥 Department filter (FIXED)
  const selectedDept = params.dept?.trim();

  if (selectedDept && selectedDept !== 'all') {
    // If dept is ID → use eq
    query = query.eq('department_id', selectedDept);

    // If instead you want to filter by department name:
    // query = query.ilike('department.name', `%${selectedDept}%`);
  }

  // Pagination
  if (withPagination) {
    const from = (params.page - 1) * params.limit;

    const to = from + params.limit - 1;

    query = query.range(from, to);
  }

  return query;
};

export const useGetPatientsReports = (
  params: TTableParams,
  options?: { enabled?: boolean; reportType?: string },
) => {
  const supabase = createClient();

  return useQuery<{ data: Partial<TReportDoctorProfile>[]; total: number }, Error>({
    queryKey: [ReportQueryEnum.ReportPatients, params, options?.reportType],
    queryFn: async () => {
      const { data, count, error } = await buildDoctorPatientQuery(supabase, params, true);

      if (error) throw new Error(error.message);

      const profilesWithStats = await getReportRowsWithStats(
        supabase,
        (data || []) as unknown as TReportDoctorProfileQueryRow[],
      );

      return {
        data: profilesWithStats || [],
        total: count || 0,
      };
    },
    enabled: options?.enabled,
  });
};

export const useGetReportById = (id: string) => {
  const supabase = createClient();

  return useQuery<TReport, Error>({
    queryKey: [ReportQueryEnum.ReportGet, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(REPORT_SELECT)
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as TReport;
    },
    enabled: !!id,
  });
};

export const useAddReport = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TReport, Error, TReportPayload>({
    mutationFn: async (payload: TReportPayload) => {
      const { data, error } = await supabase.from('reports').insert([payload]).select().single();

      if (error) throw new Error(error.message);
      return data as TReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ReportQueryEnum.ReportAll] });
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TReport, Error, { id: string; data: TReportPayload }>({
    mutationFn: async ({ id, data }) => {
      let fileUrl = '';

      // ✅ CASE 1: new file selected (image / pdf / doc)
      if (data.report instanceof File) {
        const file = data.report;

        const fileExt = file.name.split('.').pop(); // get extension
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `departments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('departments') // 👈 use generic bucket name
          .upload(filePath, file, {
            contentType: file.type, // 🔥 important for pdf/doc
          });

        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrlData } = supabase.storage.from('departments').getPublicUrl(filePath);

        fileUrl = publicUrlData.publicUrl;
      }

      // ✅ CASE 2: already a URL (no change)
      else if (typeof data.report === 'string') {
        fileUrl = data.report;
      }

      // ✅ CASE 3: no file
      else {
        fileUrl = '';
      }

      const { data: updatedReport, error } = await supabase
        .from('reports')
        .update({
          ...data,
          report: fileUrl,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updatedReport as TReport;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ReportQueryEnum.ReportAll] });
      queryClient.invalidateQueries({ queryKey: [ReportQueryEnum.ReportGet, variables.id] });
    },
  });
};

export const useArchiveReport = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TReport, Error, { id: string; data: Partial<TReportPayload> }>({
    mutationFn: async ({ id, data }) => {
      const { data: updatedReport, error } = await supabase
        .from('reports')
        .update(data) // ✅ now accepts partial
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updatedReport as TReport;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ReportQueryEnum.ReportAll] });
      queryClient.invalidateQueries({ queryKey: [ReportQueryEnum.ReportGet, variables.id] });
    },
  });
};

export const useChangeStatusReport = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TReport, Error, { id: string; status: string }>({
    mutationFn: async ({ id, status }) => {
      const { data: updatedDepartment, error } = await supabase
        .from('reports')
        .update({
          status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return updatedDepartment as TReport;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ReportQueryEnum.ReportAll] });
      queryClient.invalidateQueries({
        queryKey: [ReportQueryEnum.ReportGet, variables.id],
      });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reports').delete().eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ReportQueryEnum.ReportAll] });
    },
  });
};

type TReportExportParams = TTableParams & {
  reportType?: 'consultation' | 'patient';
};

export const getReportsForExport = async (params: TReportExportParams) => {
  const supabase = createClient();
  const { data, error } =
    params.reportType === 'patient'
      ? await buildDoctorPatientQuery(supabase, params, false)
      : await buildReportsQuery(supabase, params, false);

  if (error) throw new Error(error.message);

  return getReportRowsWithStats(
    supabase,
    (data || []) as unknown as TReportDoctorProfileQueryRow[],
  );
};
