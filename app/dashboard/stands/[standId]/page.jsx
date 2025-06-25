'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Plus, Pencil, Trash2, Upload } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
// We will create this component next
import AddProductToStandDialog from './_components/add-product-dialog'
import EditQuantityDialog from './_components/edit-quantity-dialog'
import { XMLParser } from "fast-xml-parser"
import { toast } from 'sonner'
import Link from 'next/link'

export default function StandDetailPage({ params }) {
    const router = useRouter();
    const { standId } = use(params);
    const [stand, setStand] = useState(null);
    const [productsOnStand, setProductsOnStand] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [importError, setImportError] = useState(null);
    const fileInputRef = useRef();
    
    // Dialog states
    const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productOnStandToEdit, setProductOnStandToEdit] = useState(null);
    const [productOnStandToDelete, setProductOnStandToDelete] = useState(null);


    const fetchData = async () => {
        setLoading(true);
        try {
            const [standRes, productsRes] = await Promise.all([
                fetch(`/api/stands/${standId}`),
                fetch(`/api/stands/${standId}/products`)
            ]);

            if (!standRes.ok) throw new Error('Failed to fetch stand details');
            if (!productsRes.ok) throw new Error('Failed to fetch products on stand');

            const standData = await standRes.json();
            const productsData = await productsRes.json();
            
            setStand(standData);
            setProductsOnStand(productsData);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (standId) {
            fetchData();
        }
    }, [standId]);

    const handleDelete = async () => {
        if (!productOnStandToDelete) return;

        try {
            const response = await fetch(`/api/stands/${standId}/products/${productOnStandToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove product');
            }
            fetchData(); // Refresh data
        } catch (err) {
            console.error('Error removing product:', err);
            setError(err.message);
        } finally {
            setDeleteDialogOpen(false);
            setProductOnStandToDelete(null);
        }
    };
    
    const columns = [
        {
            accessorKey: 'product.name',
            header: 'Продукт',
        },
        {
            accessorKey: 'product.barcode',
            header: 'Баркод',
        },
        {
            accessorKey: 'product.pcd',
            header: 'ПЦД',
        },
        {
            accessorKey: 'product.quantity',
            header: 'Общо количество',
        },
        {
            accessorKey: 'quantity',
            header: 'Количество на щанда',
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const standProduct = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                            setProductOnStandToEdit(standProduct);
                            setEditDialogOpen(true);
                        }}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                            setProductOnStandToDelete(standProduct);
                            setDeleteDialogOpen(true);
                        }}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        setImportError(null);
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parser = new XMLParser();
            const xml = parser.parse(text);
            const goods = xml.info?.goods?.good || [];
            const products = Array.isArray(goods) ? goods : [goods];
            
            const mapped = products.map(good => ({
                barcode: String(good.barcode),
                quantity: Number(good.quantity),
                name: good.name,
                clientPrice: parseFloat(good.price) || 0
            })).filter(p => p.barcode && !isNaN(p.quantity));

            await toast.promise(
                (async () => {
                    const response = await fetch(`/api/stands/${standId}/import-xml`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ products: mapped })
                    });

                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.error || 'Import failed');
                    }
                    await fetchData();
                })(),
                {
                    loading: 'Импортиране... Моля, изчакайте',
                    success: 'Импортирането е успешно!',
                    error: (err) => err.message || 'Възникна грешка при импортиране',
                }
            );
        } catch (err) {
            setImportError(err.message);
        } finally {
            e.target.value = '';
        }
    };

    if (loading) return <div>Зареждане...</div>;
    if (error) return <div className="text-red-500">Грешка: {error}</div>;
    if (!stand) return <div>Щандът не е намерен.</div>

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{stand.name}</h1>
                    <p className="text-muted-foreground">Управление на продуктите на щанда</p>
                </div>

                <div className='flex gap-2 '>
                
                <div className="flex gap-2 mb-4">
                <Link href={`${standId}/revision`}>
                <Button variant="outline">
                    Ревизия
                </Button>
                </Link>
                <Button variant="outline" onClick={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Импортирай продукти от XML
                </Button>
                <input
                    type="file"
                    accept=".xml"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>
                <Button onClick={() => setAddProductDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добави продукт
                </Button>
                </div>
            </div>
            
            <DataTable
                columns={columns}
                data={productsOnStand}
                searchKey="product.name"
            />

            <AddProductToStandDialog
                open={addProductDialogOpen}
                onOpenChange={setAddProductDialogOpen}
                standId={standId}
                onProductAdded={fetchData}
                productsOnStand={productsOnStand}
            />

            <EditQuantityDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                standProduct={productOnStandToEdit}
                onProductUpdated={fetchData}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Премахване на продукт</AlertDialogTitle>
                        <AlertDialogDescription>
                            Сигурни ли сте, че искате да премахнете {productOnStandToDelete?.product.name} от този щанд?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отказ</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Премахни</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {importError && <div className="text-red-500 mb-4">{importError}</div>}
        </div>
    )
} 