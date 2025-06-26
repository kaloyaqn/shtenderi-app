'use client'

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';

export default function AddProductToStandDialog({ open, onOpenChange, standId, onProductAdded, productsOnStand = [] }) {
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (open) {
            const fetchProducts = async () => {
                try {
                    const res = await fetch('/api/products');
                    if (!res.ok) throw new Error('Failed to fetch products');
                    const data = await res.json();
                    setAllProducts(data);
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchProducts();
        }
    }, [open]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSearch(product.name);
    }

    // Calculate max allowed for the selected product
    let maxAllowed = null;
    if (selectedProduct) {
        const assigned = selectedProduct.standProducts?.reduce((sum, sp) => sum + sp.quantity, 0) || 0;
        maxAllowed = selectedProduct.quantity - assigned;
    }

    const handleSubmit = async () => {
        if (!selectedProduct || !quantity) {
            setError('Please select a product and enter a quantity.');
            return;
        }
        if (maxAllowed !== null && parseInt(quantity, 10) > maxAllowed) {
            setError(`Нямате достатъчно наличност. Оставащи: ${maxAllowed}`);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/stands/${standId}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    quantity: parseInt(quantity, 10),
                }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to add product');
            }
            onProductAdded(); // Callback to refresh the parent list
            handleClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleClose = () => {
        onOpenChange(false);
        setSelectedProduct(null);
        setQuantity(1);
        setError(null);
        setSearch('');
    };

    const productsOnStandIds = new Set(productsOnStand.map(p => p.productId));
    const availableProducts = allProducts.filter(p => !productsOnStandIds.has(p.id));

    const filteredProducts = search
        ? availableProducts.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
        )
        : availableProducts;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Добави продукт към щанда</DialogTitle>
                    <DialogDescription>
                        Изберете продукт от каталога и въведете количество.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-1.5">
                        <Label htmlFor="product">Продукт</Label>
                        <Command>
                            <CommandInput 
                                placeholder="Търсене на продукт..." 
                                value={search}
                                onValueChange={setSearch}
                            />
                            <CommandList>
                                <CommandEmpty>Няма намерени продукти.</CommandEmpty>
                                {filteredProducts.map((product) => (
                                    <CommandItem
                                        key={product.id}
                                        value={product.name + ' ' + product.barcode}
                                        onSelect={() => handleSelectProduct(product)}
                                    >
                                        {product.name} <span className="text-xs text-muted-foreground">({product.barcode})</span>
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </Command>
                    </div>
                    <div className="grid items-center gap-1.5">
                        <Label htmlFor="quantity">Количество</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            max={maxAllowed !== null ? maxAllowed : undefined}
                        />
                        {selectedProduct && (
                            <span className="text-xs text-muted-foreground">Оставащи: {maxAllowed}</span>
                        )}
                    </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Отказ</Button>
                    <Button onClick={handleSubmit} disabled={loading || !selectedProduct}>
                        {loading ? 'Добавяне...' : 'Добави'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 