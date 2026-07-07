'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Dispatch, type SetStateAction, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { patientFormSchema, TPatientFormValues } from '../zod/patient.schema';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { allowOnlyDigits } from '@/@core/utils/form';
import { useGetDoctors } from '@/api/hooks/doctor/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const DOCTOR_OPTIONS_PARAMS = {
  page: 1,
  limit: 1000,
  search: '',
  sortField: '',
  sortOrder: 'desc',
  status: '',
} as const;

interface IPatientAddEditFormProps {
  title: string;
  loading: boolean;
  initialData?: Partial<TPatientFormValues>;
  onSubmit: (data: Partial<TPatientFormValues>) => void | Promise<void>;
  setSelectedDoctor?: Dispatch<SetStateAction<{ full_name: string; email: string }>>;
}

const PatientAddEditForm: React.FC<IPatientAddEditFormProps> = ({
  title,
  loading,
  onSubmit,
  initialData,
  setSelectedDoctor,
}) => {
  const { data: doctorsData, isLoading: isDoctorsLoading } = useGetDoctors(DOCTOR_OPTIONS_PARAMS);
  const doctorOptions = doctorsData?.data || [];
  const selectableDoctorOptions = doctorOptions.filter((doctor) => doctor.isVerified);

  const isEdit = initialData?.email;

  const defaultValues: Partial<TPatientFormValues> = {
    full_name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    medical_history: '',
    doctor_a_id: '',
    ...initialData,
  };

  const form = useForm<TPatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  });

  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset({ ...defaultValues, ...initialData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, reset]);

  const handleReset = () => {
    reset(defaultValues);
    setSelectedDoctor?.({ full_name: '', email: '' });
  };

  const handleDoctorChange = (doctorId: string, onChange: (value: string) => void) => {
    const selectedDoctor = selectableDoctorOptions.find((doctor) => doctor.id === doctorId);

    onChange(doctorId);
    setSelectedDoctor?.({
      full_name: selectedDoctor?.full_name || '',
      email: selectedDoctor?.email || '',
    });
  };

  return (
    <div className="w-full space-y-4 p-4">
      <PageCardHeader title={title} backButton hideAddButton />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="w-full min-w-[220px]">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Age</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={150} placeholder="Enter age" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctor_a_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Linked Doctor</FormLabel>
                      <Select
                        onValueChange={(value) => handleDoctorChange(value, field.onChange)}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full min-w-[220px]">
                            <SelectValue
                              placeholder={
                                isDoctorsLoading ? 'Loading doctors...' : 'Select linked doctor'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectableDoctorOptions.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.full_name || doctor.email || 'Unnamed Doctor'}
                              {doctor?.department && doctor.department.name
                                ? ` - ${doctor.department.name}`
                                : ' - No Department'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                          value={field.value || ''}
                          disabled={!!isEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                <FormField
                  control={form.control}
                  name="medical_history"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical History</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter medical history"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-start gap-2 pt-5">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default PatientAddEditForm;
