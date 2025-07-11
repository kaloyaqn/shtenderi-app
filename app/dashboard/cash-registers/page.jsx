'use client'

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import BasicHeader from '@/components/BasicHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

export default function CashRegistersPage() {
  const [cashRegisters, setCashRegisters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/cash-registers')
      .then(res => res.json())
      .then(setCashRegisters)
      .finally(() => setLoading(false));
  }, []);

  const cashRegisterColumns = [
    {
      accessorKey: 'storageName',
      header: 'Склад',
      cell: ({ row }) => row.original.storage?.name || row.original.storageId,
    },
    {
      accessorKey: 'cashBalance',
      header: 'Каса',
      cell: ({ row }) => row.original.cashBalance,
    },
    {
      id: 'actions',
      header: 'Детайли',
      cell: ({ row }) => (
        <Link href={`/dashboard/cash-registers/${row.original.storageId}`}> 
          <Button size="sm" variant="table">Детайли</Button>
        </Link>
      ),
    },
  ];


  if (loading) return <LoadingScreen />

  return (
    <div className="container mx-auto">
      <BasicHeader title="Каси (Cash Registers)" subtitle="Всички каси" />
      <div className="mt-6">
        <DataTable columns={cashRegisterColumns} data={cashRegisters} />
      </div>
    </div>
  );
} 