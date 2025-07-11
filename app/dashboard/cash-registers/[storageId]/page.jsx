'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BasicHeader from '@/components/BasicHeader';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import TableLink from '@/components/ui/table-link';

export default function CashRegisterDetailPage() {
  const { storageId } = useParams();
  const [cashRegister, setCashRegister] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [invoices, setInvoices] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/cash-registers/${storageId}`)
      .then(res => res.json())
      .then(setCashRegister)
      .finally(() => setLoading(false));
  }, [storageId]);

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      let url = `/api/cash-registers/${storageId}/activity`;
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
    if (storageId && fromDate && toDate) fetchActivity();
  }, [storageId, fromDate, toDate]);

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

  if (loading && !cashRegister) return <div>Зареждане...</div>;
  if (!cashRegister) return <div>Касата не е намерена.</div>;

  // Calculate running total
  let runningTotal = 0;
  const breakdown = activity.slice().reverse().map(ev => {
    let amount = ev.amount;
    if (ev.type === 'cash_movement') {
      amount = ev.cashMovementType === 'DEPOSIT' ? ev.amount : -ev.amount;
    }
    runningTotal += amount;
    return { ...ev, runningTotal };
  }).reverse();

  const breakdownColumns = [
    { accessorKey: 'createdAt', header: 'Дата', cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
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
      return (amount > 0 ? '+' : '') + amount;
    } },
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
    { accessorKey: 'runningTotal', header: 'Баланс след операция', cell: ({ row }) => row.original.runningTotal },
  ];

  return (
    <div className="container mx-auto">
      <BasicHeader title={`Каса за склад: ${cashRegister.storage?.name || cashRegister.storageId}`} subtitle="Детайли и разбивка на касата" />
      <div className="mb-6">
        <div className="text-lg font-bold">Текущ баланс: {cashRegister.cashBalance}</div>
      </div>
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
        <h2 className="text-xl font-semibold mb-2">Разбивка на касата</h2>
        <DataTable columns={breakdownColumns} data={breakdown} />
      </div>
    </div>
  );
} 