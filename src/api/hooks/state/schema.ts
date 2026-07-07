export type TState = {
  id: string;
  name: string;
  status: string | null;
  created_at: string | null;
};

export type TStatePayload = Omit<TState, 'id' | 'created_at'>;

export type TStateUpdatePayload = Partial<TStatePayload>;
