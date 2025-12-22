'use client'

import React, { useEffect, useState } from 'react';
import BasicHeader from '@/components/BasicHeader';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import TableLink from '@/components/ui/table-link';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from URL or fallback to today
  const initialFrom = searchParams.get('from') || new Date().toISOString().slice(0, 10);
  const initialTo = searchParams.get('to') || new Date().toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState({});
  const [amountGt, setAmountGt] = useState('');
  const [amountLt, setAmountLt] = useState('');
  const [partnerFilterId, setPartnerFilterId] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [partners, setPartners] = useState([]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (fromDate) params.set('from', fromDate); else params.delete('from');
    if (toDate) params.set('to', toDate); else params.delete('to');
    router.replace(`?${params.toString()}`, { shallow: true });
  }, [fromDate, toDate]);

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      let url = `/api/cash-registers/activity`;
      const params = new URLSearchParams();
      if (fromDate && toDate) {
        params.set('from', fromDate);
        params.set('to', toDate);
      } else if (fromDate) {
        params.set('date', fromDate);
      }
      if (partnerFilterId) params.set('partnerId', partnerFilterId);
      const qs = params.toString();
      if (qs) url += `?${qs}`;
      const res = await fetch(url);
      const data = await res.json();
      setActivity(data);
      setLoading(false);
    }
    if (fromDate && toDate) fetchActivity();
  }, [fromDate, toDate, partnerFilterId]);

  // Load partners for combobox
  useEffect(() => {
    fetch('/api/partners')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const opts = (data || []).map((p) => ({
          value: p.id,
          label: p.name || p.id,
        }));
        setPartners(opts);
      })
      .catch(() => {});
  }, []);

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
    if (partnerFilterId) {
      const pid = row.revision?.partner?.id || row.revision?.partnerId;
      if (pid !== partnerFilterId) return false;
    }
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
            ? <TableLink href={`/dashboard/revisions/${row.original.revisionId}`}> Продажба  №{row.original.revision.number}</TableLink>
            : '-')
        : (row.original.reason || '-')
    },
    { accessorKey: 'method', header: 'Метод'},

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

  const resetFilters = () => {
    setAmountGt('');
    setAmountLt('');
    setPartnerFilterId('');
    setDateFilter('');
  };

  return (
    <div className="container mx-auto">
      <BasicHeader
        title="Всички плащания и касови операции"
        subtitle="Общ журнал на всички каси"
      >
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Филтри
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 space-y-4" align="end">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Филтриране</p>
              <p className="text-xs text-muted-foreground">
                Диапазон, сума, партньор и конкретна дата на операция.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fromDate">От дата</Label>
                <input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="toDate">До дата</Label>
                <input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="amountGt">Сума ≥</Label>
                <Input
                  id="amountGt"
                  type="number"
                  value={amountGt}
                  onChange={e => setAmountGt(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="amountLt">Сума ≤</Label>
                <Input
                  id="amountLt"
                  type="number"
                  value={amountLt}
                  onChange={e => setAmountLt(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Партньор</Label>
              <Combobox
                options={partners}
                value={partnerFilterId}
                onValueChange={(val) => setPartnerFilterId(val)}
                placeholder="Избери партньор"
                searchPlaceholder="Търси партньор..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dateFilter">Дата на операция</Label>
              <input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => { resetFilters(); setFiltersOpen(false); }}>
                Изчисти
              </Button>
              <Button variant="default" size="sm" onClick={() => setFiltersOpen(false)}>
                Готово
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </BasicHeader>
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
          />
        )}
      </div>
    </div>
  );
}
