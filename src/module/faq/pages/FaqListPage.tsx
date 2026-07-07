'use client';

import { Icon } from '@iconify-icon/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getFaqColumns } from '../components/FaqColumns';

import ConfirmDialog from '@/@core/components/dialogs/ConfirmDialog';
import StatusConfirmDialog from '@/@core/components/dialogs/StatusConfirmDialog';
import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { TableTabFilter } from '@/@core/components/Table/tanstack-table/TableTabFilter';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { useDeleteFaq, useGetFaqs, useUpdateFaq } from '@/api/hooks/faq/hook';
import { TFaq } from '@/api/hooks/faq/schema';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/hooks/usePermissions';
import useTableFilters from '@/hooks/useTableFilter';
import { ROUTES } from '@/navigation/sidebar/routes';

const FAQ_TYPE_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Doctors', value: 'doctor_a' },
  { label: 'Curemos Doctors', value: 'doctor_b' },
];

export default function FaqListPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const {
    payload,
    handleSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilterChange,
    search,
  } = useTableFilters({ extraPayload: { type: '' } });

  const { data, isLoading } = useGetFaqs(payload);
  const { mutate: deleteFaq } = useDeleteFaq();
  const { mutate: updateFaq, isPending: isUpdating } = useUpdateFaq();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFaq, setStatusFaq] = useState<TFaq | null>(null);

  const activeRole = ((payload as Record<string, unknown>).type as string) || 'all';
  const canAdd = hasPermission('faq', 'add');
  const canEdit = hasPermission('faq', 'edit');
  const canDelete = hasPermission('faq', 'delete');
  const canView = hasPermission('faq', 'view');

  const columns = useMemo(
    () =>
      getFaqColumns({
        onEdit: (faq) => router.push(ROUTES.faq.edit(faq.id)),
        onDelete: (id) => setDeleteId(id),
        onStatusChange: (faq) => setStatusFaq(faq),
        actionPermissions: { canEdit, canDelete, canView },
      }),
    [canDelete, canEdit, canView, router],
  );

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteFaq(deleteId, {
      onSuccess: () => {
        toast.success('FAQ deleted successfully');
        setDeleteId(null);
      },
    });
  };

  const confirmStatusChange = () => {
    if (!statusFaq) return;
    const newStatus: TFaq['status'] = statusFaq.status === 'active' ? 'inactive' : 'active';
    updateFaq(
      { id: statusFaq.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`FAQ marked as ${newStatus}`);
          setStatusFaq(null);
        },
      },
    );
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <PageCardHeader
        title="FAQ Management"
        addButtonLabel="Add FAQ"
        addButtonUrl={ROUTES.faq.add}
        hideAddButton={!canAdd}
      />

      <Card className="overflow-hidden border-slate-200/60 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center">
          <TableTabFilter
            tabs={FAQ_TYPE_TABS}
            value={activeRole}
            onTabChange={(val) => handleFilterChange('type', val === 'all' ? '' : val)}
          />
          <div className="relative w-full md:w-64">
            <Icon
              icon="mdi:search"
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <Input
              placeholder="Search questions or answers..."
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
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
      />

      <StatusConfirmDialog
        open={!!statusFaq}
        onOpenChange={(open) => !open && setStatusFaq(null)}
        onConfirm={confirmStatusChange}
        loading={isUpdating}
      />
    </div>
  );
}
