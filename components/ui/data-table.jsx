'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ArrowUpDown } from "lucide-react"
import { Select } from "@/components/ui/select"

// Helper function to get nested values
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function DataTable({
  columns,
  data,
  searchKey,
  filterableColumns = [],
  rowClassName,
}) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    filterFns: {
        global: (row, columnId, filterValue) => {
            const value = getNestedValue(row.original, searchKey);
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
        }
    },
    globalFilterFn: 'global',
    initialState: { pagination: { pageSize: 30 } },
  })

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        {searchKey && (
          <Input
            placeholder="Потърси..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        )}
        {filterableColumns.map((column) => (
          <Input
            key={column.id}
            placeholder={`Филтрирай по ${column.title.toLowerCase()}...`}
            value={(table.getColumn(column.id)?.getFilterValue()) ?? ""}
            onChange={(event) =>
              table.getColumn(column.id)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Покажи по:</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={rowClassName ? rowClassName(row) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Няма намерени резултати.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground ml-2">
          Страница {table.getState().pagination.pageIndex + 1} от {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Предишна
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Следваща
          </Button>
        </div>
      </div>
    </div>
  )
} 