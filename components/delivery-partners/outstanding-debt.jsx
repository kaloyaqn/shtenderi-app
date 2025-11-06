'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function DeliveryPartnerOutstandingDebt() {
  const { partnerId } = useParams();
  const [debt, setDebt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDebt() {
      setLoading(true);
      try {
        const res = await fetch(`/api/delivery-partners/${partnerId}/outstanding-debt`);
        if (!res.ok) { setDebt(null); }
        else { setDebt(await res.json()); }
      } catch {
        setDebt(null);
      }
      setLoading(false);
    }
    if (partnerId) fetchDebt();
  }, [partnerId]);

  if (loading) return <div>Loading...</div>;
  if (!debt) return <div>No data.</div>;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">Задължение към доставчик</span>
      </div>
      <Tooltip>
        <TooltipTrigger className="text-lg font-bold text-gray-900">
          {debt.outstandingDebt} лв.
        </TooltipTrigger>
        <TooltipContent className="flex flex-col gap-1">
          <span>Доставки: <b>{debt.totalDeliveries} лв.</b></span>
          <span>Плащания: <b>{debt.totalPayments} лв.</b></span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}


