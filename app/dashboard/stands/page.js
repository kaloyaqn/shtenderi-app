'use client'

import { DataTable } from "@/components/ui/data-table";
import { useEffect, useState } from "react"

export default function Stands() {
    const [stands, setStands] = useState([]);

    const fetchStands = async () => {
        try {
            const res = await fetch("/api/stands")
            if (!res.ok) throw new Error('Failed to fetch stands')
            const stands = await res.json();
            setStands(stands);
        } catch (err) {
            console.error('Error fetching stands', err);
        } 
    }

    useEffect(() => {
        fetchStands();
    })

    const columns = [
        {
            accessorKey: 'name',
            header: 'Име на щендер'
        }
    ]
    return (
        <>
            <DataTable 
            columns={columns}
            data={stands}
            />
        </>
    )
}