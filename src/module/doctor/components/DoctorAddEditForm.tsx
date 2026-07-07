'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { doctorFormSchema, TDoctorFormValues } from '../zod/doctor.schema';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { allowOnlyDigits } from '@/@core/utils/form';
import { useGetAllDepartment } from '@/api/hooks/department/hook';
import { useGetAllMedicalCouncils } from '@/api/hooks/doctor/hooks';
import RCSCSelectorInput from '@/components/shared/location-selector';
import { MediaUploader } from '@/components/shared/media-uploader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface IDoctorAddEditFormProps {
  title: string;
  loading: boolean;
  initialData?: Partial<TDoctorFormValues>;
  onSubmit: (data: TDoctorFormValues) => void | Promise<void>;
}

const defaultValues: TDoctorFormValues = {
  full_name: '',
  professional_name: '',
  short_professional_bio: '',
  email: '',
  phone: '',
  role: '',
  department_id: '',
  hospital_name: '',
  medical_license_number: '',
  location: '',
  country: 'India',
  state: '',
  district: '',
  pincode: '',
  hospital_affiliation: '',
  years_of_experience: '',
  nmc_registration_year: '',
  state_medical_council: '',
  medical_license: '',
  avatar_url: '',
  specialization: '',
  specializations: [],
  department_name: '',
};

const textFieldClass = 'md:col-span-1';

type TSelectOption = {
  label: string;
  value: string;
};

type TMultiSelectProps = {
  disabled?: boolean;
  isMulti?: boolean;
  onChange: (selected: TSelectOption[]) => void;
  options: TSelectOption[];
  placeholder?: string;
  value: TSelectOption[];
};

const MultiSelect = ({
  disabled,
  onChange,
  options,
  placeholder = 'Select options',
  value,
}: TMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const selectedValues = value.map((option) => option.value);

  const toggleOption = (option: TSelectOption) => {
    const isSelected = selectedValues.includes(option.value);
    const nextValue = isSelected
      ? value.filter((selected) => selected.value !== option.value)
      : [...value, option];

    onChange(nextValue);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'h-auto min-h-10 w-full min-w-[220px] justify-between px-3 py-2 font-normal',
              value.length === 0 && 'text-muted-foreground',
            )}
          >
            <span className="truncate">
              {value.length > 0 ? `${value.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search department..." />
            <CommandList>
              <CommandEmpty>No department found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggleOption(option)}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4 text-emerald-600',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((option) => (
            <Badge key={option.value} variant="secondary" className="gap-1">
              {option.label}
              <button
                type="button"
                onClick={() =>
                  onChange(value.filter((selected) => selected.value !== option.value))
                }
                className="rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const allowDecimalOnePlace = (onChange: (value: string) => void) => {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    const finalParts = value.split('.');
    if (finalParts[1] !== undefined) {
      value = `${finalParts[0]}.${finalParts[1].slice(0, 1)}`;
    }
    onChange(value);
  };
};

export default function DoctorAddEditForm({
  title,
  loading,
  initialData,
  onSubmit,
}: IDoctorAddEditFormProps) {
  const form = useForm<TDoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  });

  const { data: departmentNames } = useGetAllDepartment();
  const { data: medicalCouncils, isLoading: isCouncilsLoading } = useGetAllMedicalCouncils();

  const activeMedicalCouncils =
    medicalCouncils?.filter((council) => council.status === 'active') || [];

  const { reset, handleSubmit } = form;
  const selectedRole = form.watch('role');
  const isCuremosDoctor = selectedRole === 'doctor_b';

  const hasInitialized = useRef(false);

  const isEdit = initialData?.email;

  useEffect(() => {
    if (initialData && !hasInitialized.current) {
      hasInitialized.current = true;
      reset({
        ...defaultValues,
        ...initialData,
      });
    }
  }, [initialData, reset]);

  // Auto-resolve legacy department name to department_id when departmentNames loaded
  useEffect(() => {
    const currentDeptId = form.getValues('department_id');
    const deptName = initialData?.department_name;

    if (!currentDeptId && deptName && departmentNames && departmentNames.length > 0) {
      const matchedDept = departmentNames.find(
        (d) => d.name.toLowerCase() === deptName.toLowerCase(),
      );
      if (matchedDept) {
        form.setValue('department_id', matchedDept.id);
      }
    }
  }, [departmentNames, initialData, form]);

  useEffect(() => {
    const deptId = form.getValues('department_id');
    const specializations = form.getValues('specializations') || [];

    if (!departmentNames?.length || specializations.length > 0) return;

    const matchedDept = departmentNames.find((department) => department.id === deptId);

    if (matchedDept) {
      form.setValue('specializations', [matchedDept.name], {
        shouldValidate: true,
        shouldDirty: true,
      });

      form.setValue('department_name', matchedDept.name);
    }
  }, [departmentNames, form]);

  const setSelectedDepartments = (departmentIds: string[]) => {
    const selectedDepartments =
      departmentNames?.filter((department) => departmentIds.includes(department.id)) || [];
    const selectedNames = selectedDepartments.map((department) => department.name);

    form.setValue('department_id', selectedDepartments[0]?.id || '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('department_name', selectedDepartments[0]?.name || '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('specializations', selectedNames, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const departmentOptions =
    departmentNames?.map((department) => ({
      label: department.name,
      value: department.id,
    })) || [];

  const selectedSpecializations = form.watch('specializations') || [];
  const selectedDepartmentIds =
    departmentNames
      ?.filter((department) => selectedSpecializations.includes(department.name))
      .map((department) => department.id) || [];

  return (
    <div className="w-full space-y-4 p-4">
      <PageCardHeader title={title} backButton hideAddButton />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="grid grid-cols-1 gap-x-6 gap-y-6 pt-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Doctor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter doctor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professional_name"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Professional Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter professional name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Role</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);

                        if (value === 'doctor_a') {
                          const firstSelectedId =
                            selectedDepartmentIds[0] || form.getValues('department_id');
                          setSelectedDepartments(firstSelectedId ? [firstSelectedId] : []);
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full min-w-[220px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="doctor_a">Doctors</SelectItem>
                        <SelectItem value="doctor_b">Curemos Doctors</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                        disabled={!!isEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        {...field}
                        onChange={allowOnlyDigits(field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                {isCuremosDoctor ? (
                  <FormField
                    control={form.control}
                    name="specializations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Department</FormLabel>

                        <FormControl>
                          <MultiSelect
                            isMulti
                            options={departmentOptions}
                            value={departmentOptions.filter((option) =>
                              field.value?.includes(option.label),
                            )}
                            onChange={(selected) => {
                              const selectedNames = selected.map((option) => option.label);
                              const selectedIds = selected.map((option) => option.value);

                              form.setValue('specializations', selectedNames, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });

                              form.setValue('department_id', selectedIds[0] || '', {
                                shouldValidate: true,
                                shouldDirty: true,
                              });

                              form.setValue('department_name', selectedNames[0] || '', {
                                shouldValidate: true,
                                shouldDirty: true,
                              });

                              field.onChange(selectedNames);
                            }}
                            placeholder="Select departments"
                            disabled={!departmentOptions.length}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="specializations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Department</FormLabel>

                        <Select
                          value={selectedDepartmentIds[0] || ''}
                          onValueChange={(val) => {
                            const department = departmentNames?.find((d) => d.id === val);

                            const selectedName = department?.name || '';

                            form.setValue('specializations', [selectedName], {
                              shouldValidate: true,
                              shouldDirty: true,
                            });

                            form.setValue('department_id', val, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });

                            form.setValue('department_name', selectedName, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });

                            field.onChange([selectedName]);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full min-w-[220px]">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {departmentNames?.map((department) => (
                              <SelectItem key={department.id} value={department.id}>
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="hospital_name"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Hospital/Clinic name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter hospital/clinic name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medical_license_number"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel required>Registration/Medical License number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter registration/ medical license no." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hospital_affiliation"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel>Practice Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Clinic Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter clinic address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <RCSCSelectorInput
                names={{
                  city: 'district',
                }}
                labels={{
                  city: 'District',
                }}
                optional={['country']}
              />

              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter pincode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="availability_status"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel>Availability Status</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter availability status" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="years_of_experience"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Years Of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter years of experience"
                        {...field}
                        onChange={allowDecimalOnePlace(field.onChange)}
                        maxLength={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nmc_registration_year"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Year of Registration</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter NMC registration year"
                        {...field}
                        onChange={allowOnlyDigits(field.onChange)}
                        maxLength={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state_medical_council"
                render={({ field }) => {
                  const selectedCouncil = medicalCouncils?.find(
                    (council) => council.name === field.value,
                  );

                  const activeCouncils =
                    medicalCouncils?.filter((council) => council.status === 'active') || [];

                  const isInactiveSelected = selectedCouncil && selectedCouncil.status !== 'active';

                  return (
                    <FormItem className={`${textFieldClass}`}>
                      <FormLabel required>State Medical Council</FormLabel>

                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select state medical council" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {isCouncilsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            <>
                              {/* Show current inactive value so Select can display it */}
                              {isInactiveSelected && (
                                <SelectItem
                                  value={selectedCouncil.name}
                                  disabled={selectedCouncil.status !== 'active'}
                                >
                                  {selectedCouncil.name} (Inactive)
                                </SelectItem>
                              )}

                              {/* Show only active councils */}
                              {activeCouncils.map((council) => (
                                <SelectItem key={council.id} value={council.name}>
                                  {council.name}
                                </SelectItem>
                              ))}

                              {!isInactiveSelected && activeCouncils.length === 0 && (
                                <SelectItem value="no-data" disabled>
                                  No state medical council available
                                </SelectItem>
                              )}
                            </>
                          )}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="short_professional_bio"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel required>Professional bio</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter professional bio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medical_license"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormControl>
                      <MediaUploader
                        label="Medical License"
                        value={field.value}
                        onChange={(val) => field.onChange(val[0] || '')}
                        acceptedTypes={['image', 'pdf']}
                        error={form.formState.errors.medical_license?.message as string | undefined}
                        description="Upload the doctor medical license as an image or PDF."
                        maxFiles={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormControl>
                      <MediaUploader
                        label="Profile Photo"
                        value={field.value}
                        onChange={(val) => field.onChange(val[0] || '')}
                        acceptedTypes={['image']}
                        error={form.formState.errors.avatar_url?.message as string | undefined}
                        description="Upload a profile image for the doctor."
                        maxFiles={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="location_lat"
                render={({ field }) => (
                  <FormItem className={`${textFieldClass}  md:col-span-2`}>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="Enter latitude" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_lng"
                render={({ field }) => (
                  <FormItem className={textFieldClass}>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="Enter longitude" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </CardContent>

            <CardFooter className="flex justify-start gap-2 pt-5">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  reset({
                    ...defaultValues,
                    ...initialData,
                  })
                }
                disabled={loading}
              >
                Reset
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
