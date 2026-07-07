'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAddFaq, useUpdateFaq } from '@/api/hooks/faq/hook';
import { TFaq } from '@/api/hooks/faq/schema';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { faqFormSchema, mapFaqFormToPayload, TFaqFormValues } from '@/module/faq/zod/faq.schema';
import { ROUTES } from '@/navigation/sidebar/routes';

interface FaqAddEditFormProps {
  initialData?: TFaq;
  isEdit?: boolean;
}

export default function FaqAddEditForm({ initialData, isEdit }: FaqAddEditFormProps) {
  const router = useRouter();
  const { mutate: addFaq, isPending: isAdding } = useAddFaq();
  const { mutate: updateFaq, isPending: isUpdating } = useUpdateFaq();

  const form = useForm<TFaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: initialData?.question || '',
      answer: initialData?.answer || '',
      type: initialData?.type || 'doctor_a',
    },
  });

  const onSubmit = (values: TFaqFormValues) => {
    const payload = mapFaqFormToPayload(values, initialData?.status);

    if (isEdit && initialData) {
      updateFaq(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            toast.success('FAQ updated successfully');
            router.push(ROUTES.faq.list);
          },
        },
      );
    } else {
      addFaq(payload, {
        onSuccess: () => {
          toast.success('FAQ added successfully');
          router.push(ROUTES.faq.list);
        },
      });
    }
  };

  const isLoading = isAdding || isUpdating;

  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select target role" />
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
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. How do I update my availability?"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the detailed answer here..."
                      className="min-h-[200px] resize-none pb-12 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-8"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="h-11 px-10" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
