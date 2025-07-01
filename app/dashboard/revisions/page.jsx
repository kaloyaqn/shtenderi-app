"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import TableLink from "@/components/ui/table-link";
import { IconDetails, IconEye } from "@tabler/icons-react";
import { RefreshCcw } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import LoadingScreen from "@/components/LoadingScreen";
import BasicHeader from "@/components/BasicHeader";

export default function RevisionsListPage() {
  const [revisions, setRevisions] = useState([]);
  const [stats, setStats] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { data: session } = useSession();

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) {
        toast.error("Грешка при взимането на статистики");
      }
      let data = await res.json();
      console.log(data);
      setStats(data);
    } catch (err) {
      toast.error(err.message);
      throw Error(err);
    }
  };

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const res = await fetch("/api/revisions");
        if (!res.ok) {
          if (res.status === 401) {
            toast.error("Моля, влезте в системата.");
          } else {
            toast.error("Грешка при зареждане на продажби.");
          }
          return;
        }
        let data = await res.json();
        // Flatten for DataTable
        data = data.map((rev) => ({
          ...rev,
          standName: rev.stand?.name || "-",
          partnerName: rev.partner?.name || "-",
          userName: rev.user?.name || rev.user?.email || "-",
        }));
        console.log("Fetched revisions:", data); // DEBUG LOG
        setRevisions(data);
      } catch (error) {
        toast.error("Грешка при зареждане на продажби.");
        console.error("Failed to fetch revisions:", error);
      } finally {
        setLoading(false);
      }
    };
    if (session) {
      fetchRevisions();
      fetchStats();
    }
  }, [session]);

  const columns = [
    {
      accessorKey: "number",
      header: "№",
      cell: ({ row }) => row.original.number,
    },
    {
      accessorKey: "standName",
      header: "Щанд",
      cell: ({ row }) => (
        <TableLink href={`/dashboard/stands/${row.original.stand?.id}`}>
          {row.original.standName}
        </TableLink>
      ),
    },
    {
      accessorKey: "partnerName",
      header: "Партньор",
    },
    {
      accessorKey: "userName",
      header: "Потребител",
    },
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: "missingProducts",
      header: "Продадени продукти",
      cell: ({ row }) => row.original.missingProducts?.length || 0,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="table"
          onClick={() => router.push(`/dashboard/revisions/${row.original.id}`)}
        >
          <IconEye /> Виж
        </Button>
      ),
    },
  ];

  const userIsAdmin = session?.user?.role === "ADMIN";
  if (loading) return <LoadingScreen />;
  if (!loading && revisions.length === 0 && !userIsAdmin) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Продажби</h1>
        <p className="text-gray-50">
          Нямате продажби от зачислените Ви щандове.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <BasicHeader title="Продажби" subtitle="Управление на продажби и зареждане на стока" />

          {userIsAdmin && (
                  <div className="my-4 md:flex-row flex-col flex justify-between items-center gap-2">
                  <Card className="w-full">
                    <CardContent>
                      <CardTitle className="text-lg">Продажби</CardTitle>
                      <h1 className="text-xl font-bold mt-1">
                        {stats && stats.totalSalesValue} лв.
                      </h1>
                    </CardContent>
                  </Card>
                  <Card className="w-full">
                    <CardContent>
                      <CardTitle className="text-lg">Продажби {"(30 дни)"}</CardTitle>
                      <h1 className="text-xl font-bold mt-1">
                        {stats && stats.salesLast30Days} лв.
                      </h1>
                    </CardContent>
                  </Card>
                  <Card className="w-full">
                    <CardContent>
                      <CardTitle className="text-lg">Брой продажби {"(30 дни)"}</CardTitle>
                      <h1 className="text-xl font-bold mt-1">
                        {stats && stats.salesCountLast30Days}
                      </h1>
                    </CardContent>
                  </Card>{" "}
                  <Card className="w-full">
                    <CardContent>
                      <CardTitle className="text-lg">Продукти (30 дни)</CardTitle>
                      <h1 className="text-xl font-bold mt-1">
                        {stats && stats.itemsSoldLast30Days}
                      </h1>
                    </CardContent>
                  </Card>
                </div>
          )}
      <DataTable
        columns={columns}
        data={revisions}
        searchKey="standName"
        filterableColumns={[
          { id: "standName", title: "Щанд" },
          { id: "partnerName", title: "Партньор" },
          { id: "userName", title: "Потребител" },
        ]}
      />
    </div>
  );
}
