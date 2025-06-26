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
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { toast } from 'sonner';

export default function AddProductToStorageDialog({ open, onOpenChange, storageId, onProductAdded }) {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Fetch all products to search from
      const fetchProducts = async () => {
        try {
          const res = await fetch('/api/products');
          if (!res.ok) throw new Error('Failed to fetch products');
          const products = await res.json();
          setAllProducts(products);
        } catch (error) {
          toast.error('Could not load product list.');
          console.error(error);
        }
      };
      fetchProducts();
      // Reset state when dialog opens
      setSelectedProduct(null);
      setSearchTerm('');
      setQuantity(1);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity) {
      toast.error('Please select a product and enter a quantity.');
      return;
    }
    setLoading(true);

    await toast.promise(async () => {
      const response = await fetch(`/api/storages/${storageId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: Number(quantity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product to storage');
      }

      onProductAdded(); // Callback to refresh the product list on the main page
      onOpenChange(false); // Close the dialog
    }, {
      loading: 'Adding product to storage...',
      success: 'Product added successfully!',
      error: (err) => err.message,
    });

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добави продукт в склада</DialogTitle>
          <DialogDescription>
            Намерете продукт по име или баркод и въведете количеството, което да добавите.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Command>
            <CommandInput
              placeholder="Търси по име или баркод..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>Няма намерени продукти.</CommandEmpty>
              {allProducts
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.barcode.includes(searchTerm)
                )
                .slice(0, 10) // Show top 10 results
                .map((product) => (
                  <CommandItem
                    key={product.id}
                    value={`${product.name} - ${product.barcode}`}
                    onSelect={() => {
                      setSelectedProduct(product);
                      setSearchTerm(`${product.name} (${product.barcode})`);
                    }}
                  >
                    {product.name} ({product.barcode})
                  </CommandItem>
                ))}
            </CommandList>
          </Command>

          {selectedProduct && (
            <div>
              <Label htmlFor="quantity" className="text-right">
                Количество
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
                min="1"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Отказ
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedProduct}>
            {loading ? 'Добавяне...' : 'Добави'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 