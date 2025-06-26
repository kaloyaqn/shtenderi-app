'use client';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function EditStorageQuantityDialog({ open, onOpenChange, storageProduct, onQuantityUpdated }) {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storageProduct) {
      setQuantity(storageProduct.quantity);
    }
  }, [storageProduct]);

  if (!storageProduct) return null;

  const handleSubmit = async () => {
    if (quantity === '' || Number(quantity) < 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }
    setLoading(true);

    await toast.promise(async () => {
      const response = await fetch(`/api/storages/${storageProduct.storageId}/products/${storageProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: Number(quantity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quantity');
      }

      onQuantityUpdated();
      onOpenChange(false);
    }, {
      loading: 'Updating quantity...',
      success: 'Quantity updated successfully!',
      error: (err) => err.message,
    });

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактирай количество</DialogTitle>
          <DialogDescription>
            Променете количеството на <strong>{storageProduct.product.name}</strong> в склада.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="quantity" className="text-right">
            Количество
          </Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="col-span-3"
            min="0"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Отказ
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Запазване...' : 'Запази'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 