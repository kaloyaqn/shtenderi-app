"use client";

import BasicHeader from "@/components/BasicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import TableLink from "@/components/ui/table-link";
import { IconEye } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function ReportsSale() {
  const [stands, setStands] = useState([]);
  const [selectedStand, setSelectedStand] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [sales, setSales] = useState([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Memoize the fetchSales function
  const fetchSales = useCallback(async () => {
    const stand = searchParams.get("stand");
    const user = searchParams.get("user");

    try {
      const params = new URLSearchParams();
      if (stand) params.set("stand", stand);
      if (user) params.set("userId", user);

      const res = await fetch(`/api/reports/sales?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch Sales");

      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error("error fetching sales", err);
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
    
    if (standParam) {
      setSelectedStand(standParam);
    }
    
    if (userParam) {
      setSelectedUser(userParam);
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
    };
    handleSearch(filters);
  }

  const standOptions = [
    { value: "", label: "Всички щендери" },
    ...(stands.length > 0 ? stands.map((stand) => ({
      value: stand.id,
      label: stand.name,
    })) : [])
  ];

  const userOptions = [
    { value: "", label: "Всички потребители" },
    ...users.map((user) => ({
      value: user.id,
      label: user.name,
    }))
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

    router.push(`/dashboard/reports/sale?${params.toString()}`);
  }

  const columns = [
    {
      accessorKey: "number",
      header: "№",
      cell: ({ row }) => row.original.number,
    },
    {
      accessorKey: "source",
      header: "Източник",
      cell: ({ row }) => {
        const stand = row.original.stand;
        const storage = row.original.storage;
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
        } else {
          return <span className="text-gray-400">-</span>;
        }
      },
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => {
        const type = row.original.type;
        if (!type) return null;
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 border ${
              type === "import"
                ? "border-blue-400 text-blue-700"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {type === "import" ? "Импорт" : "Ръчно"}
          </span>
        );
      },
    },
    {
      accessorKey: "parnter",
      header: "Партньор",
      cell: ({ row }) => row.original.partner.name
    },
    {
      accessorKey: "userName",
      header: "Потребител",
      cell: ({ row }) => row.original.user.name

    },
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    // {
    //   accessorKey: "missingProducts",
    //   header: "кол.",
    //   cell: ({ row }) => row.original.missingProducts?.length || 0,
    // },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const type = row.original.status;
        if (!type) return null;

        let variant = "destructive";
        if (type === "PAID") {
          variant = "success";
        }
        return (
          <>
            <Badge variant={variant}>
              {type === "NOT_PAID" ? "Неплатена" : "Платена"}
            </Badge>
          </>
        );
      },
    },
    // {
    //   accessorKey: "invoiceNumber",
    //   header: "Фактура",
    //   cell: ({ row }) => {
    //     const invoice = invoices[row.original.number];
    //     return invoice ? (
    //       <TableLink href={`/dashboard/invoices/${invoice.id}`}>
    //         {invoice.invoiceNumber}
    //       </TableLink>
    //     ) : (
    //       "-"
    //     );
    //   },
    // },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="table"
          onClick={() => router.push(`/dashboard/revisions/${row.original.id}`)}
        >
          <IconEye /> Виж
        </Button>
      ),
    },
  ];

  return (
    <>
      <BasicHeader
        title={"Справка продажба"}
        subtitle={"Направи лесно справка за твоите продажби"}
      />



      <DataTable
      extraFilters={(
        < >
              <form className="flex md:flex-row flex-col gap-2 w-full items-end" onSubmit={handleFormSubmit}>

        <div>
            <Label className='mb-2'>
                Щендер
            </Label>
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
        <Label className='mb-2'>
            Потребител
        </Label>
        <Combobox
          options={userOptions}
          value={selectedUser}
          onValueChange={setSelectedUser}
          placeholder={"Избери потребител..."}
          emptyText="Няма намерени потребители..."
        />
        </div>

        <Button type="submit" >Търси</Button>
      </form>
        </>
      )}
      data={sales} columns={columns} />
    </>
  );
}

// da se pokazvat produktite ne prodajbite