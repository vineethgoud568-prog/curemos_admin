'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileCheck,
  FileText,
  GitMerge,
  HelpCircle,
  Image as ImageIcon,
  Landmark,
  Loader2,
  Lock,
  LucideIcon,
  Mail,
  Search,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  subadminFormSchema,
  subadminPermissionActions,
  subadminPermissionModules,
  TSubadminFormValues,
} from '../zod/subadmin.schema';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, getAllowedPermissions } from '@/lib/utils';

const permissionLabels: Record<string, string> = {
  add: 'Add',
  edit: 'Edit',
  view: 'View',
  list: 'List',
  delete: 'Delete',
};

const moduleIcons: Record<string, LucideIcon> = {
  doctor: Stethoscope,
  patient: User,
  subadmin: ShieldCheck,
  department: Landmark,
  report: FileText,
  referral: GitMerge,
  faq: HelpCircle,
  'privacy-policy': Lock,
  'terms-and-conditions': FileCheck,
  contact: Mail,
  banners: ImageIcon,
};

interface ISubadminAddEditFormProps {
  title: string;
  loading: boolean;
  initialData?: Partial<TSubadminFormValues>;
  onSubmit: (data: TSubadminFormValues) => void | Promise<void>;
}

const SubadminAddEditForm: React.FC<ISubadminAddEditFormProps> = ({
  title,
  loading,
  onSubmit,
  initialData,
}) => {
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultValues: Partial<TSubadminFormValues> = {
    full_name: '',
    image: '' as string,
    permissions: {
      doctor: [],
      patient: [],
    },
    ...initialData,
  };

  const form = useForm<TSubadminFormValues>({
    resolver: zodResolver(subadminFormSchema),
    defaultValues,
  });

  const isEdit = initialData?.email;

  const {
    reset,
    handleSubmit,
    clearErrors,
    watch,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset({ ...defaultValues, ...initialData });
      if (typeof initialData.image === 'string') {
        setProfilePreview(initialData.image);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, reset]);

  const handleReset = () => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset({ ...defaultValues, ...initialData });
      if (typeof initialData.image === 'string') {
        setProfilePreview(initialData.image);
      }
    }
    // reset(defaultValues);
  };

  const isAllSelected = () => {
    const permissions = watch('permissions');

    return subadminPermissionModules
      .filter((m) => m !== 'subadmin')
      .every((moduleName) => {
        const selected = permissions?.[moduleName] || [];
        const allowed = getAllowedPermissions(moduleName);

        return allowed.every((p) => selected.includes(p));
      });
  };

  const filteredModules = subadminPermissionModules
    .filter((m) => m !== 'subadmin')
    .filter((moduleName) => moduleName.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectAllModules = (checked: boolean) => {
    const updatedPermissions: Record<string, string[]> = {};

    subadminPermissionModules.forEach((moduleName) => {
      if (moduleName === 'subadmin') return;

      const allowedPermissions = getAllowedPermissions(moduleName);

      updatedPermissions[moduleName] = checked ? allowedPermissions : [];
    });

    form.setValue('permissions', updatedPermissions);
  };

  return (
    <div className="w-full space-y-4 p-4">
      <PageCardHeader title={title} backButton hideAddButton />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="pb-20">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Left Column: Basic Info & Avatar */}
            <div className="space-y-6 lg:col-span-4">
              <Card className="overflow-hidden border-none shadow-lg ring-1 ring-slate-200">
                <div className="bg-primary/5 border-b border-slate-100 p-6 text-center">
                  <div className="group relative mx-auto h-32 w-32">
                    <div className="ring-primary/10 relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-slate-50 shadow-xl ring-1">
                      {profilePreview ? (
                        <Image src={profilePreview} alt="Profile" fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <User size={64} />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <label
                        htmlFor="profile-upload"
                        className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100"
                      >
                        <Camera size={24} className="mb-1" />
                        <span className="text-[10px] font-bold tracking-wider uppercase">
                          Change
                        </span>
                      </label>
                    </div>

                    {profilePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfilePreview(null);
                          form.setValue('image', '');
                        }}
                        className="bg-destructive absolute -top-1 -right-1 rounded-full p-1.5 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <input
                      id="profile-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          form.setError('image', {
                            type: 'manual',
                            message: 'Only image files are allowed',
                          });
                          return;
                        }
                        if (file) {
                          form.setValue('image', file);
                          clearErrors('image');
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfilePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <h3 className="text-primary mt-4 text-lg font-bold capitalize">
                    {watch('full_name') || 'New Subadmin'}
                  </h3>
                  <p className="text-sm text-slate-500">{watch('email') || 'Email not set'}</p>
                </div>
                {!!errors?.image && (
                  <div className="bg-destructive/5 text-destructive border-destructive/10 animate-in fade-in slide-in-from-top-1 mx-3 flex items-center gap-2 rounded-lg border p-3">
                    <AlertCircle size={16} />
                    <p className="text-xs font-medium">{errors?.image?.message}</p>
                  </div>
                )}

                <CardContent className="space-y-4 p-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                              size={18}
                            />
                            <Input
                              placeholder="Enter full name"
                              className="focus:border-primary focus:ring-primary/5 h-11 border-slate-200 pl-10 transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                              size={18}
                            />
                            <Input
                              placeholder="Enter email address"
                              className="focus:border-primary focus:ring-primary/5 h-11 border-slate-200 pl-10 transition-all"
                              disabled={!!isEdit}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Role</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                              size={18}
                            />
                            <Input
                              placeholder="Enter role name"
                              className="focus:border-primary focus:ring-primary/5 h-11 border-slate-200 pl-10 transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Desktop Sticky Actions (Hidden on Mobile) */}
              <div className="sticky top-6 hidden lg:block">
                <Card className="border-none p-4 shadow-lg ring-1 ring-slate-200">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="h-11 w-full gap-2 text-base font-bold shadow-md transition-all hover:shadow-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                      {loading ? 'Saving Changes...' : 'Save Subadmin'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="h-11 w-full border-slate-200 font-bold text-slate-600 transition-all hover:bg-slate-50"
                      disabled={loading}
                    >
                      Reset Form
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column: Permissions Matrix */}
            <div className="space-y-6 lg:col-span-8">
              <Card className="overflow-hidden border-none shadow-lg ring-1 ring-slate-200">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-white p-6 md:flex-row md:items-center">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                      <ShieldCheck className="text-primary" />
                      Permissions Control
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Configure access levels for each module.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative w-full md:w-64">
                      <Search
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <Input
                        placeholder="Search modules..."
                        className="focus:ring-primary h-10 border-none bg-slate-50 pl-9 text-sm ring-1 ring-slate-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 whitespace-nowrap ring-1 ring-slate-200">
                      <Checkbox
                        id="select-all"
                        checked={isAllSelected()}
                        onCheckedChange={(checked) => handleSelectAllModules(!!checked)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label
                        htmlFor="select-all"
                        className="cursor-pointer text-xs font-bold text-slate-700"
                      >
                        Select All
                      </Label>
                    </div>
                  </div>
                </div>

                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {filteredModules.length > 0 ? (
                      filteredModules.map((moduleName) => {
                        const IconComponent = moduleIcons[moduleName] || ShieldCheck;
                        const allowedActions = getAllowedPermissions(moduleName);

                        return (
                          <FormField
                            key={moduleName}
                            control={form.control}
                            name={`permissions.${moduleName}`}
                            render={({ field }) => {
                              const selectedPermissions = field.value || [];
                              const isModuleAllSelected = allowedActions.every((p) =>
                                selectedPermissions.includes(p),
                              );

                              return (
                                <div className="group p-6 transition-colors hover:bg-slate-50/50">
                                  <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[200px_1fr]">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={cn(
                                            'rounded-xl p-2 shadow-sm ring-1 ring-slate-200 transition-colors',
                                            selectedPermissions.length > 0
                                              ? 'bg-primary ring-primary text-white'
                                              : 'bg-white text-slate-400',
                                          )}
                                        >
                                          <IconComponent size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm leading-none font-bold text-slate-900 capitalize">
                                            {moduleName.replace(/-/g, ' ')}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              field.onChange(
                                                isModuleAllSelected ? [] : allowedActions,
                                              );
                                            }}
                                            className="text-primary mt-1 text-left text-[10px] font-bold tracking-tighter uppercase hover:underline"
                                          >
                                            {isModuleAllSelected ? 'Unselect All' : 'Select All'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                      {subadminPermissionActions.map((permission) => {
                                        if (!allowedActions.includes(permission)) return null;

                                        const inputId = `${moduleName}-${permission}`;
                                        const isSelected = selectedPermissions.includes(permission);

                                        return (
                                          <label
                                            key={permission}
                                            htmlFor={inputId}
                                            className={cn(
                                              'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-all select-none',
                                              isSelected
                                                ? 'bg-primary/5 border-primary text-primary shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                                            )}
                                          >
                                            <Checkbox
                                              id={inputId}
                                              checked={isSelected}
                                              onCheckedChange={(checked) => {
                                                const updated = new Set(selectedPermissions);
                                                if (checked) {
                                                  updated.add(permission);
                                                  // Auto-add list if other actions are selected
                                                  if (
                                                    ['add', 'edit', 'delete', 'view'].includes(
                                                      permission,
                                                    )
                                                  ) {
                                                    updated.add('list');
                                                  }
                                                } else {
                                                  if (permission === 'list') {
                                                    const hasOther = [...updated].some(
                                                      (p) => p !== 'list',
                                                    );
                                                    if (hasOther) return;
                                                  }
                                                  updated.delete(permission);
                                                }
                                                field.onChange(Array.from(updated));
                                              }}
                                              className={cn(
                                                'h-4 w-4 rounded border-slate-300',
                                                isSelected && 'bg-primary border-primary',
                                              )}
                                            />
                                            <span className="text-xs font-bold whitespace-nowrap">
                                              {permissionLabels[permission]}
                                            </span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          />
                        );
                      })
                    ) : (
                      <div className="space-y-3 p-20 text-center">
                        <div className="inline-flex rounded-full bg-slate-50 p-4 text-slate-300">
                          <Search size={32} />
                        </div>
                        <p className="font-medium text-slate-500">
                          No modules found matching "{searchQuery}"
                        </p>
                        <Button
                          variant="link"
                          onClick={() => setSearchQuery('')}
                          className="text-primary"
                        >
                          Clear search
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Floating Action Bar */}
          <div className="fixed right-0 bottom-0 left-0 z-50 flex gap-3 border-t border-slate-100 bg-white/80 p-4 shadow-2xl backdrop-blur-lg lg:hidden">
            <Button
              type="submit"
              className="h-12 flex-1 text-base font-bold shadow-lg"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-12 border-slate-200 px-6 font-bold text-slate-600"
              disabled={loading}
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SubadminAddEditForm;
