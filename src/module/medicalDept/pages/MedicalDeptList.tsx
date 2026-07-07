'use client';

import { CellContext } from '@tanstack/react-table';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import ConfirmDialog from '@/@core/components/dialogs/ConfirmDialog';
import { PageCardHeader } from '@/@core/components/Table/tanstack-table/CardHeader';
import { TableActions } from '@/@core/components/Table/tanstack-table/TableActions';
import { TableHeader } from '@/@core/components/Table/tanstack-table/TableHeader';
import { TanstackTable } from '@/@core/components/Table/tanstack-table/TanstackTable';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useTableFilters from '@/hooks/useTableFilter';
import { ROUTES } from '@/navigation/sidebar/routes';

// ❌ Removed API imports

type TDialogType = 'status' | 'delete';

type MockData = {
  _id: string;
  name: string;
  icon: string;
  status: string;
  createdAt: string;
};

export default function MedicalDeptList() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<TDialogType>('status');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  const [tableData, setTableData] = useState<MockData[]>([
    {
      _id: '1',
      name: 'Cardiology',
      icon: '/images/Cardiology.jpeg',
      status: 'Active',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      name: 'Neurology',
      icon: '/images/Neurology.jpeg',
      status: 'Inactive',
      createdAt: new Date().toISOString(),
    },
  ]);

  const {
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearch,
    handleFilterChange,
    payload,
    search,
    status,
  } = useTableFilters({ extraPayload: {} });

  const total = tableData.length;
  const isLoading = false;

  const handleStatusToggle = (id: string, status: string) => {
    setSelectedId(id);
    setCurrentStatus(status);
    setDialogType('status');
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDialogType('delete');
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedId) return;

    if (dialogType === 'status') {
      setTableData((prev) =>
        prev.map((item) =>
          item._id === selectedId
            ? {
              ...item,
              status: item.status === 'Active' ? 'Inactive' : 'Active',
            }
            : item,
        ),
      );
      toast.success('Status updated (static)');
    }

    if (dialogType === 'delete') {
      setTableData((prev) => prev.filter((item) => item._id !== selectedId));
      toast.success('Deleted successfully (static)');
    }

    setDialogOpen(false);
  };

  const columns = [
    {
      header: 'Brand',
      accessorKey: 'name',
      cell: ({ row }: CellContext<MockData, unknown>) => (
        <span className="text-sm font-medium">{row.original.name}</span>
      ),
    },
    {
      header: 'Brand Icon',
      accessorKey: 'icon',
      cell: ({ row }: CellContext<MockData, unknown>) => (
        <Image
          width={40}
          height={40}
          src={row.original.icon || '/Image/No_Image_Found.jpg'}
          alt={row.original.name}
          className="h-10 w-10 rounded-full border object-cover"
        />
      ),
    },
    {
      header: 'Created at',
      accessorKey: 'createdAt',
      cell: ({ row }: CellContext<MockData, unknown>) => (
        <span className="text-sm font-medium">
          {dayjs(row.original.createdAt).format('DD MMM, YYYY')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: CellContext<MockData, unknown>) => (
        <Badge
          variant="outline"
          className="cursor-pointer capitalize"
          onClick={() => handleStatusToggle(row.original._id, row.original.status)}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      size: 120,
      cell: ({ row }: CellContext<MockData, unknown>) => {
        const id = row.original._id;

        return (
          <TableActions
            onEdit={() => router.push(ROUTES.medicalDept.edit(id))}
            onDelete={() => handleDeleteClick(id)}
            onView={() => router.push(ROUTES.medicalDept.details(id))}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <PageCardHeader
        title="Support List"
        addButtonLabel="Add Support"
        addButtonUrl={ROUTES.medicalDept.add}
        button
      />

      <Card>
        <TableHeader
          searchValue={search}
          onSearchChange={handleSearch}
          status={status}
          onStatusChange={(val) => handleFilterChange('status', val)}
        />
        <Separator />

        <TanstackTable<MockData>
          data={tableData}
          columns={columns}
          page={payload.page}
          pageSize={payload.limit}
          total={total}
          onPageChange={handleChangePage}
          onPageSizeChange={handleChangeRowsPerPage}
          isLoading={isLoading}
        />
      </Card>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogType === 'delete' ? 'Delete Support' : 'Change Status'}
        description="Are you sure?"
        confirmText="Confirm"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
