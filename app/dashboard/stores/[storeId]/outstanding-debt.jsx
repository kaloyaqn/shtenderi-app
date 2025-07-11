import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function StoreOutstandingDebt() {
  const { storeId } = useParams();
  const [debt, setDebt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDebt() {
      setLoading(true);
      const res = await fetch(`/api/stores/${storeId}/outstanding-debt`);
      setDebt(await res.json());
      setLoading(false);
    }
    if (storeId) fetchDebt();
  }, [storeId]);

  if (loading) return <div>Loading...</div>;
  if (!debt) return <div>No data.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Outstanding Debt</h2>
      <div><strong>Outstanding Debt:</strong> {debt.outstandingDebt}</div>
      <div><strong>Total Sales:</strong> {debt.totalSales}</div>
      <div><strong>Total Payments:</strong> {debt.totalPayments}</div>
    </div>
  );
} 