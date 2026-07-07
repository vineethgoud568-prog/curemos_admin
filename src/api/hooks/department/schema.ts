export type TDepartment = {
  id: string;
  name: string;
  image: string | File;
  status: string;
  created_at: string;
  updated_at: string;
  sequence_no?: number;
};

export type TDepartmentPayload = Omit<TDepartment, 'id' | 'created_at' | 'updated_at'>;

export type TDepartmentUpdatePayload = Partial<TDepartmentPayload>;
