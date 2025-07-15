'use client'

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import TableLink from "@/components/ui/table-link";
import { Eye } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react"

export default function ChecksPage() {
    const [checks, setChecks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const {data: session} = useSession();

    async function fetchChecks() {
        try {
            const res = await fetch('/api/checks');
            if (!res.ok) {
                throw new Error("Failed to fetch checks");
                return;
            }
            const data = await res.json();
            setChecks(data);
        }
        catch(err) {
            toast.error("Грешка при зареждане на проверките.")
            console.error(err);
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchChecks();
    },  [session])

    const columns = [
        {
            accessorKey: "id",
            header: "№",
            cell: ({ row, table }) => {
                // Try to show a sequential number (row index + 1)
                // Or, if your check model has a "number" field, use that
                if (typeof row.original.number !== "undefined") {
                    return row.original.number;
                }
                // fallback: show row index + 1
                return (row.index + 1);
            },
        },
        {
            accessorKey: 'stand',
            header: 'Щендер',
            cell: ({ row }) => (
                <TableLink href={`/dashboard/stands/${row.original.stand.id}`}>
                    {row.original.stand?.name || "-"}
                </TableLink>
            ),
        },

        {
            accessorKey: 'createdAt',
            header: "Дата",
            cell: ({row}) => (
                <span>
                    {new Date(row.original.createdAt).toLocaleString('BG-bg')}
                </span>
            )
        },
        {
            accessorKey: 'user.name',
            header: 'Потребител'
        },
        {
            accessorKey: 'actions',
            header: 'Действие',
            cell: ({ row }) => (
                <Link href={`/dashboard/checks/${row.original.id}`}>
                                    <Button variant={'table'}>
                 <Eye />   Виж
                </Button>
                </Link>
            ),
        },

    ]

    return (
        <>
            checkirane

            <DataTable columns={columns} data={checks} />
        </>
    )
}