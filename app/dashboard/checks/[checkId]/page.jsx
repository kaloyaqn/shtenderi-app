'use client'
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import LoadingScreen from '@/components/LoadingScreen';
import BasicHeader from '@/components/BasicHeader';
import { BadgeDollarSignIcon, Printer, ScaleIcon, Truck } from 'lucide-react';
import RevisionProductsTable from '@/app/dashboard/revisions/[revisionId]/_components/RevisionProductsTable';
import { DataTable } from '@/components/ui/data-table';
import { useSession } from 'next-auth/react';

export default function CheckIdPage() {
  const params = useParams();
  const { checkId } = params;
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [resupplyDialogOpen, setResupplyDialogOpen] = useState(false);
  const [resupplyErrors, setResupplyErrors] = useState([]);
  const [resupplyLoading, setResupplyLoading] = useState(false);
  const router = useRouter();
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ content: () => contentRef.current });
  const { data: session } = useSession();

  useEffect(() => {
    if (checkId) {
      setLoading(true);
      fetch(`/api/checks/${checkId}`)
        .then(res => res.json())
        .then(setCheck)
        .finally(() => setLoading(false));
    }
  }, [checkId]);

  // Fetch storages for resupply dialog
  useEffect(() => {
    if (resupplyDialogOpen && check?.stand?.id) {
      fetch('/api/storages')
        .then(res => res.json())
        .then(setStorages)
        .catch(() => toast.error('Failed to load storages'));
    }
  }, [resupplyDialogOpen, check?.stand?.id]);

  // Print logic
  const getPrintTableHtml = () => {
    const el = contentRef.current;
    return el ? el.outerHTML : '';
  };
  const handlePrint = () => {
    reactToPrintFn();
  };

  // Resupply (load from storage) logic
  const handleResupply = async () => {
    if (!selectedStorage) {
      toast.error('Моля, изберете склад.');
      return;
    }
    setResupplyLoading(true);
    setResupplyErrors([]);
    try {
      const response = await fetch(`/api/stands/${check.stand.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storageId: selectedStorage,
          products: check.checkedProducts.map(cp => ({
            productId: cp.product.id,
            quantity: cp.quantity,
          })),
        }),
      });
      if (response.status === 409) {
        const data = await response.json();
        setResupplyErrors(data.insufficient || []);
        return;
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to resupply from storage');
      }
      toast.success('Щандът е зареден успешно!');
      setResupplyDialogOpen(false);
      setResupplyErrors([]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResupplyLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!check) return <div>Проверката не е намерена.</div>;

  // Table columns for checked products
  const columns = [
    { accessorKey: 'name', header: 'Име', cell: ({ row }) => row.original.product?.name || '-' },
    { accessorKey: 'barcode', header: 'Баркод', cell: ({ row }) => row.original.product?.barcode || '-' },
    { accessorKey: 'quantity', header: 'Брой', cell: ({ row }) => row.original.quantity },
    { accessorKey: 'status', header: 'Статус', cell: ({ row }) => row.original.status },
  ];
  const data = check.checkedProducts.map(cp => ({
    ...cp,
    name: cp.product?.name || '-',
    barcode: cp.product?.barcode || '-',
  }));

  return (
    <div className="container mx-auto">
      <BasicHeader
        hasBackButton
        title={`Проверка #${check.id.slice(0, 8)}`}
        subtitle="Всички данни за твоята проверка"
      >
        <Button variant="outline" onClick={handlePrint}>
          <Printer /> Принтирай
        </Button>
        {session?.user?.role === 'ADMIN' && (
          <Button
            variant="outline"
            onClick={() => setResupplyDialogOpen(true)}
          >
            <Truck /> Зареди от склад
          </Button>
        )}
        <div className="h-6 w-px bg-gray-300"></div>
        <Button
          onClick={() => router.push(`/dashboard/stands/${check.stand.id}/revision?checkId=${check.id}`)}
        >
          <BadgeDollarSignIcon /> Превърни в продажба
        </Button>
      </BasicHeader>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-2">
        <div className="lg:col-span-1 order-2 lg:order-1 sticky top-2 self-start z-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Информация за проверката</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="text-lg font-semibold">{check.id.slice(0, 8)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Щанд</label>
                <p className="text-base">{check.stand?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Потребител</label>
                <p className="text-base">{check.user?.name || check.user?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Дата</label>
                <p className="text-base">{new Date(check.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2 gap-2 flex flex-col">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base lg:text-lg">Проверени продукти</CardTitle>
                <Badge variant="outline">{check.checkedProducts.length} продукта</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={data} searchKey="barcode" />
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Print-only stock receipt table */}
      <div ref={contentRef} className="hidden print:block bg-white p-8 text-black">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">Проверка № {check.id.slice(0, 8)}</div>
          <div className="text-md">
            Дата: {new Date(check.createdAt).toLocaleDateString("bg-BG")}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="mb-2">
            <div className="font-semibold">Доставчик:</div>
            <div>Фирма: Омакс Сълюшънс ЕООД</div>
            <div>ЕИК/ДДС номер: BG200799887</div>
            <div>Седалище: гр. Хасково, ул. Рай №7</div>
          </div>
          <div className="mb-2 text-right">
            <div className="font-semibold">Получател:</div>
            <div>Щанд: {check.stand?.name || '-'}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold">Описание:</div>
        </div>
        <RevisionProductsTable
          missingProducts={check.checkedProducts.map(cp => ({
            ...cp,
            product: cp.product,
            missingQuantity: cp.quantity,
            priceAtSale: cp.product?.clientPrice,
          }))}
          priceLabel="Единична цена с ДДС"
          totalLabel="Обща стойност"
        />
      </div>
      {/* Resupply Dialog */}
      <Dialog
        open={resupplyDialogOpen}
        onOpenChange={(open) => {
          setResupplyDialogOpen(open);
          if (!open) setResupplyErrors([]);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зареждане на щанд от склад</DialogTitle>
            <DialogDescription>
              Изберете от кой склад да заредите проверените количества.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={setSelectedStorage} value={selectedStorage}>
              <SelectTrigger>
                <SelectValue placeholder="Избери склад..." />
              </SelectTrigger>
              <SelectContent>
                {storages.map((storage) => (
                  <SelectItem key={storage.id} value={storage.id}>
                    {storage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {resupplyErrors.length > 0 && (
              <div className="mt-2 text-red-600 text-sm">
                Недостатъчни количества за:
                <ul>
                  {resupplyErrors.map((err, i) => (
                    <li key={i}>{err.productName} (нужно: {err.needed}, налично: {err.available})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResupplyDialogOpen(false)} disabled={resupplyLoading}>
              Отказ
            </Button>
            <Button onClick={handleResupply} disabled={!selectedStorage || resupplyLoading}>
              {resupplyLoading ? 'Зареждане...' : 'Зареди'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}