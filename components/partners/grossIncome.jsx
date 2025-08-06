import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card";

  import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
  } from "@/components/ui/tooltip";

import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

import {
    ArrowLeft,
    Edit,
    Phone,
    User,
    Building,
    MapPin,
    Store as StoreIcon,
    ExternalLink,
    Mail,
    Calendar,
    Activity,
    TrendingUp,
    Package,
  } from "lucide-react";
import PartnerOutstandingDebt from "./outstanding-debt";


export default function GrossIncomeComponent({partnerId}) {
  const [grossIncome, setGrossIncome] = useState({});


    const fetchGrossIncomePartner = async () => {
        try {
          // Get current calendar week (Monday to Sunday)
          const now = new Date();
          const dayOfWeek = now.getDay();
          const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const start = new Date(now);
          start.setDate(now.getDate() - daysFromMonday);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          
          const dateFrom = start.toISOString().slice(0, 10);
          const dateTo = end.toISOString().slice(0, 10);
          
          // Use the reports API like the URL you provided
          const params = new URLSearchParams({
            partner: partnerId,
            dateFrom,
            dateTo,
            type: 'missing'
          });
          
          const res = await fetch(`/api/reports/partners/${partnerId}/sales?${params.toString()}`);
          if (!res.ok) throw new Error("Failed to fetch sales data");
          const data = await res.json();
          
          // Calculate sales from missing products
          const sales = data.sales.filter(sale => sale.type === 'missing').reduce((sum, sale) => {
            const products = sale.missingProducts || [];
            const total = products.reduce((s, mp) => {
              // Use priceAtSale if available, otherwise use product.clientPrice
              const price = mp.priceAtSale || mp.product?.clientPrice || 0;
              const quantity = mp.missingQuantity || mp.givenQuantity || 0;
              return s + (price * quantity);
            }, 0);
            return sum + total;
          }, 0);
          
          // Calculate this month (current calendar month)
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          const thisMonthFrom = thisMonthStart.toISOString().slice(0, 10);
          const thisMonthTo = thisMonthEnd.toISOString().slice(0, 10);
          
          const thisMonthParams = new URLSearchParams({
            partner: partnerId,
            dateFrom: thisMonthFrom,
            dateTo: thisMonthTo,
            type: 'missing'
          });
          
          const thisMonthRes = await fetch(`/api/reports/partners/${partnerId}/sales?${thisMonthParams.toString()}`);
          const thisMonthData = await thisMonthRes.ok ? await thisMonthRes.json() : { sales: [] };
          
          const thisMonthSales = thisMonthData.sales.filter(sale => sale.type === 'missing').reduce((sum, sale) => {
            const products = sale.missingProducts || [];
            const total = products.reduce((s, mp) => {
              const price = mp.priceAtSale || mp.product?.clientPrice || 0;
              const quantity = mp.missingQuantity || mp.givenQuantity || 0;
              return s + (price * quantity);
            }, 0);
            return sum + total;
          }, 0);
          
          // Calculate last month (previous calendar month)
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          const lastMonthFrom = lastMonthStart.toISOString().slice(0, 10);
          const lastMonthTo = lastMonthEnd.toISOString().slice(0, 10);
          
          const lastMonthParams = new URLSearchParams({
            partner: partnerId,
            dateFrom: lastMonthFrom,
            dateTo: lastMonthTo,
            type: 'missing'
          });
          
          const lastMonthRes = await fetch(`/api/reports/partners/${partnerId}/sales?${lastMonthParams.toString()}`);
          const lastMonthData = await lastMonthRes.ok ? await lastMonthRes.json() : { sales: [] };
          
          const lastMonthSales = lastMonthData.sales.filter(sale => sale.type === 'missing').reduce((sum, sale) => {
            const products = sale.missingProducts || [];
            const total = products.reduce((s, mp) => {
              const price = mp.priceAtSale || mp.product?.clientPrice || 0;
              const quantity = mp.missingQuantity || mp.givenQuantity || 0;
              return s + (price * quantity);
            }, 0);
            return sum + total;
          }, 0);
          
          // Set the data
          setGrossIncome({
            this_week: {
              sales: sales.toFixed(2),
              refunds: "0.00",
              grossIncome: sales.toFixed(2)
            },
            this_month: {
              sales: thisMonthSales.toFixed(2),
              refunds: "0.00",
              grossIncome: thisMonthSales.toFixed(2)
            },
            last_month: {
              sales: lastMonthSales.toFixed(2),
              refunds: "0.00",
              grossIncome: lastMonthSales.toFixed(2)
            }
          });
          
        } catch (err) {
          console.error('[GROSS_INCOME_COMPONENT] Error:', err);
          setError(err.message);
        }
      };

      useEffect(() => {
        fetchGrossIncomePartner()
      }, [partnerId])
    return (
        <>
                    <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статистики</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Оборот този месец
                    </span>
                  </div>
                  {grossIncome.this_month && (
                    <Tooltip>
                      <TooltipTrigger className="text-lg font-bold text-gray-900">
                        {grossIncome.this_month &&
                          grossIncome.this_month.grossIncome}{" "}
                        лв.
                      </TooltipTrigger>
                      <TooltipContent className="flex flex-col gap-1">
                        <span>
                          Продажби: <b>{grossIncome.this_month.sales} лв.</b>
                        </span>
                        <span>
                          Връщания: <b>{grossIncome.this_month.refunds} лв.</b>
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Оборот тази седмица</span>
                  </div>
                  {grossIncome.this_week && (
                    <Tooltip>
                      <TooltipTrigger className="text-lg font-bold text-gray-900">
                        {grossIncome.this_week &&
                          grossIncome.this_week.grossIncome}{" "}
                        лв.
                      </TooltipTrigger>
                      <TooltipContent className="flex flex-col gap-1">
                        <span>
                          Продажби: <b>{grossIncome.this_week.sales} лв.</b>
                        </span>
                        <span>
                          Връщания: <b>{grossIncome.this_week.refunds} лв.</b>
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Оборот предходен месец
                    </span>
                  </div>
                  {grossIncome.last_month && (
                    <Tooltip>
                      <TooltipTrigger className="text-lg font-bold text-gray-900">
                        {grossIncome.last_month &&
                          grossIncome.last_month.grossIncome}{" "}
                        лв.
                      </TooltipTrigger>
                      <TooltipContent className="flex flex-col gap-1">
                        <span>
                          Продажби: <b>{grossIncome.last_month.sales} лв.</b>
                        </span>
                        <span>
                          Връщания: <b>{grossIncome.last_month.refunds} лв.</b>
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Separator />
                    <PartnerOutstandingDebt />
              </CardContent>
            </Card>
        </>
    )
}