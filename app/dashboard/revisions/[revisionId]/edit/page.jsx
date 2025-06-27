"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';

export default function RevisionEditPage() {
  const params = useParams();
  const { revisionId } = params;
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missingProducts, setMissingProducts] = useState([]);
  const [newBarcode, setNewBarcode] = useState("");
  const [addError, setAddError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRevision = async () => {
      const res = await fetch(`/api/revisions/${revisionId}`);
      const data = await res.json();
      setRevision(data);
      setMissingProducts(data.missingProducts.map(mp => ({ ...mp, product: mp.product })));
      setLoading(false);
    };
    fetchRevision();
  }, [revisionId]);

  const handleQuantityChange = (idx, value) => {
    setMissingProducts(missingProducts.map((mp, i) => i === idx ? { ...mp, missingQuantity: value } : mp));
  };

  const handleRemove = (idx) => {
    setMissingProducts(missingProducts.filter((_, i) => i !== idx));
  };

  const handleAddProduct = async () => {
    setAddError("");
    if (!newBarcode.trim()) return;
    // Find product by barcode
    const res = await fetch(`/api/products?barcode=${encodeURIComponent(newBarcode.trim())}`);
    const data = await res.json();
    if (!data || !data.id) {
      setAddError("Продуктът не е намерен.");
      return;
    }
    if (missingProducts.some(mp => mp.productId === data.id)) {
      setAddError("Вече е добавен.");
      return;
    }
    setMissingProducts([
      ...missingProducts,
      { productId: data.id, missingQuantity: 1, product: data }
    ]);
    setNewBarcode("");
  };

  const handleSave = async () => {
    await fetch(`/api/revisions/${revisionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        missingProducts: missingProducts.map(mp => ({
          productId: mp.productId,
          missingQuantity: Number(mp.missingQuantity)
        }))
      })
    });
    router.push(`/dashboard/revisions/${revisionId}`);
  };

  if (loading) return <div>Зареждане...</div>;
  if (!revision) return <div>Ревизията не е намерена.</div>;

  const columns = [
    {
      accessorKey: 'name',
      header: 'Име',
      cell: ({ row }) => row.original.product?.name || '-',
    },
    {
      accessorKey: 'barcode',
      header: 'Баркод',
      cell: ({ row }) => row.original.product?.barcode || '-',
    },
    {
      accessorKey: 'missingQuantity',
      header: 'Брой',
      cell: ({ row, table }) => (
        <Input
          type="number"
          min={1}
          value={row.original.missingQuantity}
          onChange={e => {
            const idx = table.options.data.findIndex(mp => mp.productId === row.original.productId);
            handleQuantityChange(idx, e.target.value);
          }}
          className="w-20"
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row, table }) => {
        const idx = table.options.data.findIndex(mp => mp.productId === row.original.productId);
        return (
          <Button size="sm" variant="ghost" onClick={() => handleRemove(idx)}>Премахни</Button>
        );
      },
    },
  ];

  // Flatten data for DataTable
  const data = missingProducts.map(mp => ({
    ...mp,
    name: mp.product?.name || '-',
    barcode: mp.product?.barcode || '-',
  }));

  return (
    <div className="py-10 ">
      <h1 className="text-2xl font-bold mb-6">Редакция на ревизия</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {revision?.number && <div><strong>№:</strong> {revision.number}</div>}
        <div><b>Щанд:</b> {revision.stand?.name || '-'}</div>
        <div><b>Партньор:</b> {revision.partner?.name || '-'}</div>
        <div><b>Потребител:</b> {revision.user?.name || revision.user?.email || '-'}</div>
        <div><b>Дата:</b> {new Date(revision.createdAt).toLocaleString()}</div>
      </div>
      <h2 className="text-lg font-semibold mb-2">Липсващи продукти</h2>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        filterableColumns={[
          { id: 'name', title: 'Име' },
          { id: 'barcode', title: 'Баркод' },
        ]}
      />
      <div className="flex items-center gap-2 mb-4 mt-4">
        <Input
          placeholder="Баркод на продукт за добавяне"
          value={newBarcode}
          onChange={e => setNewBarcode(e.target.value)}
          className="w-64"
        />
        <Button size="sm" onClick={handleAddProduct}>Добави</Button>
        {addError && <span className="text-red-500 ml-2">{addError}</span>}
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave}>Запази</Button>
        <Button variant="ghost" onClick={() => router.push(`/dashboard/revisions/${revisionId}`)}>Отказ</Button>
      </div>
    </div>
  );
} 