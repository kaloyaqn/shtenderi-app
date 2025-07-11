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
          const res = await fetch(`/api/partners/${partnerId}/gross-income/batch`);
          if (!res.ok) throw new Error("Failed to fetch gross income");
          const data = await res.json();
          console.log(data);
          setGrossIncome(data);
        } catch (err) {
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