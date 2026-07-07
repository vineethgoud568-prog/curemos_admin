import { TDoctorProfile } from '../doctor/schema';
import { TPatient } from '../patient/schema';

export type TReferralStatus = 'pending' | 'admitted' | 'discharged' | 'referralSent';

export interface TReferral {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_a_id: string;
  doctor_b_id: string;
  referral_date: string;
  status: TReferralStatus;
  admission_date: string | null;
  notes: string | null;
  diagnosis: string | null;
  recommended_treatment: string | null;
  created_at: string;
  updated_at: string;

  assigned_subadmin_id?: string | null;

  // Joined fields
  patient?: TPatient;
  doctor_a?: TDoctorProfile;
  doctor_b?: TDoctorProfile;
  assigned_person?: {
    full_name: string;
    email: string;
  } | null;
}

export interface TAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;

  // Optional joined admin
  admin_profile?: {
    full_name: string;
    email: string;
  };
}
