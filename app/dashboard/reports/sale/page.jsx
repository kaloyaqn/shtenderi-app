"use client";

import BasicHeader from "@/components/BasicHeader";
import LoadingScreen from "@/components/LoadingScreen";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import TableLink from "@/components/ui/table-link";
import ReportFilters from "@/components/filters/ReportFilters";
import useReportFilters from "@/hooks/useReportFilters";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function ReportsSale() {
  const {
    // Data
    stands, users, partners, products,
    
    // Filter states
    selectedStand, setSelectedStand,
    selectedUser, setSelectedUser,
    selectedPartner, setSelectedPartner,
    selectedProducts, setSelectedProducts,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    productType, setProductType,
    productName, setProductName,
    barcode, setBarcode,
    revisionType, setRevisionType,
    
    // Actions
    handleClear,
  } = useReportFilters();

  // Sales data
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Memoize the fetchSales function
  const fetchSales = useCallback(async () => {
    if (!searchParams) return;

    const stand = searchParams.get("stand");
    const user = searchParams.get("user");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const partner = searchParams.get("partnerId")
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const barcode = searchParams.get("barcode");
    const revisionType = searchParams.get("revisionType");
    const productBarcodes = searchParams.get("productBarcodes");
    const productName = searchParams.get("productName");

    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (stand) params.set("stand", stand);
      if (user) params.set("userId", user);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (partner) params.set("partnerId", partner);
      if (type) params.set("type", type);
      if (status) params.set("status", status);
      if (barcode) params.set("barcode", barcode);
      if (revisionType) params.set("revisionType", revisionType);
      // Prioritize product barcodes over manual barcode input
      if (productBarcodes) {
        params.set("barcode", productBarcodes);
      } else if (barcode) {
        params.set("barcode", barcode);
      }
      if (productName) params.set("productName", productName);

      const res = await fetch(`/api/reports/sales?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch Sales");

      const data = await res.json();

      // The API now returns data with type already added, so we can combine directly
      const combinedData = [
        ...data.missingProducts,
        ...data.refundProducts,
      ];
      setSales(combinedData);
    } catch (err) {
      console.error("error fetching sales", err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  function handleFormSubmit(e) {
    e.preventDefault();
    const filters = {
      stand: selectedStand,
      user: selectedUser,
      dateFrom: dateFrom,
      dateTo: dateTo,
      partner: selectedPartner,
      type: productType,
      barcode: barcode,
      revisionType: revisionType,
      productBarcodes: selectedProducts,
      productName: productName,
    };
    handleSearch(filters);
  }

  function handleSearch(filters) {
    const params = new URLSearchParams(searchParams);

    if (filters.stand && filters.stand.length > 0) {
      params.set("stand", filters.stand.join(','));
    } else {
      params.delete("stand");
    }

    if (filters.user && filters.user.length > 0) {
      params.set("user", filters.user.join(','));
    } else {
      params.delete("user");
    }

    if (filters.dateFrom && filters.dateFrom !== null) {
      const year = filters.dateFrom.getFullYear();
      const month = String(filters.dateFrom.getMonth() + 1).padStart(2, "0");
      const day = String(filters.dateFrom.getDate()).padStart(2, "0");
      params.set("dateFrom", `${year}-${month}-${day}`);
    } else {
      params.delete("dateFrom");
    }

    if (filters.dateTo && filters.dateTo !== null) {
      const year = filters.dateTo.getFullYear();
      const month = String(filters.dateTo.getMonth() + 1).padStart(2, "0");
      const day = String(filters.dateTo.getDate()).padStart(2, "0");
      params.set("dateTo", `${year}-${month}-${day}`);
    } else {
      params.delete("dateTo");
    }

    if (filters.partner && filters.partner.length > 0) {
        params.set("partnerId", filters.partner.join(','));
    } else {
        params.delete("partnerId")
    }

    if (filters.type && filters.type !== "") {
        params.set("type", filters.type)
    } else {
        params.delete("type")
    }

    if (filters.barcode && filters.barcode !== "") {
        params.set("barcode", filters.barcode)
    } else {
        params.delete("barcode")
    }

    if (filters.revisionType && filters.revisionType !== "") {
        params.set("revisionType", filters.revisionType)
    } else {
        params.delete("revisionType")
    }

    if (filters.productBarcodes && filters.productBarcodes.length > 0) {
        params.set("productBarcodes", filters.productBarcodes.join(','));
    } else {
        params.delete("productBarcodes")
    }

    if (filters.productName && filters.productName !== "") {
        params.set("productName", filters.productName)
    } else {
        params.delete("productName")
    }

    router.push(`/dashboard/reports/sale?${params.toString()}`);
  }

  const columns = [
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => {
        if (!row.original) return "-";
        const type = row.original.type;
        return (
          <Badge variant={type === "missing" ? "success" : "destructive"}>
            {type === "missing" ? "Продаден" : "Върнат"}
          </Badge>
        );
      },
    },
    {
        accessorKey: "revision.type",
        header: "Източник",
        cell: ({ row }) => {
            if (!row.original) return "-";
            const type = row.original.revision?.type;
            if (!type) return null;
            return (
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 border ${
                  type === "import"
                    ? "border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                {type === "import" ? "Импорт" : "Продажба"}
              </span>
            );
          },
    },
    {
      accessorKey: "product.name",
      header: "Продукт",
      cell: ({ row }) => {
        if (!row.original) return "-";
        return row.original.product?.name || "-";
      },
    },
    {
      accessorKey: "product.barcode",
      header: "Баркод",
      cell: ({ row }) => {
        if (!row.original) return "-";
        return row.original.product?.barcode || "-";
      },
    },
    {
      accessorKey: "missingQuantity",
      header: "Кол.",
      cell: ({ row }) => {
        if (!row.original) return "-";
        if (row.original.type === "missing") {
          return row.original.missingQuantity || 0;
        } else {
          return row.original.quantity || 0;
        }
      },
    },
    {
      accessorKey: "deliveryPrice",
      header: "Доставна",
      cell: ({row}) => {
        return row.original.product.deliveryPrice + "лв."
      }
    },
    {
      accessorKey: "revision.priceAtSale",
      header: "Продажна",
      cell: ({ row }) => {
        if (!row.original) return "-";
        let price;
        if (row.original.type === "missing") {
          price = row.original.priceAtSale;
        } else {
          price = row.original.priceAtRefund;
        }
        // If price is not found, try product.clientPrice
        if (!price && row.original.product && row.original.product.clientPrice) {
          price = row.original.product.clientPrice;
        }
        return price ? `${price.toFixed(2)} лв.` : "-";
      },
    },
    {
      accessorKey: "diff",
      header: "Разлика",
      cell: ({row}) => {
        let price;
        if (row.original.type === "missing") {
          price = row.original.priceAtSale;
        } else {
          price = row.original.priceAtRefund;
        }
        // If price is not found, try product.clientPrice
        if (!price && row.original.product && row.original.product.clientPrice) {
          price = row.original.product.clientPrice;
        }

        const diff = price - row.original.product.deliveryPrice;

        return diff.toFixed(2) + "лв."
      }

    },
    {
      accessorKey: "revision.createdAt",
      header: "Дата",
      cell: ({ row }) => {
        if (!row.original) return "-";
        const date =
          row.original.type === "missing"
            ? row.original.revision?.createdAt
            : row.original.refund?.createdAt;
        return date ? new Date(date).toLocaleString() : "-";
      },
    },
    {
      accessorKey: "user",
      header: "Потребител",
      cell: ({ row }) => {
        if (!row.original) return "-";
        const user =
          row.original.type === "missing"
            ? row.original.revision?.user
            : row.original.refund?.user;
        return user?.name || "-";
      },
    },
        {
      accessorKey: "partner",
      header: "Партньор",
      cell: ({ row }) => {
        if (!row.original) return "-";
        // Try to get partner from both possible sources
        let partner = null;

        // For missing type, partner is on revision
        if (row.original.type === "missing") {
          partner = row.original.revision?.partner;
        } else if (row.original.type === "refund") {
          // For refund type, partner is now directly on the refund product
          partner = row.original.partner;
        }

        if (partner && partner.id && partner.name) {
          return (
            <TableLink href={`/dashboard/partners/${partner.id}`}>
              {partner.name}
            </TableLink>
          );
        }

        return "-";
      },
    },
    {
      accessorKey: "source",
      header: "Източник",
      cell: ({ row }) => {
        if (!row.original) return "-";
        if (row.original.type === "missing") {
          const stand = row.original.revision?.stand;
          const storage = row.original.revision?.storage;
          if (storage) {
            return (
              <TableLink href={`/dashboard/storages/${storage.id}`}>
                {storage.name}
              </TableLink>
            );
          } else if (stand) {
            return (
              <TableLink href={`/dashboard/stands/${stand.id}`}>
                {stand.name}
              </TableLink>
            );
          }
        } else {
          // For refunds, use the sourceInfo that includes the actual stand/storage data
          const sourceInfo = row.original.sourceInfo;
          if (sourceInfo) {
            const isStand = row.original.refund?.sourceType === "STAND";
            const href = isStand
              ? `/dashboard/stands/${sourceInfo.id}`
              : `/dashboard/storages/${sourceInfo.id}`;

            return <TableLink href={href}>{sourceInfo.name}</TableLink>;
          }
        }
        return "-";
      },
    },
  ];

  return (
    <>
      <BasicHeader
        title={"Справка продажба"}
        subtitle={"Направи лесно справка за твоите продажби"}
      />

      {loading ? (
        <>
          <LoadingScreen />
        </>
      ) : (
        <>
            {!searchParams ? <>yokmu</> : <>
          <DataTable
            extraFilters={
              <ReportFilters
                // Date filters
                dateFrom={dateFrom}
                setDateFrom={setDateFrom}
                dateTo={dateTo}
                setDateTo={setDateTo}
                
                // Product filters
                products={products}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                productName={productName}
                setProductName={setProductName}
                
                // Type filters
                productType={productType}
                setProductType={setProductType}
                revisionType={revisionType}
                setRevisionType={setRevisionType}
                
                // Entity filters
                stands={stands}
                selectedStand={selectedStand}
                setSelectedStand={setSelectedStand}
                users={users}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                partners={partners}
                selectedPartner={selectedPartner}
                setSelectedPartner={setSelectedPartner}
                
                // Actions
                onSubmit={handleFormSubmit}
                onClear={handleClear}
              />
            }
            data={sales}
            columns={columns}
          />
            </>}
        </>
      )}
    </>
  );
}