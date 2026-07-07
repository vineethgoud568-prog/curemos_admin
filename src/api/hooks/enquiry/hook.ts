'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { enquiryKeys } from './key';
import { EnquiryQueryEnum, TEnquiry, TEnquiryStatus } from './schema';

import { TTableParams } from '@/@core/utils/supabase-query';
import { createClient } from '@/utils/supabase/client';

export const useGetEnquiries = (params: TTableParams & { status?: string; type?: string }) => {
  const supabase = createClient();

  return useQuery<{ data: TEnquiry[]; total: number }, Error>({
    queryKey: enquiryKeys.all(params),
    queryFn: async () => {
      let query = supabase
        .from('contact_forms')
        .select('*, user:profiles(id, full_name, email, phone, avatar_url, specialization, hospital_affiliation, state_medical_council)', { count: 'exact' });

      // Apply status filter
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
      }

      // Apply type filter (public vs private)
      if (params.type === 'private') {
        query = query.not('user_id', 'is', null);
      } else if (params.type === 'public') {
        query = query.is('user_id', null);
      }

      // Search functionality
      const searchValue = (params.search ?? '').trim();
      if (searchValue) {
        query = query.or(`subject.ilike.%${searchValue}%,message.ilike.%${searchValue}%`);
      }

      // Pagination
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);

      // Order by created_at descending
      const { data, count, error } = await query.order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return {
        data: (data as TEnquiry[]) || [],
        total: count || 0,
      };
    },
  });
};

export const useGetEnquiryById = (id: string) => {
  const supabase = createClient();

  return useQuery<TEnquiry, Error>({
    queryKey: enquiryKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_forms')
        .select('*, user:profiles(id, full_name, email, phone, avatar_url, specialization, hospital_affiliation, state_medical_council)')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as TEnquiry;
    },
    enabled: !!id,
  });
};

export const useUpdateEnquiryStatus = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TEnquiry, Error, { id: string; status: TEnquiryStatus }>({
    mutationFn: async ({ id, status }) => {
      const { data, error } = await supabase
        .from('contact_forms')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as TEnquiry;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryAll] });
      queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryGet, variables.id] });
      queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryPendingCount] });
    },
  });
};

interface TReplyVariables {
  id: string;
  reply: string;
  userEmail?: string | null;
  fullName?: string | null;
  subject?: string | null;
}

export const useReplyToEnquiry = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<TEnquiry, Error, TReplyVariables>({
    mutationFn: async ({ id, reply, userEmail, fullName, subject }) => {
      // 1. Save reply in database and change status to 'replied'
      const { data, error } = await supabase
        .from('contact_forms')
        .update({
          reply,
          status: 'replied' as TEnquiryStatus,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // 2. Send email notification if email address is available
      if (userEmail) {
        try {
          const emailSubject = subject ? `Re: ${subject}` : 'Reply to your Enquiry';
          const emailDescription = `
            <p style="margin: 0 0 16px 0;">Hello <strong>${fullName || 'Valued User'}</strong>,</p>
            
            <p style="margin: 0 0 24px 0; line-height: 1.6;">
              Thank you for contacting <strong>Curemos</strong>. Our support team has reviewed your enquiry regarding 
              <em style="color: #0f172a; font-weight: 500;">"${subject || 'No Subject'}"</em> and generated a response.
            </p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; border-radius: 8px; padding: 24px; margin: 24px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #dc2626; margin-bottom: 12px; letter-spacing: 0.05em;">Administrative Response</div>
              <div style="font-size: 15px; color: #334155; line-height: 1.6; white-space: pre-wrap; font-family: inherit;">${reply}</div>
            </div>
            
            <p style="margin: 24px 0 0 0; line-height: 1.6;">
              If you have any further questions or require additional details, please don't hesitate to reach back out to us.
            </p>
            
            <p style="margin: 20px 0 0 0; line-height: 1.6;">
              Warm regards,<br>
              <strong style="color: #0f172a;">Curemos Team</strong>
            </p>
          `;

          await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userEmail,
              template: {
                title: emailSubject,
                description: emailDescription,
              },
            }),
          });
        } catch (emailError) {
          // Log email failure but don't fail the mutation
          console.error('Email sending failed for enquiry reply:', emailError);
        }
      }

      return data as TEnquiry;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryAll] });
      queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryGet, variables.id] });
      queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryPendingCount] });
    },
  });
};

export const useDeleteEnquiry = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('contact_forms')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryAll] });
      queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryPendingCount] });
    },
  });
};

export const usePendingEnquiriesCount = () => {
  const supabase = createClient();

  return useQuery<number, Error>({
    queryKey: [EnquiryQueryEnum.EnquiryPendingCount],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contact_forms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw new Error(error.message);
      return count || 0;
    },
    refetchInterval: 30000,
  });
};

export const useEnquiryRealtime = (id?: string) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(id ? `enquiry-detail-${id}-${channelId}` : `enquiry-changes-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_forms',
          ...(id && { filter: `id=eq.${id}` }),
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryPendingCount] });
          queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryAll] });
          if (id) {
            queryClient.invalidateQueries({ queryKey: [EnquiryQueryEnum.EnquiryGet, id] });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, id]);
};
