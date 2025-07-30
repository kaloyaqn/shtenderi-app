'use client'

import BasicHeader from "@/components/BasicHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import DatePicker from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import TableLink from "@/components/ui/table-link";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, X } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import CreatePaymentRevisionForm from "@/components/forms/payments-revision/CreatePaymentRevisionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PartnerReport() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // States
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [revisionType, setRevisionType] = useState("all");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);



  // Fetch partner sales
  const fetchPartnerSales = useCallback(async () => {
    if (!selectedPartner) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) {
        const year = dateFrom.getFullYear();
        const month = String(dateFrom.getMonth() + 1).padStart(2, "0");
        const day = String(dateFrom.getDate()).padStart(2, "0");
        params.set("dateFrom", `${year}-${month}-${day}`);
      }
      if (dateTo) {
        const year = dateTo.getFullYear();
        const month = String(dateTo.getMonth() + 1).padStart(2, "0");
        const day = String(dateTo.getDate()).padStart(2, "0");
        params.set("dateTo", `${year}-${month}-${day}`);
      }
      if (status && status !== "all") params.set("status", status);
      if (type && type !== "all") params.set("type", type);
      if (revisionType && revisionType !== "all") params.set("revisionType", revisionType);

      const res = await fetch(`/api/reports/partners/${selectedPartner}/sales?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch partner sales");
      
      const data = await res.json();
      setSales(data.sales || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedPartner, dateFrom, dateTo, status, type, revisionType]);

  // Fetch payments for a specific revision
  const fetchPayments = useCallback(async (revisionId) => {
    try {
      const res = await fetch(`/api/revisions/${revisionId}/payments`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      return data.payments || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  // Refresh sales data after payment
  const handlePaymentSuccess = useCallback(() => {
    // Small delay to ensure the payment is processed
    setTimeout(() => {
      fetchPartnerSales();
      setIsPaymentDialogOpen(false);
      setSelectedRevision(null);
    }, 500);
  }, [fetchPartnerSales]);

  // Fetch partners
  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch("/api/reports/partners");
        if (!res.ok) throw new Error("Failed to fetch partners");
        const data = await res.json();
        setPartners(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchPartners();
  }, []);

  // Sync with URL parameters on mount and fetch data
  useEffect(() => {
    const partner = searchParams.get("partner");
    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");
    const revisionTypeParam = searchParams.get("revisionType");

    if (partner) setSelectedPartner(partner);
    if (dateFromParam) setDateFrom(new Date(dateFromParam));
    if (dateToParam) setDateTo(new Date(dateToParam));
    if (statusParam) setStatus(statusParam);
    if (typeParam) setType(typeParam);
    if (revisionTypeParam) setRevisionType(revisionTypeParam);
  }, [searchParams]);

  // Fetch data when filters change
  useEffect(() => {
    if (selectedPartner) {
      fetchPartnerSales();
    }
  }, [fetchPartnerSales]);

  function handleFormSubmit(e) {
    e.preventDefault();
    
    // Update URL with current filters
    const params = new URLSearchParams();
    if (selectedPartner) params.set("partner", selectedPartner);
    if (dateFrom) {
      const year = dateFrom.getFullYear();
      const month = String(dateFrom.getMonth() + 1).padStart(2, "0");
      const day = String(dateFrom.getDate()).padStart(2, "0");
      params.set("dateFrom", `${year}-${month}-${day}`);
    }
    if (dateTo) {
      const year = dateTo.getFullYear();
      const month = String(dateTo.getMonth() + 1).padStart(2, "0");
      const day = String(dateTo.getDate()).padStart(2, "0");
      params.set("dateTo", `${year}-${month}-${day}`);
    }
    if (status && status !== "all") params.set("status", status);
    if (type && type !== "all") params.set("type", type);
    if (revisionType && revisionType !== "all") params.set("revisionType", revisionType);
    
    router.push(`/dashboard/reports/partner?${params.toString()}`);
  }

  function handleClear() {
    setSelectedPartner(null);
    setDateFrom(null);
    setDateTo(null);
    setStatus("all");
    setType("all");
    setRevisionType("all");
    setSales([]);
    router.push("/dashboard/reports/partner");
  }

  const columns = [
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.original.type === "missing" 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {row.original.type === "missing" ? "Продажба" : "Връщане"}
        </span>
      ),
    },
    {
      accessorKey: "number",
      header: "Номер",
      cell: ({ row }) => {
        if (row.original.type === "missing") {
          return (
            <TableLink href={`/dashboard/revisions/${row.original.id}`}>
              {row.original.number || "-"}
            </TableLink>
          );
        } else {
          return (
            <TableLink href={`/dashboard/refunds/${row.original.id}`}>
              R-{row.original.id.slice(0, 8)}
            </TableLink>
          );
        }
      },
    },
    {
      accessorKey: "products",
      header: "Продукти",
      cell: ({ row }) => {
        if (row.original.type === "missing") {
          const products = row.original.missingProducts || [];
          return products.length > 0 ? `${products.length} продукта` : "-";
        } else {
          const products = row.original.refundProducts || [];
          return products.length > 0 ? `${products.length} продукта` : "-";
        }
      },
    },
    {
      accessorKey: "user",
      header: "Потребител",
      cell: ({ row }) => {
        return row.original.user?.name || "-";
      },
    },
    {
      accessorKey: "totalValue",
      header: "Обща стойност",
      cell: ({ row }) => {
        if (row.original.type === "missing") {
          const products = row.original.missingProducts || [];
          const total = products.reduce((sum, mp) => sum + ((mp.priceAtSale || 0) * (mp.missingQuantity || 0)), 0);
          return total > 0 ? `${total.toFixed(2)} лв.` : "-";
        } else {
          const products = row.original.refundProducts || [];
          const total = products.reduce((sum, rp) => sum + ((rp.priceAtRefund || 0) * (rp.quantity || 0)), 0);
          return total > 0 ? `${total.toFixed(2)} лв.` : "-";
        }
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Статус на плащане",
      cell: ({ row }) => {
        const isPaid = row.original.type === "missing" 
          ? row.original.status === "PAID"
          : !!row.original.paymentInfo;
        return (
          <span className={`px-2 py-1 rounded text-xs ${
            isPaid ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
          }`}>
            {isPaid ? "Платено" : "Неплатено"}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "плащане",
      cell: ({ row }) => {
        const payment = row.original.paymentInfo;
        if (!payment) return "-";
        return payment.method === "CASH" ? "В брой" : "Банков превод";
      },
    },
    {
      accessorKey: "invoice",
      header: "Фактура",
      cell: ({ row }) => {
        const invoice = row.original.invoiceInfo;
        if (!invoice) return "-";
        return `№${invoice.invoiceNumber}`;
      },
    },
    {
      accessorKey: "date",
      header: "Дата",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return date ? new Date(date).toLocaleDateString('bg-BG') : "-";
      },
    }
  ];

  return (
    <>
      <BasicHeader 
        title={'Справка партньор'}
        subtitle={'Всички данни за партньора'}
      />
      
      <div className="">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 mb-6">
          {/* Partner Selection */}
          <div className="w-full">
            <Label className="mb-2">Партньор</Label>
            <Select value={selectedPartner || ""} onValueChange={setSelectedPartner}>
              <SelectTrigger className="w-full">
                {selectedPartner 
                  ? partners.find(p => p.id === selectedPartner)?.name 
                  : "Избери партньор"}
              </SelectTrigger>
              <SelectContent>
                {partners.map(partner => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full">
              <Label className="mb-2">Дата от</Label>
              <DatePicker 
                setDate={setDateFrom} 
                date={dateFrom} 
                className="w-full" 
              />
            </div>
            <div className="w-full">
              <Label className="mb-2">Дата до</Label>
              <DatePicker 
                setDate={setDateTo} 
                date={dateTo} 
                className="w-full" 
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full">
              <Label className="mb-2">Статус на плащане</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  {status === "paid" ? "Платено" : status === "unpaid" ? "Неплатено" : "Всички"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички</SelectItem>
                  <SelectItem value="paid">Платено</SelectItem>
                  <SelectItem value="unpaid">Неплатено</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <Label className="mb-2">Тип</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  {type === "missing" ? "Продажба" : type === "refund" ? "Връщане" : "Всички"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички</SelectItem>
                  <SelectItem value="missing">Продажба</SelectItem>
                  <SelectItem value="refund">Връщане</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <Label className="mb-2">Източник</Label>
              <Select value={revisionType} onValueChange={setRevisionType}>
                <SelectTrigger className="w-full">
                  {revisionType === "import" ? "Импорт" : revisionType === "manual" ? "Ръчно" : "Всички"}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички</SelectItem>
                  <SelectItem value="import">Импорт</SelectItem>
                  <SelectItem value="manual">Ръчно</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <Button type="submit" className="w-full md:w-auto flex-1" disabled={!selectedPartner}>
              <Filter />
              Търси
            </Button>
            <Button variant={'outline'} onClick={handleClear} className="w-full md:w-auto flex-1">
              <X />
              Изчисти
            </Button>
          </div>
        </form>

        {/* Results */}
        {selectedPartner && (
          <>
            {loading ? (
                <LoadingScreen height="10vh"/>
            ) : (
              <DataTable
                data={sales}
                columns={columns}
              />
            )}
          </>
        )}

      </div>
    </>
  );
}