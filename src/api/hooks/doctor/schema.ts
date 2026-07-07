export type TDoctorRole = 'doctor_a' | 'doctor_b';

export type TDoctorProfile = {
  id: string;
  id_text?: string | null;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  department?: {
    id: string;
    name: string;
  };
  department_obj?: {
    id: string;
    name: string;
  } | null;
  secondary_contact?: string | null;
  medical_license: string | null;
  medical_license_number?: string | null;
  specialization?: string | null;
  hospital_affiliation?: string | null;
  hospital_name?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at?: string | null;
  department_id: string | null;
  availability_status?: string | null;
  location: string | null;
  country: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  years_of_experience: number | null;
  specializations?: string[] | null;
  area_of_interests?: string[] | string | null;
  nmc_registration_year: number | null;
  state_medical_council: string | null;
  status?: 'active' | 'inactive' | null;
  sequence_no?: number | null;
  isVerified?: boolean | null;
  isProfileComplete?: boolean | null;
  professional_name?: string | null;
  short_professional_bio?: string | null;
  total_consultations?: number | null;
  live_consultations?: number | null;
  scheduled_consultations?: number | null;
  completed_consultations?: number | null;
  cancelled_scheduled_calls?: number | null;
  not_responded_calls?: number | null;
  no_of_referrals?: number | null;
  no_of_patient_turned_around?: number | null;
  no_of_patient_not_turned_around?: number | null;
  avg_consultation_duration?: number | null;
  referral_conversion_rate?: number | null;
  last_active_date?: string | null;
  patients?: {
    count: number;
  }[];
};

export type TDoctorUserRole = {
  id: string;
  user_id: string;
  role: TDoctorRole;
  created_at: string;
};

export type TDoctor = TDoctorProfile & {
  role: TDoctorRole;
  role_id?: string;
};

export type TDoctorPayload = Omit<
  TDoctorProfile,
  'id' | 'created_at' | 'updated_at' | 'email' | 'full_name' | 'phone' | 'country' | 'department'
> & {
  email: string;
  full_name: string;
  phone: string;
  role: TDoctorRole;
  department?: string | null;
};
