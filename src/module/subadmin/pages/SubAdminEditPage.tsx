'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import SubadminAddEditForm from '../components/SubAdminAddEditForm';
import {
  subadminPermissionActions,
  subadminPermissionModules,
  TSubadminFormValues,
  TSubadminPermissionAction,
  TSubadminPermissionModule,
} from '../zod/subadmin.schema';

import {
  useGeTSubadminById,
  useGetSubadminPermissions,
  useUpdateSubadmin,
} from '@/api/hooks/subadmin/hooks';
import { TSubadminPermission } from '@/api/hooks/subadmin/schema';
import { ROUTES } from '@/navigation/sidebar/routes';

const isPermissionModule = (value: string): value is TSubadminPermissionModule =>
  subadminPermissionModules.includes(value as TSubadminPermissionModule);

const isPermissionAction = (value: unknown): value is TSubadminPermissionAction =>
  subadminPermissionActions.includes(value as TSubadminPermissionAction);

const createEmptyPermissions = (): TSubadminFormValues['permissions'] =>
  Object.fromEntries(
    subadminPermissionModules.map((moduleName) => [moduleName, []]),
  ) as TSubadminFormValues['permissions'];

const mapSubadminPermissions = (
  permissions: TSubadminPermission[] = [],
): TSubadminFormValues['permissions'] => {
  const mappedPermissions = createEmptyPermissions();

  permissions.forEach((item) => {
    if (!isPermissionModule(item.module)) return;

    mappedPermissions[item.module] = Array.isArray(item.permission)
      ? item.permission.filter(isPermissionAction)
      : [];
  });

  return mappedPermissions;
};

export default function SubadminEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: subadmin, isLoading: isSubadminLoading, error } = useGeTSubadminById(id);
  const {
    data: subadminPermissions,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = useGetSubadminPermissions(id);
  const { mutate: updateSubadmin, isPending } = useUpdateSubadmin();

  const handleSubmit = (data: Partial<TSubadminFormValues>) => {
    updateSubadmin(
      { id, data: data as TSubadminFormValues },
      {
        onSuccess: () => {
          toast.success('Subadmin updated successfully');
          router.push(ROUTES.subadmin.list);
        },
        onError: (mutationError) => {
          toast.error(mutationError.message || 'Failed to update subadmin');
        },
      },
    );
  };

  if (isSubadminLoading || isPermissionsLoading) {
    return <div className="text-muted-foreground p-4 text-sm">Loading subadmin details...</div>;
  }

  if (error || permissionsError || !subadmin) {
    return (
      <div className="text-destructive p-4 text-sm">
        {error?.message || permissionsError?.message || 'Patient not found'}
      </div>
    );
  }

  return (
    <div className="w-full">
      <SubadminAddEditForm
        title="Edit Subadmin"
        loading={isPending}
        initialData={{
          full_name: subadmin.full_name,
          email: subadmin.email,
          category: subadmin.category,
          image: subadmin.image as unknown as File,
          permissions: mapSubadminPermissions(subadminPermissions),
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
