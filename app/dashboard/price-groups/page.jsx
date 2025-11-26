'use client'

import useSWR from 'swr';
import BasicHeader from "@/components/BasicHeader";
import { Button } from "@/components/ui/button";
import CreatePriceGroupForm from "./create/CreatePriceGroupForm";
import { toast } from "sonner";
import { DataTable } from '@/components/ui/data-table';
import { useCallback } from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useEffect } from "react";
import TableLink from '@/components/ui/table-link';
import { fetcher } from '@/lib/utils';
import LoadingScreen from '@/components/LoadingScreen';


const columns = [
    {
        accessorKey: "name",
        header: "Име",
        cell: ({row}) => (
            <TableLink href={`/dashboard/price-groups/${row.original.id}`}>
                {row.original.name}
            </TableLink>
        )
    },
    {
        id: "actions",
        header: "Действия",
        cell: ({ row }) => row.original && row.original.id ? <DeleteButton id={row.original.id} /> : null,
    }
];

function DeleteButton({ id }) {
    const { mutate } = useSWR("/api/price-groups");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(10);

    // Start timer countdown when dialog opens
    useEffect(() => {
        let interval = null;
        if (open && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        if (!open) {
            setTimer(10); // reset timer when dialog closes
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [open, timer]);

    const handleDelete = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/price-groups/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Грешка при изтриване");
            }
            toast.success("Групата е изтрита успешно");
            mutate(); // refetch the list
            setOpen(false);
        } catch (err) {
            toast.error("Неуспешно изтриване");
        } finally {
            setLoading(false);
        }
    }, [id, mutate]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Изтрий
                </Button>
            </DialogTrigger>
            <DialogContent>
                <div>
                <DialogTitle className='mb-2'>Потвърждение за изтриване</DialogTitle>
                <DialogDescription>
                    Сигурни ли сте, че искате да изтриете тази ценова група? ВСИЧКИ цени ще бъдат изтрити. ВСИЧКО ще бъде изгубено. Това действие не може да бъде отменено. Имаш време да си помислиш...
                </DialogDescription>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Отказ
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        loading={loading}
                        disabled={timer > 0 || loading}
                    >
                        {timer > 0 ? `Изтрий (${timer})` : "Изтрий"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
export default function PriceGroupsPage() {
    const { data, error, isLoading, mutate: refetch } = useSWR("/api/price-groups", fetcher);

  if (error) return <>Error: {error}</>
    if (isLoading) return <><LoadingScreen /></>
    return (
        <>
            <BasicHeader
                title="Продуктови групи"
                subtitle="Продуктови групи за партньорите."
            >
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            Създай група
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Създай продуктова група
                        </DialogTitle>
                        <CreatePriceGroupForm  onSuccess={refetch}/>
                    </DialogContent>
                </Dialog>
            </BasicHeader>

            <DataTable
                searchKey={'name'}
                columns={columns}
                data={data}
            />
        </>
    );
}
