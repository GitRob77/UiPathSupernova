"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@uipath/apollo-wind/components/ui/table";
import { Checkbox } from "@uipath/apollo-wind/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@uipath/apollo-wind/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind/components/ui/select";
import { cn } from "@uipath/apollo-wind";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  FilterBar,
  type FilterBarProps,
} from "@/components/custom/filter-bar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DataGridProps<TData, TValue> {
  /** TanStack column definitions. */
  columns: ColumnDef<TData, TValue>[];
  /** Row data. */
  data: TData[];
  /** FilterBar props (search, columns, filters, actions, viewSwitcher). */
  filterBar?: FilterBarProps;
  /** Custom filter bar element rendered instead of the default FilterBar. */
  filterBarSlot?: React.ReactNode;
  /** Show row selection checkboxes. Default false. */
  selectable?: boolean;
  /** Controlled row selection state. */
  rowSelection?: RowSelectionState;
  /** Callback when row selection changes. */
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** Default page size. Default 25. */
  pageSize?: number;
  /** Available page size options. Default [10, 25, 50, 100]. */
  pageSizeOptions?: number[];
  /** Show pagination footer. Default true. */
  showPagination?: boolean;
  /** Compact row height. Default false. */
  compact?: boolean;
  /** Enable column resizing via drag handles. Default false. */
  resizableColumns?: boolean;
  /** Optional callback when a row is clicked. */
  onRowClick?: (row: TData) => void;
  /** Index of the currently active/highlighted row. */
  activeRowIndex?: number;
  /** Additional className on root wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Select column helper (checkbox column)
// ---------------------------------------------------------------------------

export function dataGridSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  };
}

// ---------------------------------------------------------------------------
// Re-export DataTableColumnHeader for convenience
// ---------------------------------------------------------------------------

export { DataTableColumnHeader } from "@uipath/apollo-wind/components/ui/data-table";

// ---------------------------------------------------------------------------
// Pagination footer
// ---------------------------------------------------------------------------

function DataGridPagination<TData>({
  table,
  pageSizeOptions,
}: {
  table: TanstackTable<TData>;
  pageSizeOptions: number[];
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const rangeStart = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows);
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  return (
    <div className="flex h-10 items-center justify-between px-2 text-sm text-(--foreground-muted)">
      {/* Left: range / total */}
      <div className="shrink-0 tabular-nums">
        {rangeStart} - {rangeEnd} / {totalRows}
      </div>

      {/* Center: page navigation using apollo-wind Pagination */}
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              href="#"
              size="icon"
              onClick={(e) => { e.preventDefault(); table.setPageIndex(0); }}
              aria-label="First page"
              aria-disabled={!canPrev}
              className={cn("h-7 w-7", !canPrev && "pointer-events-none opacity-50")}
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); table.previousPage(); }}
              aria-disabled={!canPrev}
              className={cn("h-7 gap-1 px-2", !canPrev && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="mx-1 tabular-nums">
              Page {pageCount === 0 ? 0 : pageIndex + 1} / {pageCount}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); table.nextPage(); }}
              aria-disabled={!canNext}
              className={cn("h-7 gap-1 px-2", !canNext && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href="#"
              size="icon"
              onClick={(e) => { e.preventDefault(); table.setPageIndex(pageCount - 1); }}
              aria-label="Last page"
              aria-disabled={!canNext}
              className={cn("h-7 w-7", !canNext && "pointer-events-none opacity-50")}
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Right: page size selector */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span>Items</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => table.setPageSize(Number(v))}
        >
          <SelectTrigger className="h-7 w-16 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DataGrid<TData, TValue>({
  columns,
  data,
  filterBar,
  filterBarSlot,
  selectable = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: controlledOnRowSelectionChange,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  showPagination = true,
  compact = false,
  resizableColumns = false,
  onRowClick,
  activeRowIndex,
  className,
}: DataGridProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});

  const isControlled = controlledRowSelection !== undefined;
  const rowSelection = isControlled
    ? controlledRowSelection
    : internalRowSelection;

  const setRowSelection = useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      if (!isControlled) setInternalRowSelection(next);
      controlledOnRowSelectionChange?.(next);
    },
    [isControlled, rowSelection, controlledOnRowSelectionChange],
  );

  // Prepend select column when selectable
  const allColumns = useMemo(() => {
    if (!selectable) return columns;
    return [dataGridSelectColumn<TData>() as ColumnDef<TData, TValue>, ...columns];
  }, [columns, selectable]);

  const table = useReactTable({
    data,
    columns: allColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    ...(resizableColumns && { columnResizeMode: "onChange" as const }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Filter bar */}
      {filterBarSlot ?? (filterBar && <FilterBar {...filterBar} />)}

      {/* Table */}
      <div className="overflow-auto rounded-md border">
        <Table className="w-full">
          <TableHeader className="bg-(--color-background-secondary)">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "relative py-0",
                      compact ? "h-8 px-2" : "h-10 px-4",
                    )}
                    style={{
                      width: header.column.getSize(),
                      minWidth: header.column.columnDef.minSize ?? header.column.getSize(),
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {resizableColumns && header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                          "hover:bg-(--brand) active:bg-(--brand)",
                          header.column.getIsResizing() && "bg-(--brand)",
                        )}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    activeRowIndex === row.index && "bg-[color:var(--brand)]/[0.06]",
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        compact
                          ? "h-8 truncate px-2 py-0"
                          : "h-12 truncate px-4 py-0"
                      }
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize ?? cell.column.getSize(),
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <DataGridPagination
          table={table}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}
