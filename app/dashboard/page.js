"use client";
import React, { useEffect, useState } from "react";
import {
  Store,
  Building,
  Package,
  DollarSign,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Bell,
  ArrowUp,
  ArrowDown,
  Minus,
  PersonStanding,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/session-context";
import { authClient } from "@/lib/auth-client";
import BasicHeader from "@/components/BasicHeader";
import Link from "next/link";
import { IconTruckReturn } from "@tabler/icons-react";
import MobileHomepage from "@/components/mobile/homepage/MobileHomepage";

export default function DashboardHome() {
  const { data: session, status } = useSession();
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      authClient.signOut().then(() => {
        window.location.href = '/login';
      });
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      setLoading(true);
      fetch('/api/dashboard')
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setAdminStats(data))
        .catch(() => setError("Грешка при зареждане на статистиката"))
        .finally(() => setLoading(false));

      // fetch unpaid/partial invoices to surface overdue ones
      setLoadingAlerts(true);
      fetch("/api/reports/unpaid-invoices")
        .then((res) => res.ok ? res.json() : [])
        .then((list = []) => {
          const now = new Date();
          const overdue = list.filter((inv) => {
            const issued = new Date(inv.issuedAt);
            const due = new Date(issued);
            if (inv.paymentMethod === "CASH") {
              // same day: end of day
              due.setHours(23, 59, 59, 999);
            } else {
              due.setDate(due.getDate() + 30);
              due.setHours(23, 59, 59, 999);
            }
            return now > due;
          });
          setOverdueInvoices(overdue);
        })
        .catch(() => setOverdueInvoices([]))
        .finally(() => setLoadingAlerts(false));
    }
  }, [session?.user?.role]);

  const metrics = [
    {
      title: "Общо стелажи",
      value: loading ? <span className="animate-pulse text-gray-400">...</span> : adminStats?.stands ?? '-',
      icon: Store,
      trend: "stable",
      trendValue: 0,
    },
    {
      title: "Общо магазини",
      value: loading ? <span className="animate-pulse text-gray-400">...</span> : adminStats?.stores ?? '-',
      icon: Building,
      trend: "stable",
      trendValue: 0,
    },
    {
      title: "Продукти на стелажи",
      value: loading ? <span className="animate-pulse text-gray-400">...</span> : adminStats?.products ?? '-',
      icon: Package,
      trend: "up",
      trendValue: 0,
    },
    {
      title: "Оборот",
      value: loading ? <span className="animate-pulse text-gray-400">...</span> : adminStats?.grossIncome ?? '-',
      icon: DollarSign,
      trend: "up",
      trendValue: 0,
    },
    {
      title: "Стелажи за презареждане",
      value: loading ? <span className="animate-pulse text-gray-400">...</span> : adminStats?.resupplyNeeds ?? '-',
      icon: RefreshCw,
      trend: "down",
      trendValue: 0,
    },
  ];

  const getTrendIcon = (trend, trendValue) => {
    if (trendValue === null || trendValue === undefined) return <Minus className="h-3 w-3 text-gray-400" />;
    switch (trend) {
      case "up":
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  if (status === "loading") return null;

  // USER DASHBOARD VIEW
  if (session?.user?.role !== "ADMIN") {
    return (
      <MobileHomepage session={session} />
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <BasicHeader title={`Здравей, ${session?.user?.name || ''}`} 
      subtitle={`Всичко важно за теб - на едно място.`}
      />

      {/* Overdue invoices alert */}
      {overdueInvoices.length > 0 && (
        <div className="mb-4 border border-red-200 bg-red-50 text-red-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold">Просрочени неплатени фактури</p>
              <p className="text-sm text-red-800">
                {overdueInvoices.length} фактури са извън срока за плащане.
              </p>
            </div>
            <Link href="/dashboard/reports/unpaid-invoices">
              <Button variant="outline" className="border-red-300 text-red-900">
                Виж всички
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {overdueInvoices.slice(0, 3).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm border border-red-100 rounded px-3 py-2">
                <div className="flex flex-col">
                  <span className="font-semibold">Фактура № {inv.invoiceNumber}</span>
                  <span className="text-red-800">{inv.partnerName || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{Number(inv.totalValue || 0).toFixed(2)} лв.</span>
                  <Link href={`/dashboard/invoices/${inv.id}`}>
                    <Button size="sm" variant="ghost" className="border border-red-200 text-red-900">
                      Отвори
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {overdueInvoices.length > 3 && (
              <div className="text-xs text-red-800">+ още {overdueInvoices.length - 3} фактури</div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="">
        <div className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="h-5 w-5 text-gray-600" />
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(metric.trend, metric.trendValue)}
                      {(metric.trendValue !== null && metric.trendValue !== undefined && metric.trendValue !== 0) && (
                        <span className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
                          {metric.trendValue > 0 ? "+" : ""}
                          {metric.trendValue}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{metric.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales by Stand */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-gray-600" />
                  Продажби по стелаж
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminStats?.salesByStand && adminStats.salesByStand.length > 0 ? (
                    adminStats.salesByStand.map((item, index) => {
                      const maxValue = Math.max(...(adminStats?.salesByStand ? adminStats.salesByStand.map(i => i.value) : [1]));
                      const widthPercent = (item.value / maxValue) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{item.name}</span>
                            <span className="font-medium text-gray-900">{item.value}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${widthPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-400 text-center py-4">Няма данни</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-gray-600" />
                  Топ продукти
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminStats?.topProducts && adminStats.topProducts.length > 0 ? (
                    adminStats.topProducts.map((item, index) => {
                      const maxValue = Math.max(...(adminStats?.topProducts ? adminStats.topProducts.map(i => i.value) : [1]));
                      const widthPercent = (item.value / maxValue) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 truncate pr-2">{item.name}</span>
                            <span className="font-medium text-gray-900 whitespace-nowrap">{item.value}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${widthPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-400 text-center py-4">Няма данни</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales Trend */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-gray-600" />
                  Тренд на продажбите
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end justify-between space-x-1">
                  {(!adminStats?.salesTrend || adminStats.salesTrend.length === 0 || adminStats.salesTrend.every(i => i.value === 0)) ? (
                    <div className="w-full text-center text-gray-400 text-sm flex items-center justify-center h-full">Няма данни за този период</div>
                  ) : (
                    adminStats.salesTrend.map((item, index) => {
                      const maxValue = Math.max(...(adminStats?.salesTrend ? adminStats.salesTrend.map(i => i.value) : [1]));
                      const safeMax = maxValue === 0 ? 1 : maxValue;
                      const heightPercent = (item.value / safeMax) * 100;
                      // Try to format the label as dd.MM or dd.MM.yy if possible
                      let label = item.name;
                      if (/\d{4}-\d{2}-\d{2}/.test(item.name)) {
                        const d = new Date(item.name);
                        label = d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' });
                      }
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all duration-300"
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-center">
                            {label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Operational Notifications */}
            <Card className="bg-white border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-gray-600" />
                  Оперативни известия
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* TODO: Replace with real notifications if available */}
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 rounded-full mt-2 bg-yellow-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Нисък инвентар</p>
                      <p className="text-sm text-gray-600 mt-1">Стелаж #3 има нужда от презареждане</p>
                      <p className="text-xs text-gray-500 mt-1">Преди 2 часа</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-yellow-200 text-yellow-700">Внимание</Badge>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 rounded-full mt-2 bg-green-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Нова продажба</p>
                      <p className="text-sm text-gray-600 mt-1">Продажба #19 завършена успешно</p>
                      <p className="text-xs text-gray-500 mt-1">Преди 1 час</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">Успех</Badge>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 rounded-full mt-2 bg-blue-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Системно съобщение</p>
                      <p className="text-sm text-gray-600 mt-1">Планирана поддръжка утре в 02:00</p>
                      <p className="text-xs text-gray-500 mt-1">Преди 30 мин</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">Инфо</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
