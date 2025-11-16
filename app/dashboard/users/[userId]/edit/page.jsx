'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UserEditPage({ params }) {
  const { userId } = params;
  const router = useRouter();
  const { data: session } = useSession();

  const [user, setUser] = useState(null);
  const [stands, setStands] = useState([]);
  const [partners, setPartners] = useState([]);
  const [storages, setStorages] = useState([]);
  
  const [selectedStands, setSelectedStands] = useState([]);
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [selectedStorages, setSelectedStorages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
        toast.error('Достъп отказан');
        router.push('/dashboard/users');
        return;
    }

    async function fetchData() {
      try {
        // Fetch user details
        const userRes = await fetch(`/api/users/${userId}`);
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData = await userRes.json();
        setUser(userData);
        setSelectedStands(userData.stands.map(s => s.id));
        setSelectedPartners(userData.partners.map(p => p.id));
        setSelectedStorages(userData.storages.map(s => s.id));

        // Fetch all resources for selection
        const [standsRes, partnersRes, storagesRes] = await Promise.all([
          fetch('/api/stands'),
          fetch('/api/partners'),
          fetch('/api/storages'),
        ]);

        if (!standsRes.ok || !partnersRes.ok || !storagesRes.ok) {
            throw new Error('Failed to fetch resources');
        }

        setStands(await standsRes.json());
        setPartners(await partnersRes.json());
        setStorages(await storagesRes.json());

      } catch (error) {
        toast.error(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session, userId, router]);

  const handleCheckboxChange = (setter) => (e) => {
    const value = e.target.value;
    setter(prev => prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]);
  };
  
  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setUser(prev => ({...prev, [name]: value}));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const updatePromises = [
      // Update user details
      fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, email: user.email, role: user.role }),
      }),
      // Update stand assignments
      fetch(`/api/users/${userId}/stands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standIds: selectedStands }),
      }),
      // Update partner assignments
      fetch(`/api/users/${userId}/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerIds: selectedPartners }),
      }),
      // Update storage assignments
      fetch(`/api/users/${userId}/storages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageIds: selectedStorages }),
      }),
    ];

    try {
      const results = await Promise.all(updatePromises);
      const allOk = results.every(res => res.ok);
      if (!allOk) {
        throw new Error('One or more updates failed.');
      }
      toast.success('Потребителят е обновен успешно!');
      router.push('/dashboard/users');
    } catch (error) {
      toast.error('Грешка при обновяване на потребителя.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div>Зареждане...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Редакция на потребител: {user.name}</h1>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* User Details */}
        <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Детайли</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Име</label>
                    <input type="text" name="name" id="name" value={user.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Имейл</label>
                    <input type="email" name="email" id="email" value={user.email} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Роля</label>
                    <select name="role" id="role" value={user.role} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="USER">Търговски представител</option>
                        <option value="ADMIN">Администратор</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Assignments */}
        <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Права за достъп</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CheckboxGroup title="Щендери" items={stands} selectedItems={selectedStands} onChange={handleCheckboxChange(setSelectedStands)} />
                <CheckboxGroup title="Партньори" items={partners} selectedItems={selectedPartners} onChange={handleCheckboxChange(setSelectedPartners)} />
                <CheckboxGroup title="Складове" items={storages} selectedItems={selectedStorages} onChange={handleCheckboxChange(setSelectedStorages)} />
            </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Отказ</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Записване...' : 'Запази промените'}</Button>
        </div>
      </form>
    </div>
  );
}

function CheckboxGroup({ title, items, selectedItems, onChange }) {
  return (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
        {items.map(item => (
          <label key={item.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded">
            <input
              type="checkbox"
              value={item.id}
              checked={selectedItems.includes(item.id)}
              onChange={onChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm">{item.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
} 