import { useQuery } from '@tanstack/react-query';

import { createClient } from '@/utils/supabase/client';

export type TTimeRange = '7d' | '30d' | '90d';

export type TUserGrowthData = {
  date: string;
  gpDoctors: number;
  specialistDoctors: number;
  patients: number;
};

export type TDoctorStatusRatio = {
  active: number;
  inactive: number;
};

export type TConsultationActivityData = {
  date: string;
  voice: number;
  video: number;
  text: number;
  total: number;
};

export type TPeakUsageData = {
  hour: string; // "12 AM", "1 AM", ... "11 PM"
  voice: number;
  video: number;
  text: number;
  total: number;
};

export type TReportTrendData = {
  date: string;
  consultation: number;
  patient: number;
  other: number;
  total: number;
};

export type TDashboardTrends = {
  userGrowth: TUserGrowthData[];
  doctorStatusRatio: TDoctorStatusRatio;
  consultationActivity: TConsultationActivityData[];
  peakUsage: TPeakUsageData[];
  reportGeneration: TReportTrendData[];
};

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useGetDashboardTrends(range: TTimeRange, refreshInterval: number) {
  const supabase = createClient();

  return useQuery<TDashboardTrends, Error>({
    queryKey: ['dashboardTrendsClient', range],
    queryFn: async () => {
      // 1. Determine date range
      const now = new Date();
      const startDate = new Date();
      let daysLimit = 30;
      if (range === '7d') {
        daysLimit = 7;
      } else if (range === '90d') {
        daysLimit = 90;
      }
      
      startDate.setDate(now.getDate() - (daysLimit - 1));
      startDate.setHours(0, 0, 0, 0);

      // 2. Fetch all necessary data from the database
      const [
        { data: doctorRoles, error: doctorRolesError },
        { data: profiles, error: profilesError },
        { data: patients, error: patientsError },
        { data: consultations, error: consultationsError },
      ] = await Promise.all([
        supabase.from('user_roles').select('user_id, role').in('role', ['doctor_a', 'doctor_b']),
        supabase.from('profiles').select('id, status, created_at'),
        supabase.from('patients').select('created_at'),
        supabase.from('consultations_with_status').select('created_at, consultation_type, status'),
      ]);

      if (doctorRolesError) throw new Error(`Doctor roles: ${doctorRolesError.message}`);
      if (profilesError) throw new Error(`Profiles: ${profilesError.message}`);
      if (patientsError) throw new Error(`Patients: ${patientsError.message}`);
      if (consultationsError) throw new Error(`Consultations: ${consultationsError.message}`);

      // Create a map of doctor user_id to role
      const doctorRoleMap = new Map<string, 'doctor_a' | 'doctor_b'>();
      (doctorRoles || []).forEach((r) => {
        doctorRoleMap.set(r.user_id, r.role as 'doctor_a' | 'doctor_b');
      });

      // Filter profiles that are actually doctors (have a role mapping)
      const doctorProfiles = (profiles || []).filter((p) => doctorRoleMap.has(p.id));

      // 3. Compute Doctor Status Ratio (Active vs Inactive)
      let activeDoctorsCount = 0;
      let inactiveDoctorsCount = 0;
      doctorProfiles.forEach((p) => {
        if (p.status === 'active') {
          activeDoctorsCount += 1;
        } else if (p.status === 'inactive') {
          inactiveDoctorsCount += 1;
        }
      });

      // 4. Generate the date series for the requested range
      const datesArray: string[] = [];
      const tempDate = new Date(startDate);
      while (tempDate <= now) {
        datesArray.push(getLocalDateString(tempDate));
        tempDate.setDate(tempDate.getDate() + 1);
      }

      // --- USER GROWTH TRENDS ---
      let gpBaseline = 0;
      let specialistBaseline = 0;
      let patientBaseline = 0;

      doctorProfiles.forEach((doc) => {
        const docCreatedAt = new Date(doc.created_at);
        if (docCreatedAt < startDate) {
          const role = doctorRoleMap.get(doc.id);
          if (role === 'doctor_a') gpBaseline += 1;
          if (role === 'doctor_b') specialistBaseline += 1;
        }
      });

      (patients || []).forEach((pat) => {
        const patCreatedAt = new Date(pat.created_at);
        if (patCreatedAt < startDate) {
          patientBaseline += 1;
        }
      });

      const gpIncrements = new Map<string, number>();
      const specialistIncrements = new Map<string, number>();
      const patientIncrements = new Map<string, number>();

      doctorProfiles.forEach((doc) => {
        const docCreatedAt = new Date(doc.created_at);
        if (docCreatedAt >= startDate) {
          const dateStr = getLocalDateString(docCreatedAt);
          const role = doctorRoleMap.get(doc.id);
          if (role === 'doctor_a') {
            gpIncrements.set(dateStr, (gpIncrements.get(dateStr) || 0) + 1);
          } else if (role === 'doctor_b') {
            specialistIncrements.set(dateStr, (specialistIncrements.get(dateStr) || 0) + 1);
          }
        }
      });

      (patients || []).forEach((pat) => {
        const patCreatedAt = new Date(pat.created_at);
        if (patCreatedAt >= startDate) {
          const dateStr = getLocalDateString(patCreatedAt);
          patientIncrements.set(dateStr, (patientIncrements.get(dateStr) || 0) + 1);
        }
      });

      let currentGp = gpBaseline;
      let currentSpecialist = specialistBaseline;
      let currentPatient = patientBaseline;

      const userGrowth: TUserGrowthData[] = datesArray.map((date) => {
        currentGp += gpIncrements.get(date) || 0;
        currentSpecialist += specialistIncrements.get(date) || 0;
        currentPatient += patientIncrements.get(date) || 0;

        return {
          date,
          gpDoctors: currentGp,
          specialistDoctors: currentSpecialist,
          patients: currentPatient,
        };
      });

      // --- CONSULTATION ACTIVITY TRENDS ---
      const referralDailyStats = new Map<string, { voice: number; video: number; text: number }>();
      const hourlyCounts = Array.from({ length: 24 }, () => ({ voice: 0, video: 0, text: 0, total: 0 }));

      (consultations || []).forEach((c) => {
        const cCreatedAt = new Date(c.created_at);
        
        if (cCreatedAt >= startDate) {
          const dateStr = getLocalDateString(cCreatedAt);
          const type = (c.consultation_type || '').toLowerCase();
          
          const stats = referralDailyStats.get(dateStr) || { voice: 0, video: 0, text: 0 };
          
          const hour = cCreatedAt.getHours();
          
          if (type === 'voice') {
            stats.voice += 1;
            hourlyCounts[hour].voice += 1;
          } else if (type === 'video') {
            stats.video += 1;
            hourlyCounts[hour].video += 1;
          } else if (type === 'text') {
            stats.text += 1;
            hourlyCounts[hour].text += 1;
          }
          
          hourlyCounts[hour].total += 1;

          referralDailyStats.set(dateStr, stats);
        }
      });

      const consultationActivity: TConsultationActivityData[] = datesArray.map((date) => {
        const stats = referralDailyStats.get(date) || { voice: 0, video: 0, text: 0 };
        return {
          date,
          voice: stats.voice,
          video: stats.video,
          text: stats.text,
          total: stats.voice + stats.video + stats.text,
        };
      });

      const peakUsage: TPeakUsageData[] = hourlyCounts.map((stats, index) => {
        const hourNum = index % 12 === 0 ? 12 : index % 12;
        const ampm = index < 12 ? 'AM' : 'PM';
        return {
          hour: `${hourNum} ${ampm}`,
          voice: stats.voice,
          video: stats.video,
          text: stats.text,
          total: stats.total,
        };
      });

      // --- REPORT GENERATION TRENDS (Completed Consultations) ---
      const reportDailyCounts = new Map<string, number>();
      (consultations || []).forEach((c) => {
        if (c.status === 'completed') {
          const createdAt = new Date(c.created_at);
          if (createdAt >= startDate) {
            const dateStr = getLocalDateString(createdAt);
            reportDailyCounts.set(dateStr, (reportDailyCounts.get(dateStr) || 0) + 1);
          }
        }
      });

      const reportGeneration: TReportTrendData[] = datesArray.map((date) => {
        const count = reportDailyCounts.get(date) || 0;
        return {
          date,
          consultation: count,
          patient: 0,
          other: 0,
          total: count,
        };
      });

      return {
        userGrowth,
        doctorStatusRatio: {
          active: activeDoctorsCount,
          inactive: inactiveDoctorsCount,
        },
        consultationActivity,
        peakUsage,
        reportGeneration,
      };
    },
    refetchInterval: refreshInterval > 0 ? refreshInterval : false,
  });
}
