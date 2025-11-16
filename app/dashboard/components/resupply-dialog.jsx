'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog, ResponsiveDialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSession } from '@/lib/session-context';
import { Barcode } from 'lucide-react';

export default function ResupplyDialog({ open, onOpenChange, standId, storageId: initialStorageId, onResupplySuccess }) {
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    
    // Data
    const [storages, setStorages] = useState([]);
    const [stands, setStands] = useState([]);
    const [productsInStorage, setProductsInStorage] = useState([]);
    
    // Selections
    const [sourceStorageId, setSourceStorageId] = useState(initialStorageId || '');
    const [destinationStandId, setDestinationStandId] = useState(standId || '');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');

    // State
    const [loading, setLoading] = useState(false);

    // Effect to initialize the dialog based on context
    useEffect(() => {
        if (open) {
            // Reset common state
            setStep(1);
            setSelectedProducts([]);
            setBarcodeInput('');
            const isFromStorage = !!initialStorageId;

            setSourceStorageId(initialStorageId || '');
            setDestinationStandId(standId || '');

            if (isFromStorage) {
                // Launched from Storage page: need to select a Stand
                fetch('/api/stands').then(res => res.json()).then(setStands).catch(() => toast.error('Failed to fetch stands'));
            } else {
                // Launched from Stand page: need to select a Storage
                fetch('/api/storages').then(res => res.json()).then(setStorages).catch(() => toast.error('Failed to fetch storages'));
            }
        }
    }, [open, initialStorageId, standId]);

    // Fetch products when the final piece of info for step 1 is known
    const fetchProductsForStep2 = async (storage, stand) => {
        if (!storage || !stand) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/storages/${storage}/products`);
            if (!res.ok) throw new Error('Failed to fetch products for this storage.');
            const data = await res.json();
            setProductsInStorage(data);
            setStep(2);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }
    
    const handleStorageSelect = (storageId) => {
        setSourceStorageId(storageId);
        fetchProductsForStep2(storageId, destinationStandId);
    };

    const handleStandSelect = (standId) => {
        setDestinationStandId(standId);
        fetchProductsForStep2(sourceStorageId, standId);
    }
    
    const handleBarcodeScanned = (e) => {
        if (e.key === 'Enter' && barcodeInput) {
            e.preventDefault();
            const productInSource = productsInStorage.find(p => p.product.barcode === barcodeInput);

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
                handleProductQuantityChange(productInSource.product.id, String(currentQuantity + 1));
            }
            setBarcodeInput('');
        }
    };

    const handleProductQuantityChange = (productId, newQuantity) => {
        const product = productsInStorage.find(p => p.product.id === productId);
        if (!product) return;

        const existingIndex = selectedProducts.findIndex(p => p.productId === productId);
        const qty = Math.max(0, Math.min(parseInt(newQuantity, 10) || 0, product.quantity));
        
        if (qty === 0) {
            setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
            return;
        }

        if (existingIndex > -1) {
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
                destinationStandId,
                products: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity })),
            };
            const res = await fetch('/api/resupply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to complete resupply.');
            }

            toast.success('Resupply successful!');
            if (onResupplySuccess) onResupplySuccess();
            onOpenChange(false);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStepOne = () => {
        const isFromStorage = !!initialStorageId;
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Стъпка 1: {isFromStorage ? 'Изберете щанд-дестинация' : 'Изберете склад-източник'}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {isFromStorage ? (
                         <Select onValueChange={handleStandSelect} value={destinationStandId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Изберете щанд..." />
                            </SelectTrigger>
                            <SelectContent>
                                {stands.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Select onValueChange={handleStorageSelect} value={sourceStorageId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Изберете склад..." />
                            </SelectTrigger>
                            <SelectContent>
                                {storages.map(storage => (
                                    <SelectItem key={storage.id} value={storage.id}>{storage.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Отказ</Button></DialogClose>
                </DialogFooter>
            </>
        )
    };

    const renderStepTwo = () => (
        <>
            <DialogHeader>
                <DialogTitle>Стъпка 2: Изберете продукти и количества</DialogTitle>
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
                {productsInStorage.length === 0 ? (
                    <p className="text-center text-gray-500">Няма налични продукти в този склад.</p>
                ) : productsInStorage.map(p => (
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
                <Button variant="outline" onClick={() => { setStep(1); setSelectedProducts([]); }}>Назад</Button>
                <Button onClick={handleSubmit} disabled={loading || selectedProducts.length === 0}>
                    {loading ? 'Запис...' : 'Потвърди'}
                </Button>
            </DialogFooter>
        </>
    );

    return (
        <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
            <ResponsiveDialogContent>
                {step === 1 && renderStepOne()}
                {step === 2 && renderStepTwo()}
            </ResponsiveDialogContent>
        </ResponsiveDialog>
    );
} 