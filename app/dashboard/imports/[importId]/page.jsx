'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';
import BasicHeader from '@/components/BasicHeader';

export default function ImportDetailPage() {
  const params = useParams();
  const { importId } = params;
  const [importData, setImportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchImport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/imports`);
        if (!res.ok) throw new Error('Failed to fetch import');
        const allImports = await res.json();
        const found = allImports.find((imp) => imp.id === importId);
        setImportData(found || null);
      } catch (err) {
        toast.error('Failed to load import data.');
      } finally {
        setLoading(false);
      }
    };
    if (importId) fetchImport();
  }, [importId]);

  if (loading) return <LoadingScreen />;
  if (!importData) return <div>Импортът не е намерен.</div>;

  // Ensure pcode is present at the top level for filtering
  const data = importData.importProducts.map(ip => ({
    ...ip,
    name: ip.product?.name || '-',
    barcode: ip.product?.barcode || '-',
    pcode: ip.product?.pcode || '-', // <-- Add pcode at top level for filtering
    clientPrice: ip.product?.clientPrice || 0,
  }));

  const columns = [
    {
      id: "name",
      accessorKey: 'name',
      header: 'Име',
      cell: ({ row }) => row.original.product?.name || '-',
    },
    {
      id: 'barcode',
      accessorKey: 'barcode',
      header: 'Баркод',
      cell: ({ row }) => row.original.product?.barcode || '-',
    },
    {
      id: 'pcode',
      accessorKey: 'pcode',
      header: '',
      cell: ({ row }) => <span className='text-[2px]'>
        {row.original.product?.pcode || '-'}
      </span>,
    },
    {
      accessorKey: 'quantity',
      header: 'Брой',
      cell: ({ row }) => row.original.quantity,
    },
    {
      accessorKey: 'clientPrice',
      header: 'Цена',
      cell: ({ row }) => row.original.product?.clientPrice?.toFixed(2) || '-',
    },
  ];

  const totalQuantity = importData.importProducts.reduce((sum, ip) => sum + ip.quantity, 0);
  const totalValue = importData.importProducts.reduce((sum, ip) => sum + (ip.quantity * (ip.product?.clientPrice || 0)), 0);

  return (
    <div className="container mx-auto">
      <BasicHeader title={`Импорт ${importData.fileName}`} hasBackButton subtitle={"Виж всички данни за този импорт."}/>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-2">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Информация за импорта</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-lg font-semibold">{importData.id}</p>
                </div> */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Файл</label>
                  <p className="text-base font-medium">{importData.fileName || '-'}</p>
                </div>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-500">Потребител</label>
                <p className="text-base font-medium">{importData.user?.name || importData.user?.email || '-'}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Щанд</label>
                  <p className="text-base">{importData.stand?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Склад</label>
                  <p className="text-base">{importData.storage?.name || '-'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Дата</label>
                <p className="text-base">{new Date(importData.createdAt).toLocaleString('bg-BG')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className="text-base lg:text-lg">
                  Импортирани продукти
                </CardTitle>
                <Badge variant='outline'>
                  {importData.importProducts.length} продукта
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                filterableColumns={[
                  { id: "name", title: "Име на продукт" },
                  { id: "barcode", title: "Баркод на продукт" },
                  { id: "pcode", title: "Код на продукт" },
                ]}
                columns={columns}
                data={data}
              />
              <div className="flex justify-end gap-8 mt-4">
                <div className="text-sm text-gray-600">Общо бройки: <span className="font-bold">{totalQuantity}</span></div>
                <div className="text-sm text-gray-600">Обща стойност: <span className="font-bold">{totalValue.toFixed(2)} лв.</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}