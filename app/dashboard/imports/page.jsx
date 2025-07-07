'use client'

import BasicHeader from "@/components/BasicHeader";
import { DataTable } from "@/components/ui/data-table";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ImportPage() {
    const [imports, setImports] = useState([]);
    const [loading, setLoading] = useState(true);
    const {data: session} = useSession();
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
        }
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