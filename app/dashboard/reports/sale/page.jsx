"use client";

import BasicHeader from "@/components/BasicHeader";
import LoadingScreen from "@/components/LoadingScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DataTable } from "@/components/ui/data-table";
import DatePicker from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import TableLink from "@/components/ui/table-link";
import { IconEye } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function ReportsSale() {
  // stands
  const [stands, setStands] = useState([]);
  const [selectedStand, setSelectedStand] = useState("");
  //   Users
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  //   dates
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const [loading, setLoading] = useState(false);



  //   Sales
  const [sales, setSales] = useState([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Memoize the fetchSales function
  const fetchSales = useCallback(async () => {


    const stand = searchParams.get("stand");
    const user = searchParams.get("user");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo")

    setLoading(true)

    try {
      const params = new URLSearchParams();
      if (stand) params.set("stand", stand);
      if (user) params.set("userId", user);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      


      const res = await fetch(`/api/reports/sales?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch Sales");

      const data = await res.json();

      // Combine missing products and refund products into one array
      // Add a type field to distinguish between them
      const missingProductsWithType = data.missingProducts.map((item) => ({
        ...item,
        type: "missing",
      }));

      const refundProductsWithType = data.refundProducts.map((item) => ({
        ...item,
        type: "refund",
      }));

      const combinedData = [
        ...missingProductsWithType,
        ...refundProductsWithType,
      ];
      setSales(combinedData);
    } catch (err) {
      console.error("error fetching sales", err);
    } finally {
        setLoading(false)
    }

  }, [searchParams]);

  // Fetch stands and users once on mount
  useEffect(() => {
    fetchStands();
    fetchUsers();
  }, []);

  // Sync URL params with selected values
  useEffect(() => {
    const standParam = searchParams.get("stand");
    const userParam = searchParams.get("user");
    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");

    if (standParam) {
      setSelectedStand(standParam);
    }

    if (userParam) {
      setSelectedUser(userParam);
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
  }, [searchParams]);

  // Fetch sales only when searchParams actually change
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  function handleFormSubmit(e) {
    e.preventDefault();
    const filters = {
      stand: selectedStand,
      user: selectedUser,
      dateFrom: dateFrom,
      dateTo: dateTo
    };
    handleSearch(filters);
  }

  const standOptions = [
    { value: "", label: "Всички щендери" },
    ...(stands.length > 0
      ? stands.map((stand) => ({
          value: stand.id,
          label: stand.name,
        }))
      : []),
  ];

  const userOptions = [
    { value: "", label: "Всички потребители" },
    ...users.map((user) => ({
      value: user.id,
      label: user.name,
    })),
  ];

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

  function handleSearch(filters) {
    const params = new URLSearchParams(searchParams);

    if (filters.stand && filters.stand !== "") {
      params.set("stand", filters.stand);
    } else {
      params.delete("stand");
    }

    if (filters.user && filters.user !== "") {
      params.set("user", filters.user);
    } else {
      params.delete("user");
    }

    if (filters.dateFrom && filters.dateFrom !== null) {
        const year = filters.dateFrom.getFullYear();
        const month = String(filters.dateFrom.getMonth() + 1).padStart(2, '0');
        const day = String(filters.dateFrom.getDate()).padStart(2, '0');
        params.set("dateFrom", `${year}-${month}-${day}`);
    } else {
        params.delete("dateFrom")
    }

    if (filters.dateTo && filters.dateTo !== null) {
        const year = filters.dateTo.getFullYear();
        const month = String(filters.dateTo.getMonth() + 1).padStart(2, '0');
        const day = String(filters.dateTo.getDate()).padStart(2, '0');
        params.set("dateTo", `${year}-${month}-${day}`);
    } else {
        params.delete("dateTo")
    }


    router.push(`/dashboard/reports/sale?${params.toString()}`);
  }

  const columns = [
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant={type === "missing" ? "success" : "destructive"}>
            {type === "missing" ? "Продаден" : "Върнат"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "product.name",
      header: "Продукт",
      cell: ({ row }) => row.original.product?.name || "-",
    },
    {
      accessorKey: "product.barcode",
      header: "Баркод",
      cell: ({ row }) => row.original.product?.barcode || "-",
    },
    {
      accessorKey: "missingQuantity",
      header: "Количество",
      cell: ({ row }) => {
        if (row.original.type === "missing") {
          return row.original.missingQuantity || 0;
        } else {
          return row.original.quantity || 0;
        }
      },
    },
    {
      accessorKey: "priceAtSale",
      header: "Цена",
      cell: ({ row }) => {
        const price =
          row.original.type === "missing"
            ? row.original.priceAtSale
            : row.original.priceAtRefund;
        return price ? `${price.toFixed(2)} лв.` : "-";
      },
    },
    {
      accessorKey: "revision.createdAt",
      header: "Дата",
      cell: ({ row }) => {
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
        const user =
          row.original.type === "missing"
            ? row.original.revision?.user
            : row.original.refund?.user;
        return user?.name || "-";
      },
    },
    {
      accessorKey: "source",
      header: "Източник",
      cell: ({ row }) => {
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

      {loading ? <><LoadingScreen /></> : <>
      
        <DataTable
        extraFilters={
          <>
            <form
              className="flex md:flex-row flex-col gap-2 w-full items-end"
              onSubmit={handleFormSubmit}
            >
              <div>
                <Label className="mb-2">Щендер</Label>
                <Combobox
                  options={standOptions}
                  value={selectedStand}
                  onValueChange={setSelectedStand}
                  placeholder="Избери щендер..."
                  searchPlaceholder="Търси щендери..."
                  emptyText="Няма намерени щендери."
                />
              </div>

              <div>
                <Label className="mb-2">Потребител</Label>
                <Combobox
                  options={userOptions}
                  value={selectedUser}
                  onValueChange={setSelectedUser}
                  placeholder={"Избери потребител..."}
                  emptyText="Няма намерени потребители..."
                />
              </div>

              <div>
                <Label className="mb-2">Дата от</Label>
                <DatePicker setDate={setDateFrom} date={dateFrom} />
              </div>
              <div>
                <Label className="mb-2">Дата до</Label>
                <DatePicker setDate={setDateTo} date={dateTo} />
              </div>

              <Button type="submit">Търси</Button>
            </form>
          </>
        }
        data={sales}
        columns={columns}
      />
      </>}
    </>
  );
}
// da se pokazvat produktite ne prodajbite
