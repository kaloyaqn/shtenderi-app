"use client";

import BasicHeader from "@/components/BasicHeader";
import LoadingScreen from "@/components/LoadingScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DataTable } from "@/components/ui/data-table";
import DatePicker from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TableLink from "@/components/ui/table-link";
import { IconClearAll, IconClearFormatting, IconEye } from "@tabler/icons-react";
import { Filter, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { setTyped } from "pdfkit/js/pdfkit.standalone";
import { useEffect, useState, useCallback } from "react";

export default function ReportsSale() {
  // stands
  const [stands, setStands] = useState([]);
  const [selectedStand, setSelectedStand] = useState([]);
  //   Users
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  //   Partners
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState([]);
//     Products
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  //   dates
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  //   Payment status
  const [paymentStatus, setPaymentStatus] = useState("");
  //   Product type
  const [productType, setProductType] = useState("");
  //   Barcode
  const [barcode, setBarcode] = useState("");
  //   Product name
  const [productName, setProductName] = useState("");
  //   Revision type
  const [revisionType, setRevisionType] = useState("");
  //   Sales
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

  async function fetchStands() {
    if (stands.length > 0) return;
    try {
      const res = await fetch("/api/stands");
      if (!res.ok) throw new Error("error");
      const data = await res.json();
      setStands(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUsers() {
    if (users.length > 0) return;
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchPartners() {
    if (partners.length > 0) return;
    try {
        const res = await fetch("/api/partners");
        if (!res.ok) throw new Error("Failed to fetch partners");
        const data = await res.json();
        setPartners(data);
    } catch (err) {
        console.error(err)
    }
  }

    async function fetchProducts() {
        if (products.length > 0) return;
        try {
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err)
        }

    }


  function handleClear() {
    // This only resets the URL, but does not clear the form state.
    // To fully clear, also reset all filter states:
    router.replace('/dashboard/reports/sale', { shallow: true });
    setSelectedStand([]);
    setSelectedUser([]);
    setDateFrom(null);
    setDateTo(null);
    setSelectedPartner([]);
    setSelectedProducts([]);
    setProductType('');
    setBarcode('');
    setProductName('');
    setRevisionType('');
  }


  // Fetch stands and users once on mount
  useEffect(() => {
    fetchStands();
    fetchUsers();
    fetchPartners();
    fetchProducts();
  }, []);
  

  // Sync URL params with selected values
  useEffect(() => {
    const standParam = searchParams.get("stand");
    const userParam = searchParams.get("user");
    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");
    const partnerId = searchParams.get("partnerId")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const barcodeParam = searchParams.get("barcode")
    const revisionTypeParam = searchParams.get("revisionType")
    const productBarcodesParam = searchParams.get("productBarcodes")
    const productNameParam = searchParams.get("productName")

    if (standParam) {
      // Handle comma-separated values for MultiCombobox
      const standValues = standParam.split(',').filter(v => v.trim() !== '');
      setSelectedStand(standValues);
    } else {
      setSelectedStand([]);
    }

    if (userParam) {
      // Handle comma-separated values for MultiCombobox
      const userValues = userParam.split(',').filter(v => v.trim() !== '');
      setSelectedUser(userValues);
    } else {
      setSelectedUser([]);
    }

    if (dateFromParam) {
      setDateFrom(new Date(dateFromParam));
    } else {
      setDateFrom(null);
    }

    if (dateToParam) {
      setDateTo(new Date(dateToParam));
    } else {
      setDateTo(null);
    }

    if (partnerId) {
      // Handle comma-separated values for MultiCombobox
      const partnerValues = partnerId.split(',').filter(v => v.trim() !== '');
      setSelectedPartner(partnerValues);
    } else {
      setSelectedPartner([]);
    }

    if (type) {
        setProductType(type)
    } 

    if (status) {
        setPaymentStatus(status)
    }

    if (barcodeParam) {
        setBarcode(barcodeParam)
    }

    if (revisionTypeParam) {
        setRevisionType(revisionTypeParam)
    }

    if (productBarcodesParam) {
        // Handle comma-separated values for product MultiCombobox
        const productBarcodeValues = productBarcodesParam.split(',').filter(v => v.trim() !== '');
        setSelectedProducts(productBarcodeValues);
    } else {
        setSelectedProducts([]);
    }

    if (productNameParam) {
        setProductName(productNameParam)
    }

  }, [searchParams]);

  useEffect(() => {
    fetchSales();
  }, [searchParams]);

  function handleFormSubmit(e) {
    e.preventDefault();
    const filters = {
      stand: selectedStand,
      user: selectedUser,
      dateFrom: dateFrom,
      dateTo: dateTo,
      partner: selectedPartner,
      type: productType,
      status: paymentStatus,
      barcode: barcode,
      revisionType: revisionType,
      productBarcodes: selectedProducts,
      productName: productName,
    };
    handleSearch(filters);
  }

  const standOptions = [
    ...(stands.length > 0
      ? stands.map((stand) => ({
          value: stand.id,
          label: stand.name,
        }))
      : []),
  ];

  const userOptions = [
    ...users.map((user) => ({
      value: user.id,
      label: user.name,
    })),
  ];

  const partnerOptions = [
    ...partners.map((partner) => ({
        value: partner.id,
        label: partner.name,
      })),
  ]

  const productOptions = [
    ...products.map((product) => ({
        value: product.barcode,
        label: product.name,
      })),  ]

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

    if (filters.status && filters.status !== "") {
        params.set("status", filters.status)
    } else {
        params.delete("status")
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
      accessorKey: "revision.priceAtSale",
      header: "Цена",
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
              <>
                <form
                  className="flex flex-col gap-4 w-full"
                  onSubmit={handleFormSubmit}
                >
                  {/* Дата */}
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="w-full">
                      <Label className="mb-2">Дата от</Label>
                      <DatePicker setDate={setDateFrom} date={dateFrom} className="w-full" triggerClassName="w-full" />
                    </div>
                    <div className="w-full">
                      <Label className="mb-2">Дата до</Label>
                      <DatePicker setDate={setDateTo} date={dateTo} className="w-full" triggerClassName="w-full" />
                    </div>
                  </div>

                  {/* Продукт */}
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="w-full">
                      <Label className="mb-2">Продукти</Label>
                      <MultiCombobox
                        options={productOptions}
                        value={selectedProducts}
                        onValueChange={setSelectedProducts}
                        placeholder={"Избери продукти..."}
                        emptyText="Няма намерени продукти..."
                        className="w-full"
                        triggerClassName="w-full"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="mb-2">Име на продукт</Label>
                      <Input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Въведи част от името на продукта..."
                        className="w-full"
                      />
                    </div>
                    {/* <div className="w-full">
                      <Label className="mb-2">Баркод</Label>
                      <Input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Въведи баркод(и) разделени със запетая..."
                        className="w-full"
                      />
                    </div> */}
                  </div>

                  {/* Тип */}
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="w-full">
                      <Label className={'mb-2'}>Тип</Label>
                      <Select value={productType} onValueChange={setProductType}>
                        <SelectTrigger className="w-full">
                          {productType
                            ? (productType === "missing" ? "Продадени" : "Върнати")
                            : "Избери тип"}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="missing">Продадени</SelectItem>
                          <SelectItem value="refund">Върнати</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full">
                      <Label className="mb-2">Източник</Label>
                      <Select value={revisionType} onValueChange={setRevisionType}>
                        <SelectTrigger className="w-full">
                          {revisionType
                            ? (revisionType === "import" ? "Импорт" : "Продажба")
                            : "Избери тип"}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="import">Импорт</SelectItem>
                          <SelectItem value="manual">Продажба</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Партньор, Щендер, Потребител */}
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="w-full">
                      <Label className="mb-2">Партньори</Label>
                      <MultiCombobox
                        options={partnerOptions}
                        value={selectedPartner}
                        onValueChange={setSelectedPartner}
                        placeholder={"Избери партньор..."}
                        emptyText="Няма намерени партньори..."
                        className="w-full"
                        triggerClassName="w-full"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="mb-2">Щендер</Label>
                      <MultiCombobox
                        options={standOptions}
                        value={selectedStand}
                        onValueChange={setSelectedStand}
                        placeholder="Избери щендер..."
                        searchPlaceholder="Търси щендери..."
                        emptyText="Няма намерени щендери."
                        className="w-full"
                        triggerClassName="w-full"
                      />
                    </div>
                    <div className="w-full">
                      <Label className="mb-2">Потребител</Label>
                      <MultiCombobox
                        options={userOptions}
                        value={selectedUser}
                        onValueChange={setSelectedUser}
                        placeholder={"Избери потребител..."}
                        emptyText="Няма намерени потребители..."
                        className="w-full"
                        triggerClassName="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <Button type="submit" className="w-full md:w-auto flex-1">
                      <Filter />
                      Търси
                    </Button>
                    <Button variant={'outline'} onClick={handleClear} className="w-full md:w-auto flex-1">
                      <X />
                      Изчисти
                    </Button>
                  </div>
                </form>
              </>
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