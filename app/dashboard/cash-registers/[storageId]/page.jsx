"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import BasicHeader from "@/components/BasicHeader";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import TableLink from "@/components/ui/table-link";
import { Button } from "@/components/ui/button";
import { IconCashPlus } from "@tabler/icons-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LoadingScreen from "@/components/LoadingScreen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CashRegisterDetailPage() {
  const { storageId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read from URL or fallback to today
  const initialFrom =
    searchParams.get("from") || new Date().toISOString().slice(0, 10);
  const initialTo =
    searchParams.get("to") || new Date().toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [cashRegister, setCashRegister] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [invoices, setInvoices] = useState({});
  const [type, setType] = useState("");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", fromDate);
    params.set("to", toDate);
    params.set("type", type)
    router.replace(`?${params.toString()}`, { shallow: true });
  }, [fromDate, toDate]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/cash-registers/${storageId}`)
      .then((res) => res.json())
      .then(setCashRegister)
      .finally(() => setLoading(false));
  }, [storageId]);

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      let url = `/api/cash-registers/${storageId}/activity`;
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (type) params.set("type", type);
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setActivity(data);
      setLoading(false);
    }
    if (storageId && fromDate && toDate) fetchActivity();
  }, [storageId, fromDate, toDate, type]);

  // Fetch all invoices for the revisions in the activity
  useEffect(() => {
    async function fetchInvoicesForRevisions() {
      const revisionNumbers = Array.from(
        new Set(
          activity
            .filter((a) => a.revision?.number)
            .map((a) => a.revision.number)
        )
      );
      if (revisionNumbers.length === 0) return;
      const params = new URLSearchParams();
      revisionNumbers.forEach((n) => params.append("revisionNumber", n));
      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      // Map revisionNumber to invoice
      const invoiceMap = {};
      data.forEach((inv) => {
        invoiceMap[inv.revisionNumber] = inv;
      });
      setInvoices(invoiceMap);
    }
    fetchInvoicesForRevisions();
  }, [activity]);

  if (loading && !cashRegister) return <LoadingScreen />;
  if (!cashRegister) return <></>;

  // Calculate running total
  let runningTotal = 0;
  const breakdown = activity
    .slice()
    .reverse()
    .map((ev) => {
      let amount = ev.amount;
      if (ev.type === "cash_movement") {
        amount = ev.cashMovementType === "DEPOSIT" ? ev.amount : -ev.amount;
      }
      runningTotal += amount;
      return { ...ev, runningTotal };
    })
    .reverse();

  const breakdownColumns = [
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) =>
        (() => {
          let variant = "destructive";
          if (row.original.type === "payment") {
            variant = "success";
          } else if (row.original.cashMovementType === "DEPOSIT") {
            variant = "danger";
          } else if (row.original.cashMovementType === "WITHDRAWAL") {
            variant = "destructive";
          }
          return (
            <Badge variant={variant}>
              {row.original.type === "payment"
                ? "Плащане"
                : row.original.cashMovementType === "DEPOSIT"
                ? "Приход"
                : row.original.cashMovementType === "WITHDRAWAL"
                ? "Разход"
                : "Теглене"}
            </Badge>
          );
        })(),
    },
    {
      accessorKey: "amount",
      header: "Сума",
      cell: ({ row }) => {
        let amount = row.original.amount;
        if (row.original.type === "cash_movement") {
          amount =
            row.original.cashMovementType === "DEPOSIT"
              ? row.original.amount
              : -row.original.amount;
        }
        return (amount > 0 ? "+" : "") + amount;
      },
    },
    {
      accessorKey: "reason",
      header: "Основание",
      cell: ({ row }) =>
        row.original.type === "payment" ? (
          row.original.revision && row.original.revision.number ? (
            <TableLink href={`/dashboard/revisions/${row.original.revisionId}`}>
              {" "}
              Продажба №{row.original.revision.number}
            </TableLink>
          ) : (
            "-"
          )
        ) : (
          row.original.reason || "-"
        ),
    },
    {
      accessorKey: "user",
      header: "Потребител",
      cell: ({ row }) =>
        row.original.user?.name || row.original.user?.email || "-",
    },
    {
      accessorKey: "invoiceId",
      header: "Фактура",
      cell: ({ row }) => {
        // Find invoice by revision number
        const revNum = row.original.revision?.number;
        const invoice = revNum ? invoices[revNum] : null;
        return invoice ? (
          <TableLink href={`/dashboard/invoices/${invoice.id}`}>
            {invoice.invoiceNumber}
          </TableLink>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "runningTotal",
      header: "Баланс след операция",
      cell: ({ row }) => row.original.runningTotal,
    },
  ];

  return (
    <div className="container mx-auto">
      <BasicHeader
        hasBackButton
        title={`Каса за склад: ${
          cashRegister.storage?.name || cashRegister.storageId
        }`}
        subtitle="Детайли и разбивка на касата"
      >
        <Link
          href={`${window.location.pathname.replace(
            /\/$/,
            ""
          )}/cash-movement-create`}
          className="md:w-auto w-full"
        >
          <Button className="md:w-auto w-full">
            <IconCashPlus /> Добави движение
          </Button>
        </Link>
      </BasicHeader>

      <div className="grid  md:grid-cols-12 grid-cols-1 md:gap-4 gap-2 mb-4">
        <Card className={"gap-[-1] md:col-span-3 col-span-1 md:w-auto w-full"}>
          <CardHeader className={"font-medium text-gray-800"}>
            Пари в касата
          </CardHeader>
          <CardContent className={"justify-end"}>
            <h2 className="text-3xl font-bold">
              {cashRegister.cashBalance} лв.
            </h2>
          </CardContent>
        </Card>

        <Card className={"gap-[-1] md:col-span-9 col-span-1"}>
          {/* <CardHeader className={'font-medium text-gray-800'}>
            Филтрирай период
          </CardHeader> */}
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <div className="w-full">
                <Label className="mb-2">От дата:</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>

              <div className="w-full">
                <Label className="mb-2">До дата:</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <DataTable
          searchKey={"type"}
          columns={breakdownColumns}
          data={breakdown}
          extraFilters={(
            <>
              <Select onValueChange={setType} value={type}>
                <SelectTrigger>
                  <SelectValue
                    placeholder="Избери тип"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Всички
                  </SelectItem>
                  <SelectItem value="payment">
                    Плащане
                  </SelectItem>
                  <SelectItem value="deposit">
                    Приход
                  </SelectItem>
                  <SelectItem value="withdrawal">
                    Разход
                  </SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        />
      </div>
    </div>
  );
}
