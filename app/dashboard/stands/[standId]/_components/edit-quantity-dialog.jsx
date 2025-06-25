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

export default function EditQuantityDialog({ open, onOpenChange, standProduct, onProductUpdated }) {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (standProduct) {
            setQuantity(standProduct.quantity);
        }
    }, [standProduct]);

    // Calculate the max allowed quantity for this product on this stand
    let maxAllowed = null;
    if (standProduct && standProduct.product) {
        const assignedToOthers = standProduct.product.standProducts?.reduce((sum, sp) => sp.id === standProduct.id ? sum : sum + sp.quantity, 0) || 0;
        maxAllowed = standProduct.product.quantity - assignedToOthers;
    }

    if (!standProduct) return null;

    const handleSubmit = async () => {
        if (quantity === undefined || quantity < 0) {
            setError('Please enter a valid quantity.');
            return;
        }
        if (maxAllowed !== null && parseInt(quantity, 10) > maxAllowed) {
            setError(`Нямате достатъчно наличност. Максимум: ${maxAllowed}`);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/stands/${standProduct.standId}/products/${standProduct.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity: parseInt(quantity, 10),
                }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to update quantity');
            }
            onProductUpdated();
            handleClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleClose = () => {
        onOpenChange(false);
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Редактирай количество</DialogTitle>
                    <DialogDescription>
                        Променете количеството за продукт "{standProduct.product.name}".
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-1.5">
                        <Label htmlFor="quantity">Количество</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="0"
                            max={maxAllowed !== null ? maxAllowed : undefined}
                        />
                        {maxAllowed !== null && (
                            <span className="text-xs text-muted-foreground">Максимум: {maxAllowed}</span>
                        )}
                    </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Отказ</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Запазване...' : 'Запази'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 