# API Service Structure

## Why React Query

There are many common problems that developers run into when integrating with APIs. Some of them include, but are not limited to:

- Managing loading and error states
- Caching responses
- Duplicate API calls across many areas of the UI

[React Query](https://tanstack.com/query/latest) not only solves this for us, but it significantly improves the quality of our codebase by providing a consistent consumer experience for dealing with APIs. No more weird nested fetch calls, storing `isLoading` and `error` in state, etc.

## Abstracting at the query level

Not only should we be abstracting the network call away from the consumer, but we should abstract the entire `useQuery` or `useMutation` hook as well. This is going to provide us with a few benefits:

- Consistent query keys for caching
- A more common consumer experience
- Keeping all API data isolated

Not only can we abstract these core options away from the consumer, but we can go a step further to prevent the consumer from overriding them in the first place by omitting these fields from the override options!

## Building an API Service

Each API service will have its own folder inside of `packages/apis/src`. For the sake of this guide, let's assume I'm create a new service called Auth. The layout of a service directory should look like the following:

```
/auth-service
  hooks.ts
  index.ts
  routes.ts
  schemas.ts
```

Inside of `routes.ts`, an enum will exist to serve as the single source of truth for all routes that the service will hit. It will be consumed in `hooks.ts`. It will look like the following:

```js
export enum AuthService {
  Account = 'account'
  GetUser = 'user/:id'
  ...
}
```

We also need a uniform way to represent the schemas corresponding to our API data. `schemas.ts` comes into play to do just that. By creating a single interface that houses all of the schemas, it is made obvious to the consumer where exactly this schema is coming from and the type of data it represents. Your `schemas.ts` file should look like:

```js
export type TAuthModel = {
  Account: {
    id: string;
    isActive: boolean
  };
  User: {
    name: string;
    email: string
  }
  ...
}
```

We will be able to access `Account` via `TAuthModel['Account']`, making it easy to tell the corresponding data is an account that is driven from the authentication APIs.

We put this all together in `hooks.ts`, where we define the queries we will use to get and update our data. Each API will expose a type that defines the function so consumer packages have access to it in a complete type safe manner. We also have helper types located in `common/schemas.ts` for the options object that omits certain fields. Each hook should following the following structure:

```js
// Query
export type TUseGetAccount = (
  id: string,
  options?: TUseQueryOptions<TAuthModel['Account']>,
) => UseQueryResult<TAuthModel['Account']>;

export const useGetAccount: TUseGetAccount = (id, options) => {
  const url = buildUrl({
    pathParams: {
      id,
    },
    url: AuthRoute.GetAccount,
  });

  return useQuery({
    ...options,
    queryKey: ['use-get-account', id],
    queryFn: async () => {
      const res = await axiosInstance.post(url);
      return res.data;
    },
  });
};

// Mutation
export type TUseLogin = (
  options?: TUseMutationOptions<
    TAuthModel['LoginResponse'],
    Error,
    TAuthModel['LoginPayload'],
  >,
) => UseMutationResult<
  TAuthModel['LoginResponse'],
  Error,
  TAuthModel['LoginPayload'],
>;

export const useLogin: TUseLogin = (options) => {
  return useMutation({
    ...options,
    mutationKey: ['use-login'],
    mutationFn: async (data) => {
      const res = await axiosInstance.post(AuthRoute.Login, data);
      return res.data;
    },
  });
};
```

Inside of `index.ts`, we will export everything from `routes.ts` and `schemas.ts` directly. As for the hooks, we will wrap it within an object called `authService`, so the consumer knows right away which service the hook corresponds to. Your `index.ts` file should look like:

```js
import * as authHooks from './hooks';
export * from './routes';
export * from './schemas';

export const authService = {
  ...authHooks,
};
```

And finally, don't forget to export everything from the top level `index.ts` file via `export * from './auth-service';`

## Invalidating API Calls

Sometimes we may have an API call that updates data, where we need to refetch the dataset in order to pull in the new updates. React Query allows us to invalidate certain query calls via the `queryKey`, which will tell the hook to refire the API call!

When we know this behavior will be consistent in all use cases of the hook, we should abstract this logic in the query level like so:

```js
import { useQueryClient, useQuery } from '@tanstack/react-query';

export const useGetAccount: TUseGetAccount = (id, options) => {
  const queryClient = useQueryClient();

  return useQuery({
    ...options,
    // queryKey and queryFn params removed for brevity
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({
        queryKey: [<query-key>],
      });
      // Ensure consumer can still provide onSuccess option!
      options?.onSuccess?.(...args);
    },
  });
};
```
