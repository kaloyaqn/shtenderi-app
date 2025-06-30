'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function StorageTransferDialog({ open, onOpenChange, sourceStorageId, onTransferSuccess }) {
    const [step, setStep] = useState(1);
    
    // Data
    const [allStorages, setAllStorages] = useState([]);
    const [productsInSource, setProductsInSource] = useState([]);
    
    // Selections
    const [destinationStorageId, setDestinationStorageId] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]); // { productId, name, quantity, maxQuantity }

    // State
    const [loading, setLoading] = useState(false);

    // Fetch all storages for destination selection
    useEffect(() => {
        if (open) {
            fetch('/api/storages')
                .then(res => res.json())
                .then(data => {
                    // Filter out the source storage from the list of destinations
                    setAllStorages(data.filter(s => s.id !== sourceStorageId));
                })
                .catch(() => toast.error('Failed to fetch storages.'));
        }
    }, [open, sourceStorageId]);
    
    // Reset state on open/close
    useEffect(() => {
        if (open) {
            setStep(1);
            setSelectedProducts([]);
            setDestinationStorageId('');
        }
    }, [open]);

    // Fetch products from the source storage once a destination is chosen
    const handleDestinationSelect = async (destId) => {
        setDestinationStorageId(destId);
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
                destinationStorageId,
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
                <DialogTitle>Стъпка 1: Изберете склад-дестинация</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Select onValueChange={handleDestinationSelect} value={destinationStorageId}>
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
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Отказ</Button></DialogClose>
            </DialogFooter>
        </>
    );

    const renderStepTwo = () => (
        <>
            <DialogHeader>
                <DialogTitle>Стъпка 2: Изберете продукти за прехвърляне</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {productsInSource.length === 0 ? (
                    <p className="text-center text-gray-500">Няма налични продукти в този склад.</p>
                ) : productsInSource.map(p => (
                    <div key={p.product.id} className="flex items-center justify-between gap-4 p-2 border rounded-md">
                        <div className="flex-grow">
                            <p className="font-medium">{p.product.name}</p>
                            <p className="text-xs text-gray-500">Наличност: {p.quantity}</p>
                        </div>
                        <Input
                            type="number"
                            className="w-24"
                            placeholder="Бройка"
                            value={selectedProducts.find(sp => sp.productId === p.product.id)?.quantity || ''}
                            onChange={(e) => handleProductQuantityChange(p.product.id, e.target.value)}
                            max={p.quantity}
                            min={0}
                        />
                    </div>
                ))}
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