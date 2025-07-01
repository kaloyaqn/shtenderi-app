'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import LoadingScreen from '@/components/LoadingScreen';

export default function StoreDetailPage({ params }) {
    const router = useRouter();
    const { storeId } = use(params);
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStore = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/stores/${storeId}`);
                if (!res.ok) throw new Error('Failed to fetch store');
                const data = await res.json();
                setStore(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (storeId) fetchStore();
    }, [storeId]);

    const columns = [
        {
            accessorKey: 'name',
            header: 'Име на щендер',
            cell: ({ row }) => {
                const stand = row.original;
                return (
                  <a
                    href={`/dashboard/stands/${stand.id}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {stand.name}
                  </a>
                );
            },
        },
        {
            accessorKey: '_count.standProducts',
            header: 'Брой продукти',
        },
    ];

    if (loading) return <LoadingScreen />;
    if (error) return <div className="text-red-500">Грешка: {error}</div>;
    if (!store) return <div>Магазинът не е намерен.</div>;

    return (
        <div className="container mx-auto py-10">

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{store.name || 'Без име'}</h1>
                <div className="text-muted-foreground mb-2">{store.address}</div>
                {store.contact && <div>Лице за контакт: {store.contact}</div>}
                {store.phone && <div>Телефон: {store.phone}</div>}
            </div>
            {store.partner && (
                <div className="mb-8 p-4 border rounded bg-muted">
                    <h2 className="text-lg font-semibold mb-2">Партньор</h2>
                    <div><span className="font-medium">Име:</span> {store.partner.name}</div>
                    {store.partner.bulstat && <div><span className="font-medium">Булстат:</span> {store.partner.bulstat}</div>}
                    {store.partner.contactPerson && <div><span className="font-medium">Лице за контакт:</span> {store.partner.contactPerson}</div>}
                    {store.partner.phone && <div><span className="font-medium">Телефон:</span> {store.partner.phone}</div>}
                </div>
            )}
            <h2 className="text-xl font-semibold mb-4">Щендери в магазина</h2>
            <DataTable
                columns={columns}
                data={store.stands || []}
                searchKey="name"
            />
        </div>
    );
} 