'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { contactFormSchema, TContactFormValues } from '../zod/contact.schema';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
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
import { Textarea } from '@/components/ui/textarea';

interface IContactEditFormProps {
  title: string;
  loading: boolean;
  initialData?: Partial<TContactFormValues>;
  onSubmit: (data: TContactFormValues) => void | Promise<void>;
}

const ContactEditForm: React.FC<IContactEditFormProps> = ({
  title,
  loading,
  onSubmit,
  initialData,
}) => {
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [homePreview, setHomePreview] = useState<string | null>(null);

  const defaultValues: Partial<TContactFormValues> = {
    email: '',
    phone: '',
    address: '',
    ...initialData,
  };

  const form = useForm<TContactFormValues>({
    resolver: zodResolver(contactFormSchema),
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter address" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default ContactEditForm;
