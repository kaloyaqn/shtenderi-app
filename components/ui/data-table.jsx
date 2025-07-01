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
import { useState, useEffect } from "react"
import { ArrowUpDown, Pencil, Search, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "./card"

// Helper function to get nested values
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function DataTable({
  columns,
  data,
  searchKey,
  filterableColumns = [],
  rowClassName,
  isMobile,
}) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isMobileState, setIsMobileState] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => setIsMobileState(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Responsive mobile card view
  if (isMobileState) {
    return (
      <div>
        <Card className="flex flex-col gap-2 w-full mb-2">
          <CardContent>
          {searchKey && (
            <Input
              placeholder="Потърси..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm text-xs w-full"
              
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
              className="max-w-sm text-xs"
            />
          ))}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-2">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <div key={row.id} className={`rounded border bg-white p-2 text-xs shadow-sm ${rowClassName ? rowClassName(row) : ''}`.trim()}>
                {columns.map((col, idx) => {
                  if (col?.meta?.hidden) return null;
                  const header = typeof col.header === 'string'
                    ? col.header
                    : flexRender(col.header, { column: col, table });
                  let value = null;
                  if (col.cell) {
                    value = flexRender(col.cell, { row });
                  } else if (col.accessorKey) {
                    value = getNestedValue(row.original, col.accessorKey);
                  }
                  if (col.id !== 'actions' && (value === undefined || value === null || value === '')) return null;
                  return (
                    <div key={col.id || col.accessorKey || idx} className="flex justify-between items-baseline border-b last:border-b-0 py-1">
                      <span className="font-semibold text-gray-700 mr-2">{header}</span>
                      <span className="text-gray-900 text-right break-all">{value}</span>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8 text-xs">Няма намерени резултати.</div>
          )}
        </div>
        <div className="flex flex-col gap-4 w-full py-4 sm:flex-row sm:items-center sm:justify-between">
  <div className="text-sm text-muted-foreground text-center sm:text-left sm:ml-2">
    Страница {table.getState().pagination.pageIndex + 1} от{" "}
    {table.getPageCount()}
  </div>
  <div className="flex flex-col gap-2 items-center sm:flex-row sm:space-x-2 sm:gap-0">
    <Button
      variant="outline"
      className="w-full sm:w-auto"
      size="sm"
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      {"<-"} Предишна
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
      className="w-full sm:w-auto"
    >
      Следваща {"->"}
    </Button>
  </div>
</div>
      </div>
    )
  }

  return (
    <div>
      <Card className="flex px-4 items-center md:flex-row flex-col gap-4 py-4 mb-2 md:w-auto w-full">
        {searchKey && (
          <div className="relative w-full md:mb-0 mb-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
            placeholder="Потърси..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="md:max-w-sm pl-10 w-full"
          />
                    </div>
        )}


        {filterableColumns.map((column) => (
          <Input
            key={column.id}
            placeholder={`Филтрирай по ${column.title.toLowerCase()}...`}
            value={(table.getColumn(column.id)?.getFilterValue()) ?? ""}
            onChange={(event) =>
              table.getColumn(column.id)?.setFilterValue(event.target.value)
            }
            className="md:max-w-sm w-full md:mb-0 mb-2"
          />
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Select
            className="border rounded px-2 py-1 text-sm"
            value={String(table.getState().pagination.pageSize)}
            onValueChange={value => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger>{table.getState().pagination.pageSize}</SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, 100].map(size => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
      <div className="rounded-xl border w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center  gap-2">
                          <Button
                            variant="ghost"
                            className="uppercase text-xs"
                            onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <ArrowUpDown size={2} className="ml-2 w-2" />
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
      <div className="flex flex-col gap-4 w-full py-4 sm:flex-row sm:items-center sm:justify-between">
  <div className="text-sm text-muted-foreground text-center sm:text-left sm:ml-2">
    Страница {table.getState().pagination.pageIndex + 1} от{" "}
    {table.getPageCount()}
  </div>
  <div className="flex flex-col gap-2 items-center sm:flex-row sm:space-x-2 sm:gap-0">
    <Button
      variant="outline"
      className="w-full sm:w-auto"
      size="sm"
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      {"<-"} Предишна
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
      className="w-full sm:w-auto"
    >
      Следваща {"->"}
    </Button>
  </div>
</div>
    </div>
  )
} 