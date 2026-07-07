export type TPatientDoctor = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type TPatient = {
  id: string;
  doctor_a_id: string;
  full_name: string;
  age: string;
  gender: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  medical_history: string | null;
  current_medications: string | null;
  allergies: string | null;
  blood_type: string | null;
  created_at: string;
  updated_at: string;
  doctor_a?: TPatientDoctor | null;
};

export type TPatientPayload = Omit<TPatient, 'id' | 'created_at' | 'updated_at' | 'doctor_a'>;
