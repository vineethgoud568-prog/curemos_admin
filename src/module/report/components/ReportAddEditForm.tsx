'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { reportFormSchema, TReportFormValues } from '../zod/report.schema';

import FileUpload from './FileUpload';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { useGetPatientsNames } from '@/api/hooks/patient/hooks';
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

interface IReportAddEditFormProps {
  title: string;
  loading: boolean;
  initialData?: Partial<TReportFormValues>;
  onSubmit: (data: Partial<TReportFormValues>) => void | Promise<void>;
}

const ReportAddEditForm: React.FC<IReportAddEditFormProps> = ({
  title,
  loading,
  onSubmit,
  initialData,
}) => {
  const { data: patientNames } = useGetPatientsNames();

  const defaultValues: Partial<TReportFormValues> = {
    title: '',
    type: '',
    associated_user: '',
    report: '',
    ...initialData,
  };

  const form = useForm<TReportFormValues>({
    resolver: zodResolver(reportFormSchema),
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Report Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter report title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Report Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter report type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="associated_user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Associated User</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="w-full min-w-[220px]">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patientNames && patientNames?.length > 0 ? (
                            patientNames?.map((patient) => (
                              <SelectItem key={patient} value={patient}>
                                {patient}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>
                              No patients available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="report"
                  render={() => (
                    <FormItem>
                      <FormLabel required>Upload File (Image,Pdf or Word)</FormLabel>
                      <FormControl>
                        <FileUpload form={form} name="report" />
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

export default ReportAddEditForm;
