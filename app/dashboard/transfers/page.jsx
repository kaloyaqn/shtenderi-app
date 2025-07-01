'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import BasicHeader from '@/components/BasicHeader';
import { Eye } from 'lucide-react';

export default function TransfersPage() {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTransfers = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/transfers');
                if (!response.ok) {
                    throw new Error('Failed to fetch transfers');
                }
                const data = await response.json();
                setTransfers(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTransfers();
    }, []);

    const columns = [
        {
            accessorKey: 'createdAt',
            header: 'Дата',
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('bg-BG'),
        },
        {
            accessorKey: 'sourceStorageName',
            header: 'От склад',
        },
        {
            accessorKey: 'destinationStorageName',
            header: 'За склад',
        },
        {
            accessorKey: 'user.name',
            header: 'Потребител',
            cell: ({ row }) => row.original.user?.name || row.original.user?.email || 'N/A',
        },
        {
            accessorKey: 'status',
            header: 'Статус',
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant={status === 'COMPLETED' ? 'success' : 'secondary'}>
                        {status === 'COMPLETED' ? 'Завършен' : 'Чакащ'}
                    </Badge>
                )
            }
        },
        {
            accessorKey: 'products',
            header: 'Продукти',
            cell: ({ row }) => <Badge variant="secondary">{row.original.products.length}</Badge>,
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button 
                    variant="table" 
                    onClick={() => router.push(`/dashboard/transfers/${row.original.id}`)}
                >
                 <Eye />   Виж
                </Button>
            ),
        }
    ];

    return (
        <div className="">
            <BasicHeader 
            title={'Премествания между складове'}
            subtitle={"Управлявай преместванията между складовете"}
            />
                    <DataTable
                        columns={columns}
                        data={transfers}
                        loading={loading}
                    />
        </div>
    );
}