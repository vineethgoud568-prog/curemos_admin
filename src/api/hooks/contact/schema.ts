export type TContact = {
  id: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
};

export type TContactPayload = Omit<TContact, 'id' | 'created_at' | 'updated_at'>;

export type TContactUpdatePayload = Partial<TContactPayload>;
