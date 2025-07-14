"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreatePaymentRevisionForm({ revision, revisionId, totalPaid, totalRevisionPrice, fetchPayments }) {
  const [selectedCashRegister, setSelectedCashRegister] = useState("");
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [userId, setUserId] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cashRegisters, setCashRegisters] = useState([]);
  const { data: session } = useSession();
  const [payments, setPayments] = useState([]);

  // Calculate total paid for this revision
//   const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
//   // Calculate total price of revision
//   const totalRevisionPrice =
//     revision?.missingProducts?.reduce(
//       (sum, mp) =>
//         sum +
//         mp.missingQuantity * (mp.priceAtSale ?? mp.product?.clientPrice ?? 0),
//       0
//     ) || 0;
  // Overpayment check
  const enteredAmount = parseFloat(amount) || 0;
  const willOverpay = enteredAmount + totalPaid > totalRevisionPrice;
  const isFullyPaid = totalPaid >= totalRevisionPrice;
  const isAmountInvalid = isNaN(parseFloat(amount)) || parseFloat(amount) <= 0;

  async function handlePayment(e) {
    e.preventDefault();
    setPaymentLoading(true);
    setSuccess(false);
    await fetch(`/api/cash-registers/${selectedCashRegister}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        method,
        revisionId,
        userId: session?.user?.id,
      }),
    });
    setPaymentLoading(false);
    setSuccess(true);
    toast.success("Плащането е успешно")
    setAmount("");
    fetchPayments();
  }



  useEffect(() => {
    if (revisionId) fetchPayments();
  }, [revisionId]);

  useEffect(() => {
    // Fetch all cash registers
    fetch("/api/cash-registers")
      .then((res) => res.json())
      .then(setCashRegisters);
  }, []);


  return (
    <>
      {!isFullyPaid && (
              <Card className={'mt-2'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base lg:text-lg">
                    Добави плащане към тази продажба
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {revision.missingProducts?.length > 0 ? (
                  <>
                    {/* Payment form under DataTable */}
                    <form
                      className=""
                      onSubmit={handlePayment}
                    >
                      <div className="flex justify-between items-start gap-3">
      
                  <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2 w-full">
                        <Label className="block mb-1">Сума</Label>
                        <span className="text-xs text-gray-500">
                          {totalPaid.toFixed(2)}/{totalRevisionPrice.toFixed(2)},  {(totalRevisionPrice - totalPaid).toFixed(2)}
                        </span>
                      </div>
                  <Input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="0.01"
                        disabled={isFullyPaid}
                      />
                  </div>
                      <div className="w-full">
                        <Label className="block mb-1">Метод</Label>
                        <Select value={method} onValueChange={setMethod}>
                          <SelectTrigger className={'w-full'}>
                            <SelectValue placeholder="Избери метод" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">В брой</SelectItem>
                            <SelectItem value="BANK">Банка</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      </div>
                      <div className="mb-2  mt-3">
                        <label className="block mb-1">Каса (склад)</label>
                        <Select
                          value={selectedCashRegister}
                          onValueChange={setSelectedCashRegister}
                          required
                        >
                          <SelectTrigger className={'w-full '}>
                            <SelectValue placeholder="Избери каса" />
                          </SelectTrigger>
                          <SelectContent>
                            {cashRegisters.map((cr) => (
                              <SelectItem key={cr.id} value={cr.storageId}>
                                {cr.storage?.name || cr.storageId}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          type="submit"
                          disabled={
                            paymentLoading ||
                            willOverpay ||
                            isAmountInvalid ||
                            isFullyPaid
                          }
                        >
                          {paymentLoading ? "Обработка..." : "Добави плащане"}
                        </Button>
                      </div>
                      {/* {isAmountInvalid && (
                        <div className="text-red-600 text-xs mt-1">
                          Сумата трябва да е положително число!
                        </div>    
                      )} */}
                      {isFullyPaid && (
                        <div className="text-green-700 text-xs mt-1">
                          Продажбата е напълно платена.
                        </div>
                      )}
                      {success && (
                        <div className="mt-2 text-green-700">
                          Плащането е успешно!
                        </div>
                      )}
                    </form>
                  </>
                ) : (
                  <p>Няма регистрирани продажби.</p>
                )}
              </CardContent>
            </Card>
      )}

    </>
  );
}
