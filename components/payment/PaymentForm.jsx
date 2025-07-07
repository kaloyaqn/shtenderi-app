import React, { useState, useEffect } from 'react';
import CashSelect from '../ui/CashSelect';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Alert } from '../ui/alert';

/**
 * PaymentForm
 * Props:
 * - invoiceId: string
 * - totalAmount: number
 * - defaultMethod: 'cash' | 'bank' (optional)
 * - onSuccess: (paymentData) => void (optional)
 */
const PaymentForm = ({ invoiceId, totalAmount, defaultMethod = 'cash', onSuccess }) => {
  const [addPayment, setAddPayment] = useState(true);
  const [method, setMethod] = useState(defaultMethod);
  const [amount, setAmount] = useState('');
  const [cashRegisterId, setCashRegisterId] = useState('');
  const [cashRegisters, setCashRegisters] = useState([]);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (method === 'cash') {
      fetch('/api/cash-registers?invoiceId=' + invoiceId)
        .then(res => res.json())
        .then(data => setCashRegisters(data))
        .catch(() => setCashRegisters([]));
    }
  }, [method, invoiceId]);

  useEffect(() => {
    // Validation logic
    setError('');
    setWarning('');
    const amt = parseFloat(amount);
    if (addPayment) {
      if (!amount || isNaN(amt) || amt <= 0) {
        setError('Моля, въведете валидна сума.');
      } else if (amt > totalAmount) {
        setWarning('Сумата надвишава стойността на фактурата. Ще се отчете като кредит.');
      }
      if (method === 'cash' && !cashRegisterId) {
        setError('Моля, изберете каса.');
      }
    }
  }, [amount, method, cashRegisterId, addPayment, totalAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError("");
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          amount: parseFloat(amount),
          method: method === 'cash' ? 'CASH' : 'BANK',
          cashRegisterId: method === 'cash' ? cashRegisterId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Грешка при плащане');
      if (onSuccess) onSuccess(data);
      setAmount('');
      setCashRegisterId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Checkbox
        checked={addPayment}
        onCheckedChange={setAddPayment}
        label="Добави плащане към продажбата"
      />
      {addPayment && (
        <div className="space-y-2">
          <div>
            <label className="block mb-1">Начин на плащане</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">В брой</SelectItem>
                <SelectItem value="bank">По банка</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1">Сума за плащане</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full"
            />
          </div>
          {method === 'cash' && (
            <div>
              <label className="block mb-1">Каса</label>
              <CashSelect
                value={cashRegisterId}
                onChange={setCashRegisterId}
                options={cashRegisters}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-1">Физическите пари ще се изискат от склада</div>
            </div>
          )}
          <div className="text-sm text-muted-foreground">Стойност на фактурата: <b>{totalAmount.toFixed(2)}</b> лв.</div>
          {error && <Alert variant="destructive">{error}</Alert>}
          {warning && <Alert variant="warning">{warning}</Alert>}
          <Button type="submit" className="mt-2" disabled={paying || !!error}>
            {paying ? 'Обработва се...' : 'Добави плащане'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default PaymentForm; 