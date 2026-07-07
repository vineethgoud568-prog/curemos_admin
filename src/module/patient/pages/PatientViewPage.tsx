'use client';

import dayjs from 'dayjs';
import {
  ArrowLeft,
  Calendar,
  Contact,
  Copy,
  Edit,
  Heart,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useGetPatientById } from '@/api/hooks/patient/hooks';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function PatientViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: patient, isLoading, error } = useGetPatientById(id);
  const age = patient?.age;

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return <PatientViewSkeleton />;
  }

  if (error || !patient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-destructive flex flex-col items-center gap-4">
          <div className="bg-destructive/10 rounded-full p-4">
            <Stethoscope size={48} />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">Error Loading Patient Records</p>
            <p className="text-muted-foreground">{error?.message || 'Patient not found'}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="border-primary/20 bg-primary/5 h-16 w-16 border-2">
              <AvatarFallback className="text-primary text-xl font-bold">
                {patient.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                  {patient.full_name}
                </h1>
                <Badge
                  variant={patient.gender === 'male' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {patient.gender || 'N/A'}
                </Badge>
              </div>
              <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {age ? `${age} years old` : 'Age N/A'}
                </span>
                <span className="bg-muted-foreground/40 h-1 w-1 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <Heart size={14} className="text-destructive" />
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold">
                    {patient.blood_type || 'N/A'}
                  </Badge>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 shadow-sm" asChild>
            <Link href={`/dashboard/patient/edit/${id}`}>
              <Edit size={16} /> Edit Patient
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area - Clinical Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Medical Alerts / Allergies */}
          <Card className="border-l-destructive overflow-hidden border-l-4 bg-white shadow-md dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-destructive flex items-center gap-2 text-base font-bold tracking-tight uppercase">
                <Heart size={18} fill="currentColor" /> Medical Alerts & Allergies
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="bg-destructive/5 border-destructive/10 rounded-lg border p-4">
                <p className="text-destructive/60 mb-1 text-[10px] font-black tracking-widest uppercase">
                  ALLERGIES
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {patient.allergies || 'No known allergies reported.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Medical Record Details */}
          <Card className="bg-white shadow-md dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 border-b pb-2 text-xl font-bold">
                <Stethoscope className="text-primary" size={22} /> Clinical Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-2">
              <div>
                <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                  <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                  Case Notes
                </h3>
                <div className="bg-muted/30 rounded-lg border p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {patient.medical_history || 'No documented medical history.'}
                </div>
              </div>

              <div>
                <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                  <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                  Current Medications
                </h3>
                <div className="bg-muted/30 text-primary/80 rounded-lg border p-4 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                  {patient.current_medications || 'Not currently on any medications.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area - Demographics & GP */}
        <div className="space-y-6">
          {/* Contact Details */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Contact className="text-primary" size={20} /> Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-md p-2">
                  <Phone size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-muted-foreground text-xs">Phone Number</p>
                  <div className="group flex items-center justify-between">
                    <p className="truncate text-sm font-semibold">{patient.phone || 'N/A'}</p>
                    {patient.phone && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => copyToClipboard(patient.phone, 'Phone')}
                      >
                        <Copy size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-md p-2">
                  <Mail size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-muted-foreground text-xs">Email Address</p>
                  <div className="group flex items-center justify-between">
                    <p className="truncate text-sm font-semibold">{patient.email || 'N/A'}</p>
                    {patient.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => copyToClipboard(patient.email || '', 'Email')}
                      >
                        <Copy size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary rounded-md p-2">
                  <MapPin size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs">Residential Address</p>
                  <p className="text-sm leading-snug font-semibold">
                    {patient.address || 'No address provided'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="pt-2">
                <p className="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">
                  LINKED GP
                </p>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm dark:border-slate-800">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {patient.doctor_a?.full_name?.charAt(0) || 'GP'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                      {patient.doctor_a?.full_name || 'Unassigned'}
                    </p>
                    <p className="text-muted-foreground truncate text-[10px]">
                      {patient.doctor_a?.email || 'No contact info'}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/10 hover:text-primary h-8 w-8 rounded-full transition-colors"
                          asChild
                        >
                          <Link href={`/dashboard/patient/edit/${id}`}>
                            <Edit size={14} />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Change Doctor</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="shadow-sm">
            <CardContent className="space-y-4 p-6 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span className="font-medium">{patient.age ? `${patient.age} yrs` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Record Created:</span>
                <span className="font-medium">
                  {dayjs(patient.created_at).format('MMM DD, YYYY')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {dayjs(patient.updated_at).format('MMM DD, YYYY')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PatientViewSkeleton() {
  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
