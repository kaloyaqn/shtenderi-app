'use client'

import BasicHeader from "@/components/BasicHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";

import TableLink from "@/components/ui/table-link";
import { IconEye } from "@tabler/icons-react";
import { useSession } from "@/lib/session-context";
import { accessedDynamicData } from "next/dist/server/app-render/dynamic-rendering";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ImportPage() {
    const [imports, setImports] = useState([]);
    const [loading, setLoading] = useState(true);
    const {data: session} = useSession();
  const router = useRouter();

    const userIsAdmin = session?.user?.role === "ADMIN";

    const fetchImports = async () => {
        try {
            const res = await fetch("/api/imports");
            console.log(res);
            if (!res.ok) {
                console.log(res);
                throw new Error("Грешка при зареждане на Импорти")
                return;
            }
            const data = await res.json();
            console.log(data)
            setImports(data);
        } catch (err) {
            toast.error("Грешка")
            throw new Error(err.message)
            return;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session) {
            fetchImports();
        }
    }, [session])

    
    const columns = [
        {
            accessorKey: 'fileName',
            header: "Файл"
        },
        {
            accessorKey: 'user.name',
            header: "Потребител"
        },
        {
            accessorKey: 'storage',
            header: "Склад",
            cell: ({ row }) => {
                const storage = row.original.storage;
                if (!storage || !storage.name) return null;
                return (
                    <TableLink href={`/dashboard/stands/${storage.id}`}>
                        {storage.name}
                    </TableLink>
                )
            }
        },
        {
            accessorKey: 'stand',
            header: "Щанд",
            cell: ({ row }) => {
                const stand = row.original.stand;
                if (!stand || !stand.name) return null;
                return (
                    <TableLink href={`/dashboard/stands/${stand.id}`}>
                        {stand.name}
                    </TableLink>
                )
            }
        },
        {
            accessorKey: 'createdAt',
            header: "Дата",
            cell: ({ row }) => {
                const date = row.original.createdAt;
                if (!date) return "-";
                return new Date(date).toLocaleString();
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
              <Button
                size="sm"
                variant="table"
                onClick={() => router.push(`/dashboard/imports/${row.original.id}`)}
              >
                <IconEye /> Виж
              </Button>
            ),
          },
    ]
    

    return (
        <>
            <BasicHeader title="Импорти"
            subtitle="Виж всички импорти в програмата."
            />

            <DataTable columns={columns} data={imports} searchKey='fileName' />
        </>
    )
}