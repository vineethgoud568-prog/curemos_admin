'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { departmentFormSchema, TDepartmentFormValues } from '../zod/department.schema';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import ImageUpload from '@/components/shared/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface IDepartmentAddEditFormProps {
  title: string;
  loading: boolean;
  initialData?: Partial<TDepartmentFormValues>;
  onSubmit: (data: TDepartmentFormValues) => void | Promise<void>;
}

const DepartmentAddEditForm: React.FC<IDepartmentAddEditFormProps> = ({
  title,
  loading,
  onSubmit,
  initialData,
}) => {
  const defaultValues: Partial<TDepartmentFormValues> = {
    name: '',
    image: '',
    ...initialData,
  };

  const form = useForm<TDepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues,
  });

  const { reset } = form;

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
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
      <PageCardHeader title={title} backButton hideAddButton />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Identity Preview */}
            <div className="lg:col-span-4">
              <Card className="overflow-hidden border-none shadow-lg ring-1 ring-slate-200">
                <div className="bg-primary/5 border-b border-slate-100 p-8 text-center">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field, fieldState }) => (
                      <ImageUpload
                        acceptedTypes={['image/png']}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        placeholderIcon={<Building2 size={48} className="text-primary/20" />}
                        className="flex flex-col items-center"
                      />
                    )}
                  />
                  <h3 className="text-primary mt-6 text-xl font-bold capitalize">
                    {form.watch('name') || 'New Department'}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                    Department Identity
                  </p>
                </div>
                <CardContent className="p-6 bg-slate-50/50">
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Maximum file size: 5MB
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Formats: JPG, JPEG, PNG, WEBP
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Form Details */}
            <div className="lg:col-span-8">
              <Card className="h-full border-none shadow-lg ring-1 ring-slate-200">
                <CardContent className="space-y-6 p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-1 bg-primary rounded-full" />
                    <h3 className="text-lg font-bold text-slate-900">Department Details</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-bold">Department Name</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Building2
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                              size={18}
                            />
                            <Input
                              placeholder="e.g. Cardiology, Radiology..."
                              className="pl-10 h-12 border-slate-200 focus:border-primary focus:ring-primary/5 transition-all text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <p className="text-[11px] text-slate-500 mt-1">
                          This name will be displayed across the hospital portal and patient records.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      className="h-12 px-8 gap-2 text-base font-bold shadow-md hover:shadow-xl transition-all"
                      disabled={loading}
                    >
                      {loading ? (
                        <RotateCcw className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle2 size={20} />
                      )}
                      {loading ? 'Saving...' : 'Save Department'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="h-12 px-6 gap-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                      disabled={loading}
                    >
                      <RotateCcw size={18} />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DepartmentAddEditForm;
