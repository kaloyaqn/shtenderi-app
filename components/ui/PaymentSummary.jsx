import React from 'react';

const getStatus = (total, paid) => {
  if (paid >= total) return { label: 'Разплатена', color: 'green' };
  if (paid > 0) return { label: 'Частично', color: 'orange' };
  return { label: 'Неразплатена', color: 'red' };
};

const PaymentSummary = ({ total, paid, payments = [] }) => {
  const status = getStatus(total, paid);
  return (
    <div className="border rounded p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-white bg-${status.color}-500`}>{status.label}</span>
        <span className="text-sm text-muted-foreground">Платено: <b>{paid.toFixed(2)}</b> / {total.toFixed(2)} лв.</span>
      </div>
      <div className="mt-2">
        <div className="font-semibold mb-1">Плащания:</div>
        {payments.length === 0 && <div className="text-xs text-muted-foreground">Няма плащания</div>}
        <ul className="space-y-1">
          {payments.map(p => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <span>{p.method === 'cash' ? 'В брой' : 'По банка'}</span>
              <span>{p.amount.toFixed(2)} лв.</span>
              {p.method === 'cash' && p.cashRegisterName && (
                <span className="text-xs text-muted-foreground">({p.cashRegisterName})</span>
              )}
              <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PaymentSummary; 