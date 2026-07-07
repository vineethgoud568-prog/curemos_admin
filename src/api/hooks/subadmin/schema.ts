export type TSubadmin = {
  id: string;
  full_name: string;
  category: string;
  email: string;
  password: string;
  image: string | File;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TSubadminPermission = {
  module: string;
  permission: string[];
};

export type TSubadminPayload = Omit<TSubadmin, 'id' | 'created_at' | 'updated_at'>;

export type TSubadminUpdatePayload = Partial<TSubadminPayload>;
