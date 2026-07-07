'use client';

import { Icon } from '@iconify-icon/react';
import { Activity, User } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { useGetReportById } from '@/api/hooks/report/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ReportViewPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: report, isLoading, error } = useGetReportById(id);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Activity className="text-primary animate-pulse" size={48} />
          <p className="text-muted-foreground animate-pulse">Fetching report records...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-destructive flex flex-col items-center gap-2">
          <p className="text-lg font-semibold">Error Loading report</p>
          <p className="text-sm">{error?.message || 'report not found'}</p>
        </div>
      </div>
    );
  }

  const fileUrl = typeof report.report === 'string' ? report.report : undefined;

  const isImage = fileUrl?.match(/\.(jpeg|jpg|png|webp)$/i);
  const isPdf = fileUrl?.match(/\.pdf$/i);
  const isDoc = fileUrl?.match(/\.(doc|docx)$/i);

  return (
    <div className="w-full space-y-6 p-4">
      <PageCardHeader title="Report Details" backButton hideAddButton />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
            <User size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">{report.title}</h1>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {report.type}
              </Badge>

              {report.status && <Badge variant="outline">{report.status.toUpperCase()}</Badge>}

              {report.is_archived && <Badge variant="destructive">Archived</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* File Section */}
      <Card>
        <CardContent className="p-6">
          {report.associated_user && (
            <h4 className="text-md mb-4 font-semibold">
              Associated User:
              <span className="text-sm text-gray-500"> {report.associated_user}</span>
            </h4>
          )}
          <h4 className="text-md mb-4 font-semibold">Attached File</h4>

          {!fileUrl ? (
            <p className="text-sm text-gray-500">No file uploaded</p>
          ) : (
            <div className="flex flex-col items-start gap-4">
              {/* Preview */}
              {isImage && (
                <div className="relative h-48 w-72 overflow-hidden rounded-lg border">
                  <Image src={fileUrl} alt="Report file" fill className="object-cover" />
                </div>
              )}

              {isPdf && (
                <div className="flex items-center gap-3 text-red-500">
                  <Icon icon="mdi:file-pdf-box" className="text-4xl" />
                  <span className="text-sm">PDF Document</span>
                </div>
              )}

              {isDoc && (
                <div className="flex items-center gap-3 text-blue-500">
                  <Icon icon="mdi:file-word-box" className="text-4xl" />
                  <span className="text-sm">Word Document</span>
                </div>
              )}

              {!isImage && !isPdf && !isDoc && (
                <div className="flex items-center gap-3 text-gray-500">
                  <Icon icon="mdi:file" className="text-4xl" />
                  <span className="text-sm">File</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="default">
                    <Icon icon="lucide:eye" className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </a>

                {/* <a href={fileUrl} download>
                  <Button variant="outline">
                    <Icon icon="lucide:download" className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </a> */}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
