'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Barcode, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StandDeliveryPage() {
    const { standId: destinationStandId } = useParams();
    const router = useRouter();

    // Data
    const [storages, setStorages] = useState([]);
    const [productsInStorage, setProductsInStorage] = useState([]);
    
    // Selections
    const [sourceStorageId, setSourceStorageId] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');

    // State
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Fetch storages
    useEffect(() => {
        fetch('/api/storages')
            .then(res => res.json())
            .then(setStorages)
            .catch(() => toast.error('Failed to fetch storages.'));
    }, []);

    const proceedToStepTwo = async () => {
        if (!sourceStorageId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/storages/${sourceStorageId}/products`);
            if (!res.ok) throw new Error('Failed to fetch products.');
            const data = await res.json();
            setProductsInSource(data);
            setStep(2);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBarcodeScanned = (e) => {
        if (e.key === 'Enter' && barcodeInput) {
            e.preventDefault();
            const productInSource = productsInSource.find(p => p.product.barcode === barcodeInput);

            if (!productInSource) {
                toast.error('Продукт с този баркод не е намерен в изходния склад.');
                setBarcodeInput('');
                return;
            }

            const existingProduct = selectedProducts.find(p => p.productId === productInSource.product.id);
            const currentQuantity = existingProduct?.quantity || 0;

            if (currentQuantity >= productInSource.quantity) {
                toast.warning(`Достигнато е максималното налично количество.`);
            } else {
                handleProductQuantityChange(productInSource.product.id, currentQuantity + 1);
            }
            setBarcodeInput('');
        }
    };

    const handleProductQuantityChange = (productId, newQuantity) => {
        const product = productsInSource.find(p => p.product.id === productId);
        if (!product) return;

        const qty = Math.max(0, Math.min(parseInt(newQuantity, 10) || 0, product.quantity));
        const existingIndex = selectedProducts.findIndex(p => p.productId === productId);
        
        if (qty === 0) {
            setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
        } else if (existingIndex > -1) {
            setSelectedProducts(prev => prev.map(p => p.productId === productId ? { ...p, quantity: qty } : p));
        } else {
            setSelectedProducts(prev => [...prev, {
                productId: product.product.id,
                name: product.product.name,
                barcode: product.product.barcode,
                quantity: qty,
                maxQuantity: product.quantity
            }]);
        }
    };
    
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                sourceStorageId,
                destinationStandId,
                products: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity })),
            };
            // Using the existing resupply endpoint which now creates a proper revision
            const res = await fetch('/api/resupply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
             if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to complete delivery.');
            }

            const revision = await res.json();
            toast.success(`Доставката е успешна! Създадена е ревизия №${revision.number}`);
            router.push(`/dashboard/revisions/${revision.id}`);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад
            </Button>
            
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Нова доставка към щанд</CardTitle>
                    <CardDescription>
                        {step === 1 
                            ? "Стъпка 1: Изберете от кой склад да заредите."
                            : "Стъпка 2: Изберете продукти за доставка."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <>
                            <div className="py-4">
                                <Select onValueChange={setSourceStorageId} value={sourceStorageId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Изберете склад..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {storages.map(storage => (
                                            <SelectItem key={storage.id} value={storage.id}>{storage.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={proceedToStepTwo} disabled={!sourceStorageId || loading}>
                                    {loading ? 'Зареждане...' : 'Напред'}
                                </Button>
                            </div>
                        </>
                    )}
                    {step === 2 && (
                        <>
                             <div className="relative my-4">
                                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Сканирайте баркод..."
                                    className="pl-10"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    onKeyDown={handleBarcodeScanned}
                                />
                            </div>
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto p-1">
                                {selectedProducts.length > 0 && <h3 className="text-sm font-medium text-gray-500 mb-2">Избрани продукти:</h3>}
                                {selectedProducts.map(p => (
                                    <div key={p.productId} className="flex items-center justify-between gap-4 p-2 border rounded-md">
                                        <div className="flex-grow">
                                            <p className="font-medium">{p.name}</p>
                                            <p className="text-xs text-gray-500">Наличност: {p.maxQuantity}</p>
                                        </div>
                                        <Input
                                            type="number"
                                            className="w-24"
                                            value={p.quantity}
                                            onChange={(e) => handleProductQuantityChange(p.productId, e.target.value)}
                                            max={p.maxQuantity}
                                            min={0}
                                        />
                                    </div>
                                ))}
                                {productsInSource.length === 0 && selectedProducts.length === 0 && (
                                    <p className="text-center text-gray-500">Няма налични продукти в този склад.</p>
                                )}
                            </div>
                            <div className="flex justify-between mt-4">
                                <Button variant="outline" onClick={() => setStep(1)}>Назад</Button>
                                <Button onClick={handleSubmit} disabled={loading || selectedProducts.length === 0}>
                                    {loading ? 'Запис...' : 'Създай доставка'}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 