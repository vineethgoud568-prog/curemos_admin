'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CheckCircle2, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { stateFormSchema, TStateFormValues } from '../zod/state.schema';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
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

interface IStateAddEditFormProps {
  title: string;
  loading: boolean;
  initialData?: Partial<TStateFormValues>;
  onSubmit: (data: TStateFormValues) => void | Promise<void>;
}

const StateAddEditForm: React.FC<IStateAddEditFormProps> = ({
  title,
  loading,
  onSubmit,
  initialData,
}) => {
  const defaultValues: Partial<TStateFormValues> = {
    name: '',
    ...initialData,
  };

  const form = useForm<TStateFormValues>({
    resolver: zodResolver(stateFormSchema),
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
            {/* Right Column: Form Details */}
            <div className="lg:col-span-8">
              <Card className="h-full border-none shadow-lg ring-1 ring-slate-200">
                <CardContent className="space-y-6 p-8">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="bg-primary h-8 w-1 rounded-full" />
                    <h3 className="text-lg font-bold text-slate-900">State Details</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">State Name</FormLabel>
                        <FormControl>
                          <div className="group relative">
                            <Building2
                              className="group-focus-within:text-primary absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 transition-colors"
                              size={18}
                            />
                            <Input
                              placeholder="Enter states..."
                              className="focus:border-primary focus:ring-primary/5 h-12 border-slate-200 pl-10 text-base transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      type="submit"
                      className="h-12 gap-2 px-8 text-base font-bold shadow-md transition-all hover:shadow-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <RotateCcw className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle2 size={20} />
                      )}
                      {loading ? 'Saving...' : 'Save State'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="h-12 gap-2 border-slate-200 px-6 font-bold text-slate-600 hover:bg-slate-50"
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

export default StateAddEditForm;
