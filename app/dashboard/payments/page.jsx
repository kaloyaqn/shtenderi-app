'use client'

import React, { useEffect, useState } from 'react';
import BasicHeader from '@/components/BasicHeader';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import TableLink from '@/components/ui/table-link';
import { Input } from '@/components/ui/input';

export default function PaymentsPage() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [invoices, setInvoices] = useState({});
  const [amountGt, setAmountGt] = useState('');
  const [amountLt, setAmountLt] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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

  // Fetch all invoices for the revisions in the activity
  useEffect(() => {
    async function fetchInvoicesForRevisions() {
      const revisionNumbers = Array.from(new Set(activity.filter(a => a.revision?.number).map(a => a.revision.number)));
      if (revisionNumbers.length === 0) return;
      const params = new URLSearchParams();
      revisionNumbers.forEach(n => params.append('revisionNumber', n));
      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      // Map revisionNumber to invoice
      const invoiceMap = {};
      data.forEach(inv => { invoiceMap[inv.revisionNumber] = inv; });
      setInvoices(invoiceMap);
    }
    fetchInvoicesForRevisions();
  }, [activity]);

  // Filtering logic
  const filteredActivity = activity.filter(row => {
    // Amount filters
    let amount = row.amount;
    if (row.type === 'cash_movement') {
      amount = row.cashMovementType === 'DEPOSIT' ? row.amount : -row.amount;
    }
    if (amountGt && !(amount > parseFloat(amountGt))) return false;
    if (amountLt && !(amount < parseFloat(amountLt))) return false;
    // Partner filter
    const partnerName = row.revision?.partner?.name || row.revision?.partnerName || '';
    if (partnerFilter && !partnerName.toLowerCase().includes(partnerFilter.toLowerCase())) return false;
    // Date filter (single date)
    if (dateFilter) {
      const rowDate = new Date(row.createdAt).toISOString().slice(0, 10);
      if (rowDate !== dateFilter) return false;
    }
    return true;
  });

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
    { accessorKey: 'partner', header: 'Партньор', cell: ({ row }) => row.original.revision?.partner?.name || row.original.revision?.partnerName || '-' },
    { accessorKey: 'reason', header: 'Основание', cell: ({ row }) =>
      row.original.type === 'payment'
        ? (row.original.revision && row.original.revision.number
            ? <TableLink href={`/dashboard/revisions/${row.original.revisionId}`}>{row.original.revision.number}</TableLink>
            : '-')
        : (row.original.reason || '-')
    },
    { accessorKey: 'user', header: 'Потребител', cell: ({ row }) => row.original.user?.name || row.original.user?.email || '-' },
    { accessorKey: 'invoiceId', header: 'Фактура', cell: ({ row }) => {
      // Find invoice by revision number
      const revNum = row.original.revision?.number;
      const invoice = revNum ? invoices[revNum] : null;
      return invoice ? (
        <TableLink href={`/dashboard/invoices/${invoice.id}`}>{invoice.invoiceNumber}</TableLink>
      ) : '-';
    } },
    { accessorKey: 'storageName', header: 'Каса/Склад', cell: ({ row }) => row.original.storageName || '-' },
  ];

  return (
    <div className="container mx-auto">
      <BasicHeader title="Всички плащания и касови операции" subtitle="Общ журнал на всички каси" />
      <div className="mb-4 flex flex-wrap items-center gap-4">
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
          <DataTable
            columns={columns}
            data={filteredActivity}
            searchKey={null}
            filterableColumns={[]}
            extraFilters={
              <>
                <label htmlFor="amountGt" className="font-medium">Сума &gt;=</label>
                <Input
                  id="amountGt"
                  type="number"
                  value={amountGt}
                  onChange={e => setAmountGt(e.target.value)}
                  className="w-24"
                />
                <label htmlFor="amountLt" className="font-medium">Сума &lt;=</label>
                <Input
                  id="amountLt"
                  type="number"
                  value={amountLt}
                  onChange={e => setAmountLt(e.target.value)}
                  className="w-24"
                />
                <label htmlFor="partnerFilter" className="font-medium">Партньор</label>
                <Input
                  id="partnerFilter"
                  type="text"
                  value={partnerFilter}
                  onChange={e => setPartnerFilter(e.target.value)}
                  className="w-32"
                />
                <label htmlFor="dateFilter" className="font-medium">Дата</label>
                <input
                  id="dateFilter"
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </>
            }
          />
        )}
      </div>
    </div>
  );
} 