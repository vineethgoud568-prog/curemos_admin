'use client';

import { Icon } from '@iconify-icon/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getEnquiryColumns } from '../components/EnquiryColumns';

import ConfirmDialog from '@/@core/components/dialogs/ConfirmDialog';
import DeleteConfirmDialog from '@/@core/components/dialogs/DeleteConfirmDialog';
import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { TableTabFilter } from '@/@core/components/Table/tanstack-table/TableTabFilter';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { TTableParams } from '@/@core/utils/supabase-query';
import { useGetEnquiries, useUpdateEnquiryStatus, useDeleteEnquiry } from '@/api/hooks/enquiry/hook';
import { TEnquiry } from '@/api/hooks/enquiry/schema';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';
import { ROUTES } from '@/navigation/sidebar/routes';

const ENQUIRY_STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Seen', value: 'seen' },
  { label: 'Replied', value: 'replied' },
];

const ENQUIRY_TYPE_TABS = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
];

export default function EnquiryListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const {
    payload,
    setPayload,
    handleSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilterChange,
    search,
  } = useTableFilters({ extraPayload: { status: 'all', type: 'public' } });

  const { data, isLoading } = useGetEnquiries(payload as TTableParams & { status?: string; type?: string });
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateEnquiryStatus();
  const { mutate: deleteEnquiry, isPending: isDeleting } = useDeleteEnquiry();

  const [selectedEnquiry, setSelectedEnquiry] = useState<{ enquiry: TEnquiry; targetStatus: 'pending' | 'seen' } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeStatus = ((payload as Record<string, unknown>).status as string) || 'all';

  const canView = hasPermission('enquiry', 'view');
  const canEdit = hasPermission('enquiry', 'edit');
  const canDelete = hasPermission('enquiry', 'delete');

  const columns = useMemo(
    () =>
      getEnquiryColumns({
        onView: (id) => router.push(ROUTES.enquiry.view(id)),
        onDelete: (id) => {
          if (canDelete) {
            setDeleteId(id);
          } else {
            toast.error('You do not have permission to delete enquiries.');
          }
        },
        onStatusChange: (enquiry, targetStatus) => {
          if (canEdit) {
            setSelectedEnquiry({ enquiry, targetStatus });
          } else {
            toast.error('You do not have permission to modify enquiries.');
          }
        },
        actionPermissions: { canView, canEdit, canDelete },
      }),
    [canView, canEdit, canDelete, router],
  );

  const confirmStatusChange = () => {
    if (!selectedEnquiry) return;
    const { enquiry, targetStatus } = selectedEnquiry;
    updateStatus(
      { id: enquiry.id, status: targetStatus },
      {
        onSuccess: () => {
          toast.success(`Enquiry marked as ${targetStatus === 'seen' ? 'Seen' : 'Pending'}`);
          setSelectedEnquiry(null);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to update enquiry status');
        },
      },
    );
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <PageCardHeader title="User Enquiries" hideAddButton={true} />

      <Card className="overflow-hidden border-slate-200/60 shadow-sm">
        {/* Type Tabs (Public vs Private) */}
        <div className="border-b border-slate-100 px-4 pt-3">
          <TableTabFilter
            tabs={ENQUIRY_TYPE_TABS}
            value={((payload as Record<string, unknown>).type as string) || 'public'}
            onTabChange={(val) => setPayload((prev) => ({ ...prev, type: val, status: 'all', page: 1 }))}
            className="w-fit"
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center">
          <TableTabFilter
            tabs={ENQUIRY_STATUS_TABS}
            value={activeStatus}
            onTabChange={(val) => handleFilterChange('status', val)}
          />
          <div className="relative w-full md:w-64">
            <Icon
              icon="mdi:search"
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <Input
              placeholder="Search subject or message..."
              className="h-10 w-full pl-9"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        <TanstackTable
          data={data?.data || []}
          columns={columns}
          isLoading={isLoading}
          total={data?.total || 0}
          page={payload.page}
          pageSize={payload.limit}
          onPageChange={handleChangePage}
          onPageSizeChange={handleChangeRowsPerPage}
        />
      </Card>

      <ConfirmDialog
        open={!!selectedEnquiry}
        onOpenChange={(open) => !open && setSelectedEnquiry(null)}
        title={selectedEnquiry?.targetStatus === 'seen' ? 'Mark Enquiry as Seen' : 'Mark Enquiry as Pending'}
        description={selectedEnquiry?.targetStatus === 'seen' 
          ? 'Are you sure you want to mark this enquiry as Seen?' 
          : 'Are you sure you want to mark this enquiry as Pending?'}
        confirmText={selectedEnquiry?.targetStatus === 'seen' ? 'Mark as Seen' : 'Mark as Pending'}
        onConfirm={confirmStatusChange}
        loading={isUpdating}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        moduleName="enquiry"
        loading={isDeleting}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteEnquiry(deleteId, {
              onSuccess: () => {
                toast.success('Enquiry successfully deleted');
                setDeleteId(null);
              },
              onError: (err) => {
                toast.error(err.message || 'Failed to delete enquiry');
              },
            });
          }
        }}
      />
    </div>
  );
}
