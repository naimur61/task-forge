'use client';

import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  className?: string;
  /** Cell content. Without it the row's `key` field is shown. */
  render?: (row: T) => ReactNode;
}

interface DynamicTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  /** Makes rows clickable and keyboard-focusable (Enter opens). */
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

/** Table driven by a column list. Used for every table in the app. */
export function DynamicTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  emptyMessage = 'No data available',
  className,
}: DynamicTableProps<T>) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-card shadow-sm', className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={getRowId(row)}
                onClick={onRowClick && (() => onRowClick(row))}
                onKeyDown={onRowClick && ((e) => e.key === 'Enter' && onRowClick(row))}
                tabIndex={onRowClick ? 0 : undefined}
                className={cn(onRowClick && 'cursor-pointer focus-visible:bg-accent focus-visible:outline-none')}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
