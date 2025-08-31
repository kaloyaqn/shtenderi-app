import LoadingScreen from "@/components/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import TableLink from "@/components/ui/table-link";
import { Banknote } from "lucide-react";

export default function PaymentsTable({ payments, paymentsLoading }) {
  const columns = [
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString("bg-BG") || "-",
    },
    {
      accessorKey: "amount",
      header: "Сума",
      cell: ({ row }) => <>{row.original.amount} лв.</> || "-",
    },
    {
      accessorKey: "cashRegister.storage",
      header: "Каса",
      cell: ({ row }) => {
        let name = row.original.cashRegister.storage.name;
        let id = row.original.cashRegister.storage.id;
        return (
          <>
            <TableLink href={`/dashboard/cash-registers/${id}`}>
              {name}
            </TableLink>
          </>
        );
      },
    },
    {
      accessorKey: "method",
      header: "метод",
      cell: ({ row }) => {
        let method = row.original.method;
        let name;

        if (method === "CASH") {
          name = "Кеш";
        }

        return (
          <>
            {method === "CASH" ? (
              <>
                <p className="flex items-center gap-2"> В брой</p>
              </>
            ) : (
              <>Банка</>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "user.name",
      header: "Каса",
      //   cell: ({ row }) => row.original.missingQuantity,
    },
  ];

  return (
    <>
      <Card className={"pb-0"}>
        <CardHeader>
          <CardTitle className={"mb-4"}>Плащания към тази продажба</CardTitle>
          <CardContent className="px-0">
            {paymentsLoading && (
              <>
                {paymentsLoading ? (
                  <LoadingScreen />
                ) : payments.length === 0 ? (
                  <div className="text-gray-500">Няма плащания.</div>
                ) : (
                  <DataTable columns={columns} data={payments} />
                )}
              </>
            )}
            <DataTable noFilters columns={columns} data={payments} />
          </CardContent>
        </CardHeader>
      </Card>
    </>
  );
}
