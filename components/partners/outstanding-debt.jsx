'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
  import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
  } from "@/components/ui/tooltip";

export default function PartnerOutstandingDebt() {
  const { partnerId } = useParams();
  const [debt, setDebt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDebt() {
      setLoading(true);
      try {
        const res = await fetch(`/api/partners/${partnerId}/outstanding-debt`);
        console.log('Fetch response status:', res.status);
        if (!res.ok) {
          const text = await res.text();
          console.log('Fetch error response:', text);
          setDebt(null);
        } else {
          const data = await res.json();
          console.log('Fetch success data:', data);
          setDebt(data);
        }
      } catch (err) {
        console.log('Fetch exception:', err);
        setDebt(null);
      }
      setLoading(false);
    }
    if (partnerId) {
      console.log('Fetching debt for partnerId:', partnerId);
      fetchDebt();
    } else {
      console.log('No partnerId available');
    }
  }, [partnerId]);

  useEffect(() => {
    console.log('Current loading state:', loading);
    console.log('Current debt state:', debt);
  }, [loading, debt]);

  if (loading) return <div>Loading...</div>;
  if (!debt) return <div>No data.</div>;

  return (
  <>
<div className="flex items-center justify-between">
<div className="flex items-center space-x-2">
  <Calendar className="h-4 w-4 text-gray-400" />
  <span className="text-sm text-gray-600">
    Задължение
  </span>
</div>
<Tooltip>
                      <TooltipTrigger className="text-lg font-bold text-gray-900">
                        {debt &&
                         debt.outstandingDebt} {" "}
                        лв.
                      </TooltipTrigger>
                      <TooltipContent className="flex flex-col gap-1">
                        <span>
                          Продажби: <b>{debt.totalSales} лв.</b>
                        </span>
                        <span>
                          Плащания: <b>{debt.totalPayments} лв.</b>
                        </span>
                      </TooltipContent>
                    </Tooltip>
</div>
  </>
  );
} 