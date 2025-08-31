'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CreateStorageForm({ onSuccess }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
        toast.error("Името на склада е задължително.");
        setLoading(false);
        return;
    }

    await toast.promise(
      async () => {
        const response = await fetch('/api/storages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || 'Failed to create storage');
        }
        
        if (onSuccess) onSuccess();
      },
      {
        loading: 'Създаване на склад...',
        success: 'Складът е създаден успешно!',
        error: (err) => err.message,
      }
    );

    setLoading(false);
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Име на склада</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Напр. Склад София, Бус 1"
            disabled={loading}
            required
          />
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Отказ
            </Button>
            <Button type="submit" disabled={loading}>
            {loading ? 'Запазване...' : 'Запази'}
            </Button>
        </div>
      </form>
  );
} 