'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Column,
  type ColumnDef,
  type Row,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TableFooter } from './TableFooter';

import { cn } from '@/lib/utils';

const DEFAULT_LEFT_PINNED_COLUMN_IDS = [
  'full_name',
  'name',
  'patient_name',
  'department_name',
  'title',
];

export type TDataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onPageSizeChange: (value: string) => void;
  isLoading: boolean;
  getRowId?: (row: T) => string;
  enableRowDrag?: boolean;
  onRowReorder?: (oldIndex: number, newIndex: number) => void;
  emptyMessage?: string;
};

type TTableBodyRowProps<T> = {
  row: Row<T>;
  getPinnedSide: (column: Column<T, unknown>) => false | 'left' | 'right';
  scrollState: {
    canScrollLeft: boolean;
    canScrollRight: boolean;
  };
  enableRowDrag: boolean;
};

function TableBodyRow<T>({
  row,
  getPinnedSide,
  scrollState,
  enableRowDrag,
}: TTableBodyRowProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled: !enableRowDrag,
  });

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50',
        isDragging && 'relative z-30 bg-white opacity-90 shadow-lg',
      )}
    >
      {row.getVisibleCells().map((cell, idx) => {
        const columnSize = cell.column.columnDef.size;
        const pinnedSide = getPinnedSide(cell.column);
        const isFirst = idx === 0;
        const isDragColumn = cell.column.id === 'drag';

        return (
          <td
            key={cell.id}
            {...(isDragColumn ? { ...attributes, ...listeners } : {})}
            className={cn(
              'px-6 py-3.5 text-sm text-slate-700',
              isDragColumn && enableRowDrag && 'cursor-grab active:cursor-grabbing',
              // Pipe separators between cells
              !isFirst && 'border-l border-slate-100',
              pinnedSide === 'left' && [
                'sticky left-0 z-10 bg-white',
                'group-hover:bg-slate-50',
                scrollState.canScrollLeft && 'shadow-[1px_0_0_0_#f1f5f9]',
              ],
              pinnedSide === 'right' && [
                'sticky right-0 z-10',
                'bg-white text-center',
                'group-hover:bg-slate-50',
                scrollState.canScrollRight && 'shadow-[-1px_0_0_0_#f1f5f9]',
              ],
            )}
            style={
              columnSize ? { minWidth: `${columnSize}px`, width: `${columnSize}px` } : undefined
            }
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}

export function TanstackTable<T>({
  data = [],
  columns,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  isLoading,
  getRowId,
  enableRowDrag = false,
  onRowReorder,
  emptyMessage = 'No results found',
}: TDataTableProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    hasHorizontalOverflow: false,
  });

  const pageCount = Math.ceil(total / pageSize);

  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    getSortedRowModel: getSortedRowModel(),
    pageCount,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
  });

  const handlePageChange = (newPage: number) => {
    onPageChange({ target: { value: newPage } }, newPage);
  };

  const visibleLeafColumns = table.getVisibleLeafColumns();

  const defaultLeftPinnedColumnId = useMemo(() => {
    return visibleLeafColumns.find((column) => DEFAULT_LEFT_PINNED_COLUMN_IDS.includes(column.id))
      ?.id;
  }, [visibleLeafColumns]);

  const getPinnedSide = useCallback(
    (column: Column<T, unknown>) => {
      return (
        column.getIsPinned() ||
        (column.id === defaultLeftPinnedColumnId ? 'left' : false) ||
        (column.id === 'actions' ? 'right' : false)
      );
    },
    [defaultLeftPinnedColumnId],
  );

  const stickyWidths = useMemo(() => {
    return visibleLeafColumns.reduce(
      (acc, column) => {
        const pinnedSide = getPinnedSide(column);
        const columnWidth = column.getSize();

        if (pinnedSide === 'left') {
          acc.left += columnWidth;
        }

        if (pinnedSide === 'right') {
          acc.right += columnWidth;
        }

        return acc;
      },
      { left: 0, right: 0 },
    );
  }, [getPinnedSide, visibleLeafColumns]);

  const horizontalScrollStops = useMemo(() => {
    let cumulativeWidth = 0;

    return visibleLeafColumns.reduce<number[]>((stops, column) => {
      const pinnedSide = getPinnedSide(column);
      const start = cumulativeWidth;

      cumulativeWidth += column.getSize();

      if (!pinnedSide) {
        stops.push(start);
      }

      return stops;
    }, []);
  }, [getPinnedSide, visibleLeafColumns]);

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const maxScrollLeft = Math.max(container.scrollWidth - container.clientWidth, 0);
    const currentScrollLeft = container.scrollLeft;
    const threshold = 8;

    setScrollState({
      canScrollLeft: currentScrollLeft > threshold,
      canScrollRight: currentScrollLeft < maxScrollLeft - threshold,
      hasHorizontalOverflow: maxScrollLeft > threshold,
    });
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    updateScrollState();

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(container);

    const tableElement = container.querySelector('table');
    if (tableElement) {
      resizeObserver.observe(tableElement);
    }

    container.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [columns, data.length, isLoading, updateScrollState]);

  const scrollTable = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const threshold = 8;
    const maxScrollLeft = Math.max(container.scrollWidth - container.clientWidth, 0);
    const currentScrollLeft = container.scrollLeft;

    const nextStop =
      direction === 'right'
        ? (horizontalScrollStops.find((stop) => stop > currentScrollLeft + threshold) ??
          maxScrollLeft)
        : ([...horizontalScrollStops]
          .reverse()
          .find((stop) => stop < currentScrollLeft - threshold) ?? 0);

    container.scrollTo({
      left: Math.max(0, Math.min(nextStop, maxScrollLeft)),
      behavior: 'smooth',
    });
  };

  const rows = table.getRowModel().rows;
  const rowIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = rowIds.indexOf(String(active.id));
    const newIndex = rowIds.indexOf(String(over.id));

    if (oldIndex === -1 || newIndex === -1) return;

    onRowReorder?.(oldIndex, newIndex);
  };

  const renderRows = () =>
    rows.map((row) => (
      <TableBodyRow
        key={row.id}
        row={row}
        getPinnedSide={getPinnedSide}
        scrollState={scrollState}
        enableRowDrag={enableRowDrag}
      />
    ));

  const tableContent = (
    <table className="w-full border-collapse text-sm">
      {/* ── Header ── */}
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-slate-200">
            {headerGroup.headers.map((header, idx) => {
              const columnSize = header.column.columnDef.size;
              const pinnedSide = getPinnedSide(header.column);
              const isFirst = idx === 0;

              return (
                <th
                  key={header.id}
                  className={cn(
                    'h-11 bg-white px-6 text-left text-[11px] font-semibold tracking-widest text-slate-400 uppercase',
                    // Pipe separators between columns
                    !isFirst && 'border-l border-slate-200',
                    pinnedSide === 'left' && [
                      'sticky left-0 z-20 bg-white',
                      scrollState.canScrollLeft && 'shadow-[1px_0_0_0_#e2e8f0]',
                    ],
                    pinnedSide === 'right' && [
                      'sticky right-0 z-20 bg-white text-center',
                      scrollState.canScrollRight && 'shadow-[-1px_0_0_0_#e2e8f0]',
                    ],
                  )}
                  style={
                    columnSize
                      ? { minWidth: `${columnSize}px`, width: `${columnSize}px` }
                      : undefined
                  }
                >
                  {!header.isPlaceholder &&
                    flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>

      {/* ── Body ── */}
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={columns.length} className="h-48 text-center">
              <div className="flex flex-col items-center gap-3 text-sm font-medium text-slate-400">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
                Loading data...
              </div>
            </td>
          </tr>
        ) : rows.length > 0 ? (
          renderRows()
        ) : (
          <tr>
            <td colSpan={columns.length} className="h-40 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl opacity-20">📭</span>
                <span className="text-sm font-medium text-slate-400">{emptyMessage}</span>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="relative min-h-0 w-full">
        {scrollState.hasHorizontalOverflow && (
          <>
            <button
              type="button"
              aria-label="Scroll table left"
              onClick={() => scrollTable('left')}
              disabled={!scrollState.canScrollLeft}
              style={{
                left: stickyWidths.left > 0 ? `${Math.max(stickyWidths.left - 18, 12)}px` : '12px',
              }}
              className={cn(
                'absolute top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm backdrop-blur-sm transition',
                scrollState.canScrollLeft
                  ? 'pointer-events-auto opacity-100 hover:border-slate-300 hover:text-slate-900'
                  : 'pointer-events-none opacity-0',
              )}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              aria-label="Scroll table right"
              onClick={() => scrollTable('right')}
              disabled={!scrollState.canScrollRight}
              style={{
                right:
                  stickyWidths.right > 0 ? `${Math.max(stickyWidths.right - 18, 12)}px` : '12px',
              }}
              className={cn(
                'absolute top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-sm backdrop-blur-sm transition',
                scrollState.canScrollRight
                  ? 'pointer-events-auto opacity-100 hover:border-slate-300 hover:text-slate-900'
                  : 'pointer-events-none opacity-0',
              )}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/*
          Overflow-x-auto here is the key — this is the scrollable viewport.
          Sticky columns are positioned relative to THIS container.
        */}
        <div ref={scrollContainerRef} className="min-h-0 w-full overflow-x-auto">
          {enableRowDrag ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              autoScroll={false}
            >
              <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                {tableContent}
              </SortableContext>
            </DndContext>
          ) : (
            tableContent
          )}
        </div>
      </div>

      {/* ── Pagination Footer ── */}
      <div className="border-t border-slate-100 bg-white">
        <TableFooter
          page={page}
          pageSize={pageSize}
          pageCount={pageCount}
          total={total}
          dataLength={data.length}
          onPageSizeChange={onPageSizeChange}
          handlePageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
