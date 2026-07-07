import { UseMutationOptions } from '@tanstack/react-query';

export type TUseMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationKey' | 'mutationFn'>;
