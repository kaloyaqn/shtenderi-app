"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCode from "react-qr-code";
import { useReactToPrint } from "react-to-print";
import { Plus, PrinterIcon } from "lucide-react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";

export default function EditStandPage({ params }) {
  const router = useRouter();
  const { standId } = use(params);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stand, setStand] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [email, setEmail] = useState("");
  const [regionId, setRegionId] = useState("");

  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const { data: regions, isLoading, error: swrError } = useSWR('/api/regions', fetcher);

  async function createRegion(name) {
    try {
      const res = await fetch("/api/regions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) throw new Error("Грешка при създаване на регион")

      const newRegion = await res.json();

      mutate("/api/regions");
      setRegionId(newRegion.id);

    }
    catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    async function fetchStandAndStores() {
      setLoading(true);
      try {
        // Fetch stand details
        const standResponse = await fetch(`/api/stands/${standId}`);
        if (!standResponse.ok) throw new Error("Failed to fetch stand");
        const standData = await standResponse.json();
        setStand(standData);
        setRegionId(standData?.region?.id)
        setSelectedStore(standData.storeId);
        setEmail(standData.email || "");

        // Fetch all stores for the dropdown
        const storesResponse = await fetch("/api/stores");
        if (!storesResponse.ok) throw new Error("Failed to fetch stores");
        const storesData = await storesResponse.json();
        setStores(storesData);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Грешка при зареждане на данните");
      } finally {
        setLoading(false);
      }
    }

    fetchStandAndStores();
  }, [standId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) {
      setError("Моля, изберете магазин");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name")?.trim(),
      regionId: regionId,
      storeId: selectedStore,
      email: email.trim(),
    };

    try {
      const response = await fetch(`/api/stands/${standId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Грешка при редактиране на щанд");
      }

      router.push("/dashboard/stands");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stand) {
    return <div>Зареждане...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (!stand) {
    return <div>Щандът не е намерен.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Редактирай щанд</CardTitle>
            <CardDescription>
              Редактирайте информацията за щанда
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="region">Регион на щанда</Label>
                    <Combobox
                    value={regionId}
                    onValueChange={(value) => setRegionId(value)}
                    options={regions?.map((region) => ({
                      key: region.id,
                      label: region.name,
                      value: region.id
                    }))}
                    placeholder="Избери регион"
                    emptyContent={(text) => (
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full mx-4"
                        onClick={() => createRegion(text)}
                      >
                        <Plus /> Създай регион "{text}"
                      </Button>
                    )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Име на щанда *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      defaultValue={stand.name}
                      placeholder="Въведете име на щанда"
                    />
                  </div>

                  <div className="grid gap-2 w-full">
                    <Label htmlFor="store">Магазин *</Label>
                    <Select
                      onValueChange={setSelectedStore}
                      value={selectedStore}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Изберете магазин" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name} ({store.address})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Имейл на щанда</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Въведете имейл на щанда (по избор)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {error && !loading && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Отказ
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Запазване..." : "Запази"}
                </Button>
              </div>
            </form>
            {/* QR code for stand URL */}
            <div className="flex flex-col items-center mt-8">
              <div className="mb-2 font-semibold">
                QR код за ревизия на щанд:
              </div>
              <QRCode
                ref={contentRef}
                value={`https://stendo.bg/dashboard/stands/${stand.id}/revision`}
                size={180}
              />
              <div className="mt-2 text-xs text-gray-500">
                https://shtenderi-app-production.up.railway.app/dashboard/stands/
                {stand.id}/revision
              </div>
            </div>

            <Button
              onClick={reactToPrintFn}
              variant={"outline"}
              className={"w-full mt-2 cursor-pointer"}
            >
              <PrinterIcon /> Принт
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
