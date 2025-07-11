'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CashRegisterPage() {
  const { storageId } = useParams();
  const [cashRegister, setCashRegister] = useState(null);
  const [payments, setPayments] = useState([]);
  const [cashMovements, setCashMovements] = useState([]);
  const [outstandingDebt, setOutstandingDebt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch cash register
      const regRes = await fetch(`/api/cash-registers/${storageId}`);
      const regData = await regRes.json();
      setCashRegister(regData);
      // Fetch payments
      const payRes = await fetch(`/api/cash-registers/${storageId}/payments`);
      setPayments(await payRes.json());
      // Fetch cash movements
      const movRes = await fetch(`/api/cash-registers/${storageId}/cash-movements`);
      setCashMovements(await movRes.json());
      // Fetch outstanding debt (try partner, then store)
      let debt = null;
      if (regData && regData.storage && regData.storage.partnerId) {
        const debtRes = await fetch(`/api/partners/${regData.storage.partnerId}/outstanding-debt`);
        debt = await debtRes.json();
      } else if (regData && regData.storage && regData.storage.storeId) {
        const debtRes = await fetch(`/api/stores/${regData.storage.storeId}/outstanding-debt`);
        debt = await debtRes.json();
      }
      setOutstandingDebt(debt);
      setLoading(false);
    }
    if (storageId) fetchData();
  }, [storageId]);

  if (loading) return <div>Loading...</div>;
  if (!cashRegister) return <div>No cash register found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cash Register</h1>
      <div className="mb-4">
        <strong>Cash Balance:</strong> {cashRegister.cashBalance}
      </div>
      {outstandingDebt && (
        <div className="mb-4">
          <strong>Outstanding Debt:</strong> {outstandingDebt.outstandingDebt} <br/>
          <span className="text-sm text-gray-500">(Sales: {outstandingDebt.totalSales}, Payments: {outstandingDebt.totalPayments})</span>
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Payments</h2>
        <button className="mb-2 px-2 py-1 bg-blue-500 text-white rounded">Add Payment</button>
        <table className="w-full border">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Revision</th>
              <th>Invoice</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td>{p.user?.name || p.user?.email || p.userId}</td>
                <td>{p.amount}</td>
                <td>{p.method}</td>
                <td>{p.revisionId}</td>
                <td>{p.invoiceId}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>
                  <button className="text-xs text-yellow-600">Edit</button>
                  <button className="text-xs text-red-600 ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Cash Movements</h2>
        <button className="mb-2 px-2 py-1 bg-blue-500 text-white rounded">Add Cash Movement</button>
        <table className="w-full border">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cashMovements.map(m => (
              <tr key={m.id}>
                <td>{m.user?.name || m.user?.email || m.userId}</td>
                <td>{m.amount}</td>
                <td>{m.type}</td>
                <td>{new Date(m.createdAt).toLocaleString()}</td>
                <td>
                  <button className="text-xs text-yellow-600">Edit</button>
                  <button className="text-xs text-red-600 ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8">
        <Link href={`/dashboard/storages/${storageId}`}>Back to Storage</Link>
      </div>
    </div>
  );
} 