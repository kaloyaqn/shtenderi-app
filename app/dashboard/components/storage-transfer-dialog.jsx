'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Barcode } from 'lucide-react';

export default function StorageTransferDialog({ open, onOpenChange, sourceStorageId, onTransferSuccess }) {
    const [step, setStep] = useState(1);
    
    // Data
    const [allStorages, setAllStorages] = useState([]);
    const [allStands, setAllStands] = useState([]);
    const [productsInSource, setProductsInSource] = useState([]);
    
    // Selections
    const [destinationId, setDestinationId] = useState('');
    const [destinationType, setDestinationType] = useState('STORAGE');
    const [selectedProducts, setSelectedProducts] = useState([]); // { productId, name, quantity, maxQuantity }
    const [barcodeInput, setBarcodeInput] = useState('');

    // State
    const [loading, setLoading] = useState(false);

    // Fetch all storages and stands for destination selection
    useEffect(() => {
        if (open) {
            setLoading(true);
            Promise.all([
                fetch('/api/storages').then(res => res.json()),
                fetch('/api/stands').then(res => res.json())
            ]).then(([storagesData, standsData]) => {
                setAllStorages(storagesData.filter(s => s.id !== sourceStorageId));
                setAllStands(standsData);
            }).catch(() => toast.error('Failed to fetch destinations.'))
            .finally(() => setLoading(false));
        }
    }, [open, sourceStorageId]);
    
    // Reset state on open/close
    useEffect(() => {
        if (open) {
            setStep(1);
            setSelectedProducts([]);
            setDestinationId('');
            setDestinationType('STORAGE');
            setBarcodeInput('');
        }
    }, [open]);

    const handleDestinationChange = (destId) => {
        setDestinationId(destId);
    };

    const proceedToStepTwo = async () => {
        if (!destinationId || !destinationType) return;
        
        setLoading(true);
        try {
            const res = await fetch(`/api/storages/${sourceStorageId}/products`);
            if (!res.ok) throw new Error('Failed to fetch products from the source storage.');
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
                toast.warning(`Достигнато е максималното налично количество за ${productInSource.product.name}.`);
            } else {
                handleProductQuantityChange(productInSource.product.id, currentQuantity + 1);
            }
            setBarcodeInput('');
        }
    };

    const handleProductQuantityChange = (productId, newQuantity) => {
        const product = productsInSource.find(p => p.product.id === productId);
        if (!product) return;

        const existingIndex = selectedProducts.findIndex(p => p.productId === productId);
        const qty = Math.max(0, Math.min(parseInt(newQuantity, 10) || 0, product.quantity));
        
        if (qty === 0) {
            setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
        } else if (existingIndex > -1) {
            const updated = [...selectedProducts];
            updated[existingIndex].quantity = qty;
            setSelectedProducts(updated);
        } else {
            setSelectedProducts(prev => [...prev, {
                productId: product.product.id,
                name: product.product.name,
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
                destinationId,
                destinationType,
                products: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity })),
            };
            const res = await fetch('/api/storages/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to complete transfer.');
            }

            toast.success('Transfer successful!');
            if (onTransferSuccess) onTransferSuccess();
            onOpenChange(false);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepOne = () => (
        <>
            <DialogHeader>
                <DialogTitle>Стъпка 1: Изберете дестинация</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="STORAGE" className="w-full" onValueChange={(val) => {
                setDestinationType(val);
                setDestinationId('');
            }}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="STORAGE">Склад</TabsTrigger>
                    <TabsTrigger value="STAND">Щанд</TabsTrigger>
                </TabsList>
                <TabsContent value="STORAGE">
                    <div className="py-4">
                        <Select onValueChange={handleDestinationChange} value={destinationId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Изберете склад..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allStorages.map(storage => (
                                    <SelectItem key={storage.id} value={storage.id}>{storage.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>
                <TabsContent value="STAND">
                     <div className="py-4">
                        <Select onValueChange={handleDestinationChange} value={destinationId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Изберете щанд..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allStands.map(stand => (
                                    <SelectItem key={stand.id} value={stand.id}>{stand.name} - {stand.store?.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>
            </Tabs>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Отказ</Button></DialogClose>
                <Button onClick={proceedToStepTwo} disabled={!destinationId || loading}>
                    {loading ? 'Зареждане...' : 'Напред'}
                </Button>
            </DialogFooter>
        </>
    );

    const renderStepTwo = () => (
        <>
            <DialogHeader>
                <DialogTitle>Стъпка 2: Изберете продукти за прехвърляне</DialogTitle>
            </DialogHeader>
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
            <div className="py-4 space-y-2 max-h-[50vh] overflow-y-auto">
                {selectedProducts.length > 0 && (
                     <h3 className="text-sm font-medium text-gray-500 mb-2">Избрани продукти:</h3>
                )}
                {selectedProducts.map(p => {
                    const productInSource = productsInSource.find(src => src.product.id === p.productId);
                    return (
                        <div key={p.productId} className="flex items-center justify-between gap-4 p-2 border rounded-md">
                            <div className="flex-grow">
                                <p className="font-medium">{p.name}</p>
                                <p className="text-xs text-gray-500">Наличност: {productInSource?.quantity || 'N/A'}</p>
                            </div>
                            <Input
                                type="number"
                                className="w-24"
                                placeholder="Бройка"
                                value={p.quantity}
                                onChange={(e) => handleProductQuantityChange(p.productId, e.target.value)}
                                max={p.maxQuantity}
                                min={0}
                            />
                        </div>
                    )
                })}
                {productsInSource.length === 0 && selectedProducts.length === 0 && (
                    <p className="text-center text-gray-500">Няма налични продукти в този склад.</p>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setStep(1)}>Назад</Button>
                <Button onClick={handleSubmit} disabled={loading || selectedProducts.length === 0}>
                    {loading ? 'Запис...' : 'Прехвърли'}
                </Button>
            </DialogFooter>
        </>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {step === 1 && renderStepOne()}
                {step === 2 && renderStepTwo()}
            </DialogContent>
        </Dialog>
    );
} 