"use client";

import BasicHeader from "@/components/BasicHeader";
import PageHelpTour from "@/components/help/PageHelpTour";
import { Card, CardTitle } from "@/components/ui/card";
import { IconTruckReturn } from "@tabler/icons-react";
import {
  CheckCheck,
  Package,
  PersonStanding,
  Store,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MobileHomepage({ session }) {
  const [stats, setStats] = useState([]);

  async function fetchCash() {
    try {
      const res = await fetch("/api/users/my-cash");
      const data = await res.json();
      setStats(data);
      console.log(data);
    } catch (error) {
      throw new Error("Error", Error);
    }
  }

  useEffect(() => {
    fetchCash();
  }, [session]);

  return (
    <>
    <PageHelpTour />
      <div className="min-h-screen">
        <BasicHeader
            id="header"
          className="bg-gray-50"
          title={`Здравей, ${session.user.name}`}
          subtitle={`Всичко важно за теб - на едно място.`}
        ></BasicHeader>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
          <Link href={`/dashboard/cash-registers/${stats.storageId}`}>
            <Card id="cash-balance-card" className="hover:shadow-lg transition p-4 cursor-pointer flex flex-col gap-0">
              <h2>Наличност каса</h2>
              <span className="font-semibold text-gray-900 text-2xl">
                {stats.cashBalance || "00.00"} лв.
              </span>
            </Card>
          </Link>
          <Link href={`/dashboard/cash-registers/${stats.storageId}`}>
            <Card id="gross-income-card" className="hover:shadow-lg transition cursor-pointer p-4 gap-0">
              <h2>Генериран оборот</h2>

              <span className="font-semibold text-2xl text-gray-900">
                {stats.grossIncome || "00.00"} лв.
              </span>
            </Card>
          </Link>
          <Link href="/dashboard/stands">
            <Card className="hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center py-6">
              <Store className="h-8 w-8 text-blue-600 mb-2" />
              <span className="font-semibold text-gray-900">Моите стелажи</span>
            </Card>
          </Link>

          <Link href="/dashboard/storages">
            <Card className="hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center py-6">
              <Package className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="font-semibold text-gray-900">
                Моите складове
              </span>
            </Card>
          </Link>
          <Link href="/dashboard/revisions">
            <Card className="hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center py-6">
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <span className="font-semibold text-gray-900">
                Моите продажби
              </span>
            </Card>
          </Link>
          <Link href="/dashboard/checking">
            <Card className="hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center py-6">
              <CheckCheck className="h-8 w-8 text-lime-600 mb-2" />
              <span className="font-semibold text-gray-900">
                Моите проверки
              </span>
            </Card>
          </Link>
          <Link href="/dashboard/checking">
            <Card className="hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center py-6">
              <IconTruckReturn className="h-8 w-8 text-red-600 mb-2" />
              <span className="font-semibold text-gray-900">
                Моите върщания
              </span>
            </Card>
          </Link>
          <Link href="/dashboard/partners">
            <Card className="hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center py-6">
              <PersonStanding className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-semibold text-gray-900">
                Моите партньори
              </span>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
}
