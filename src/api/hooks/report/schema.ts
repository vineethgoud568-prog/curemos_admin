export type TReportDoctor = {
  id: string;
  full_name: string | null;
  email: string | null;
  department_id: string | null;
};

export type TReportPatient = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type TReport = {
  id: string;
  title: string;
  type: string;
  associated_user: string | null;
  doctor_id?: string | null;
  patient_id?: string | null;
  report?: string | File;
  is_archived?: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
  doctor?: TReportDoctor | null;
  patient?: TReportPatient | null;
};

export type TReportPayload = Omit<
  TReport,
  'id' | 'created_at' | 'updated_at' | 'doctor' | 'patient'
>;

export type TReportUpdatePayload = Partial<TReportPayload>;

export type TReportDoctorProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  department: string;
  specialization?: string | null;
  specializations?: string[] | null;
  state: string | null;
  district: string | null;
  total_consultations?: number | null;
  no_of_referrals?: number | null;
  no_of_patient_turned_around?: number | null;
  no_of_patient_not_turned_around?: number | null;
  referral_conversion_rate?: number | null;
  created_at: string;
  patients?: {
    count: number;
  }[];
  live_consultations?: number | null;
  scheduled_consultations?: number | null;
  completed_consultations?: number | null;
  cancelled_scheduled_calls?: number | null;
  not_responded_calls?: number | null;
  avg_consultation_duration?: number | null;

  department_id: string | null;
};
