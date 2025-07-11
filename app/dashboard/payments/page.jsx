'use client'

import React, { useEffect, useState } from 'react';
import BasicHeader from '@/components/BasicHeader';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import TableLink from '@/components/ui/table-link';

export default function PaymentsPage() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      let url = `/api/cash-registers/activity`;
      if (fromDate && toDate) {
        url += `?from=${fromDate}&to=${toDate}`;
      } else if (fromDate) {
        url += `?date=${fromDate}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setActivity(data);
      setLoading(false);
    }
    if (fromDate && toDate) fetchActivity();
  }, [fromDate, toDate]);

  const columns = [
    { accessorKey: 'createdAt', header: 'Дата', cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('bg-BG') },
    { accessorKey: 'type', header: 'Тип', cell: ({ row }) => (
      (() => {
        let variant = 'destructive';
        if (row.original.type === 'payment') {
          variant = 'success';
        } else if (row.original.cashMovementType === 'DEPOSIT') {
          variant = 'danger';
        } else if (row.original.cashMovementType === 'WITHDRAWAL') {
          variant = 'destructive';
        }
        return (
          <Badge variant={variant}>
            {row.original.type === 'payment'
              ? 'Плащане'
              : row.original.cashMovementType === 'DEPOSIT'
                ? 'Приход'
                : row.original.cashMovementType === 'WITHDRAWAL'
                  ? 'Разход'
                  : 'Теглене'}
          </Badge>
        );
      })()
    ) },
    { accessorKey: 'amount', header: 'Сума', cell: ({ row }) => {
      let amount = row.original.amount;
      if (row.original.type === 'cash_movement') {
        amount = row.original.cashMovementType === 'DEPOSIT' ? row.original.amount : -row.original.amount;
      }
      return (amount > 0 ? '+' : '') + amount.toFixed(2) + ' лв.';
    } },
    { accessorKey: 'reason', header: 'Основание', cell: ({ row }) =>
      row.original.type === 'payment'
        ? (row.original.revision && row.original.revision.number
            ? <TableLink href={`/dashboard/revisions/${row.original.revisionId}`}>{row.original.revision.number}</TableLink>
            : '-')
        : (row.original.reason || '-')
    },
    { accessorKey: 'user', header: 'Потребител', cell: ({ row }) => row.original.user?.name || row.original.user?.email || '-' },
    { accessorKey: 'invoiceId', header: 'Фактура', cell: ({ row }) => row.original.invoiceId ? <TableLink href={`/dashboard/invoices/${row.original.invoiceId}`}>{row.original.invoice?.invoiceNumber || row.original.invoiceId}</TableLink> : '-' },
    { accessorKey: 'storageName', header: 'Каса/Склад', cell: ({ row }) => row.original.storageName || '-' },
  ];

  return (
    <div className="container mx-auto">
      <BasicHeader title="Всички плащания и касови операции" subtitle="Общ журнал на всички каси" />
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="fromDate" className="font-medium">От дата:</label>
        <input
          id="fromDate"
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <label htmlFor="toDate" className="font-medium">До дата:</label>
        <input
          id="toDate"
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Журнал на всички каси</h2>
        {loading ? (
          <div>Зареждане...</div>
        ) : (
          <DataTable columns={columns} data={activity} />
        )}
      </div>
    </div>
  );
} 