"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function RefundDetailPage() {
  const { refundId } = useParams();
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState("");
  const [returning, setReturning] = useState(false);
  const [returned, setReturned] = useState(false);
  const [returnedStorage, setReturnedStorage] = useState(null);
  const [returnedAt, setReturnedAt] = useState(null);

  useEffect(() => {
    if (!refundId) return;
    fetch(`/api/refunds`)
      .then((res) => res.json())
      .then((data) => setRefund(data.find((r) => r.id === refundId) || null))
      .finally(() => setLoading(false));
  }, [refundId]);

  useEffect(() => {
    if (refund?.returnedToStorageId) {
      setReturned(true);
      setReturnedAt(refund.returnedAt);
      // Fetch storage name
      fetch(`/api/storages/${refund.returnedToStorageId}`)
        .then((res) => res.json())
        .then((storage) => setReturnedStorage(storage));
    }
  }, [refund]);

  if (loading) return <div>Зареждане...</div>;
  if (!refund) return <div>Връщането не е намерено.</div>;

  const columns = [
    {
      accessorKey: "product.name",
      header: "Име на продукта",
      cell: ({ row }) => row.original.product?.name || "-",
    },
    {
      accessorKey: "product.barcode",
      header: "Баркод",
      cell: ({ row }) => row.original.product?.barcode || "-",
    },
    {
      accessorKey: "quantity",
      header: "Количество",
      cell: ({ row }) => row.original.quantity,
    },
  ];

  let sourceHref = "#";
  if (refund.sourceType === "STAND") sourceHref = `/dashboard/stands/${refund.sourceId}`;
  else if (refund.sourceType === "STORAGE") sourceHref = `/dashboard/storages/${refund.sourceId}`;

  const openReturnDialog = () => {
    setReturnDialogOpen(true);
    if (storages.length === 0) {
      fetch("/api/storages")
        .then((res) => res.json())
        .then(setStorages);
    }
  };

  const handleReturnToStorage = async () => {
    if (!selectedStorage) return;
    setReturning(true);
    try {
      const res = await fetch(`/api/refunds/${refund.id}/return-to-storage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageId: selectedStorage }),
      });
      if (!res.ok) throw new Error("Грешка при връщане в склад");
      setReturned(true);
      setReturnDialogOpen(false);
      toast.success("Продуктите са върнати в склада!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Детайли за връщане</h1>
      <div className="mb-4 flex gap-4 items-center">
        <div>
          <div><b>Дата:</b> {new Date(refund.createdAt).toLocaleString("bg-BG")}</div>
          <div><b>Потребител:</b> {refund.user?.name || refund.user?.email || "-"}</div>
          <div><b>Източник:</b> {refund.sourceType} <Link href={sourceHref} className="text-blue-600 hover:underline ml-2">{refund.sourceName}</Link></div>
          {returned && returnedStorage && (
            <div className="mt-2 text-green-700">
              <b>Върнато в склад:</b> <Link href={`/dashboard/storages/${returnedStorage.id}`} className="text-blue-600 hover:underline">{returnedStorage.name}</Link> <span className="text-gray-600">({new Date(returnedAt).toLocaleString("bg-BG")})</span>
            </div>
          )}
        </div>
        <Button onClick={handlePrint} className="ml-auto">Принтирай върнатите продукти</Button>
        <Button
          onClick={openReturnDialog}
          disabled={returned}
          variant={returned ? "secondary" : "default"}
        >
          {returned ? "Върнато в склад" : "Върни продуктите в склад"}
        </Button>
      </div>
      <DataTable columns={columns} data={refund.refundProducts} searchKey="product.name" />
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Избери склад за връщане</DialogTitle>
          </DialogHeader>
          <Select value={selectedStorage} onValueChange={setSelectedStorage}>
            <SelectTrigger>
              <SelectValue placeholder="Избери склад..." />
            </SelectTrigger>
            <SelectContent>
              {storages.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>Отказ</Button>
            <Button onClick={handleReturnToStorage} disabled={!selectedStorage || returning}>
              {returning ? "Връщане..." : "Върни в склад"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Printable table */}
      <div ref={printRef} className="hidden print:block bg-white p-8 text-black">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">Върнати продукти</div>
          <div className="text-md">Дата: {new Date(refund.createdAt).toLocaleDateString('bg-BG')}</div>
        </div>
        <div className="mb-2">
          <b>Източник:</b> {refund.sourceType} - {refund.sourceName}
        </div>
        <table className="w-full border border-black mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-2 py-1">Име на продукта</th>
              <th className="border border-black px-2 py-1">EAN код</th>
              <th className="border border-black px-2 py-1">Количество</th>
            </tr>
          </thead>
          <tbody>
            {refund.refundProducts.map((rp) => (
              <tr key={rp.id}>
                <td className="border border-black px-2 py-1">{rp.product?.name || "-"}</td>
                <td className="border border-black px-2 py-1">{rp.product?.barcode || "-"}</td>
                <td className="border border-black px-2 py-1 text-center">{rp.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 