'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Barcode, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StandTransferPage() {
    const { standId: sourceStandId } = useParams();
    const router = useRouter();

    // Data
    const [sourceStand, setSourceStand] = useState(null);
    const [partnerStands, setPartnerStands] = useState([]);
    const [productsInSource, setProductsInSource] = useState([]);
    
    // Selections
    const [destinationStandId, setDestinationStandId] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');

    // State
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Fetch source stand details and other stands from the same partner
    useEffect(() => {
        if (!sourceStandId) return;
        setLoading(true);
        fetch(`/api/stands/${sourceStandId}`)
            .then(res => res.json())
            .then(standData => {
                setSourceStand(standData);
                if (standData.partnerId) {
                    // Fetch all stands and filter by partnerId on the client
                    fetch('/api/stands')
                        .then(res => res.json())
                        .then(allStands => {
                            setPartnerStands(allStands.filter(s => s.partnerId === standData.partnerId && s.id !== sourceStandId));
                        });
                }
            })
            .catch(err => toast.error('Failed to fetch stand data.'))
            .finally(() => setLoading(false));
    }, [sourceStandId]);

    const proceedToStepTwo = async () => {
        if (!destinationStandId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/stands/${sourceStandId}/products`);
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
                toast.error('Продукт с този баркод не е намерен в изходния щанд.');
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
                sourceStandId,
                destinationStandId,
                products: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity })),
            };
            const res = await fetch('/api/stands/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to complete transfer.');
            }

            toast.success('Трансферът между щандове е успешен!');
            router.push(`/dashboard/stands/${sourceStandId}`);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !sourceStand) return <p>Зареждане...</p>;
    if (!sourceStand) return <p>Щандът не е намерен.</p>;

    return (
        <div className="container mx-auto py-10">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Назад
            </Button>
            
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Трансфер от щанд: {sourceStand.name}</CardTitle>
                    <CardDescription>
                        {step === 1 
                            ? "Стъпка 1: Изберете дестинация за прехвърляне."
                            : "Стъпка 2: Изберете продукти за прехвърляне."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <>
                            <div className="py-4">
                                <Select onValueChange={setDestinationStandId} value={destinationStandId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Изберете щанд..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {partnerStands.map(stand => (
                                            <SelectItem key={stand.id} value={stand.id}>{stand.name} - {stand.store?.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={proceedToStepTwo} disabled={!destinationStandId || loading}>
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
                                {productsInSource.length > 0 ? (
                                    <>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Продукти за трансфер:</h3>
                                        {productsInSource.map(p => {
                                            const selected = selectedProducts.find(sel => sel.productId === p.product.id);
                                            return (
                                                <div key={p.product.id} className="flex items-center justify-between gap-4 p-2 border rounded-md">
                                                    <div className="flex-grow">
                                                        <p className="font-medium">{p.product.name}</p>
                                                        <p className="text-xs text-gray-500">Баркод: {p.product.barcode}</p>
                                                        <p className="text-xs text-gray-500">Наличност: {p.quantity}</p>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        value={selected ? selected.quantity : ''}
                                                        placeholder="0"
                                                        onChange={e => handleProductQuantityChange(p.product.id, e.target.value)}
                                                        max={p.quantity}
                                                        min={0}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </>
                                ) : (
                                    <p className="text-center text-gray-500">Няма налични продукти в този щанд.</p>
                                )}
                            </div>
                            <div className="flex justify-between mt-4">
                                <Button variant="outline" onClick={() => setStep(1)}>Назад</Button>
                                <Button onClick={handleSubmit} disabled={loading || selectedProducts.length === 0}>
                                    {loading ? 'Запис...' : 'Прехвърли'}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 