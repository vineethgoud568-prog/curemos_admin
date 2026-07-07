'use client';

import { Icon } from '@iconify-icon/react';
import { useMemo } from 'react';

import { getConsultationReviewColumns } from '../components/ConsultationReviewColumns';

import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { TableTabFilter } from '@/@core/components/Table/tanstack-table/TableTabFilter';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { useGetConsultationReviews } from '@/api/hooks/consultationReview/hook';
import { TConsultationReviewParams } from '@/api/hooks/consultationReview/schema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import useTableFilters from '@/hooks/useTableFilter';

const RATING_TABS = [
  { label: 'All Ratings', value: '' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
];

const formatConsultationType = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function ConsultationReviewListPage() {
  const {
    payload,
    handleSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilterChange,
    search,
  } = useTableFilters({
    extraPayload: { rating: '', consultationType: '' },
  });

  const params = payload as TConsultationReviewParams;
  const { data, isLoading, error } = useGetConsultationReviews(params);

  const consultationTypeTabs = useMemo(
    () => [
      { label: 'All Types', value: '' },
      ...(data?.consultationTypes || []).map((type) => ({
        label: formatConsultationType(type),
        value: type,
      })),
    ],
    [data?.consultationTypes],
  );

  const columns = useMemo(() => getConsultationReviewColumns(), []);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <PageCardHeader title="Consultation Reviews" hideAddButton={true} />

      <Card className="overflow-hidden border-slate-200/60 shadow-sm">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <TableTabFilter
              tabs={RATING_TABS}
              value={params.rating || ''}
              onTabChange={(value) => handleFilterChange('rating', value)}
              className="w-fit max-w-full flex-wrap"
            />

            <div className="relative w-full xl:w-96">
              <Icon
                icon="mdi:search"
                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              />
              <Input
                placeholder="Search doctor name, email, or review..."
                className="h-10 w-full pl-9"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
              />
            </div>
          </div>

          {consultationTypeTabs.length > 1 ? (
            <TableTabFilter
              tabs={consultationTypeTabs}
              value={params.consultationType || ''}
              onTabChange={(value) => handleFilterChange('consultationType', value)}
              className="w-fit max-w-full flex-wrap"
            />
          ) : null}
        </div>

        <Separator />

        {error ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertTitle>Unable to load consultation reviews</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        <TanstackTable
          data={data?.data || []}
          columns={columns}
          isLoading={isLoading}
          total={data?.total || 0}
          page={params.page}
          pageSize={params.limit}
          onPageChange={handleChangePage}
          onPageSizeChange={handleChangeRowsPerPage}
          emptyMessage="No consultation reviews found"
        />
      </Card>
    </div>
  );
}
