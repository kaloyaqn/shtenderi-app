"use client";

import { useState, useEffect } from "react";
import { useRouter, use } from "next/navigation";
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
import { Combobox } from "@/components/ui/combobox";
import { Plus } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export default function EditStorePage({ params }) {
  const router = useRouter();
  const { storeId } = params;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // store + fields
  const [store, setStore] = useState(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");

  // relations
  const [partnerId, setPartnerId] = useState("");
  const [partners, setPartners] = useState([]);

  const [cities, setCities] = useState([]);
  const [cityId, setCityId] = useState("");

  const [channels, setChannels] = useState([]);
  const [channelId, setChannelId] = useState("");

  // load channels via SWR
  const { data: channelsData } = useSWR("/api/channels", fetcher);

  useEffect(() => {
    if (channelsData) {
      setChannels(channelsData);
    }
  }, [channelsData]);

  // fetch main data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, partnersRes, citiesRes] = await Promise.all([
          fetch(`/api/stores/${storeId}`),
          fetch("/api/partners"),
          fetch("/api/cities"),
        ]);

        if (!storeRes.ok) throw new Error();
        if (!partnersRes.ok) throw new Error();
        if (!citiesRes.ok) throw new Error();

        const storeData = await storeRes.json();
        const partnersData = await partnersRes.json();
        const citiesData = await citiesRes.json();

        setStore(storeData);
        setPartners(partnersData);
        setCities(citiesData);

        // fill fields
        setName(storeData.name);
        setAddress(storeData.address);
        setContact(storeData.contact || "");
        setPhone(storeData.phone || "");

        setPartnerId(storeData.partnerId);
        setCityId(storeData.cityId || "");

        // channel ❗
        setChannelId(storeData.channelId || "");
      } catch (err) {
        setError("Грешка при зареждане на данни");
      }
    };

    fetchData();
  }, [storeId]);

  // create city
  async function createCity(name) {
    try {
      const res = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Грешка при създаване на град");

      const newCity = await res.json();
      setCities((prev) => [...prev, newCity]);
      setCityId(newCity.id);
    } catch (err) {
      setError(err.message);
    }
  }

  // create channel FIXED
  async function createChannel(name) {
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Грешка при създаване на канал");

      const newChannel = await res.json();
      setChannels((prev) => [...prev, newChannel]);
      setChannelId(newChannel.id);
    } catch (err) {
      setError(err.message);
    }
  }

  // submit FIXED (NO FORMDATA)
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      name: name.trim(),
      address: address.trim(),
      contact: contact.trim(),
      phone: phone.trim(),
      partnerId,
      cityId: cityId || null,
      channelId: channelId || null,
    };

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      router.push("/dashboard/stores");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!store) return <div>Зареждане...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Редактирай магазин</CardTitle>
            <CardDescription>Редактирайте информацията за магазина</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">

                <div className="grid gap-2">
                  <Label>Име *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Въведи име на магазин"
                  />
                </div>

                {/* CHANNEL COMBOBOX (FIXED) */}
                <div className="grid gap-2">
                  <Label>Сегмент/Канал *</Label>
                  <Combobox
                    value={channelId}
                    onValueChange={setChannelId}
                    options={channels?.map((ch) => ({
                      key: ch.id,
                      label: ch.name,
                      value: ch.id,
                    }))}
                    placeholder="Изберете канал"
                    emptyContent={(text) => (
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full mx-4"
                        onClick={() => createChannel(text)}
                      >
                        <Plus /> Създай сегмент/канал "{text}"
                      </Button>
                    )}
                  />
                </div>

                {/* CITY */}
                <div className="grid gap-2">
                  <Label>Град *</Label>
                  <Combobox
                    value={cityId}
                    onValueChange={setCityId}
                    options={cities.map((c) => ({
                      key: c.id,
                      label: c.name,
                      value: c.id,
                    }))}
                    placeholder="Изберете град"
                    emptyContent={(text) => (
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full mx-4"
                        onClick={() => createCity(text)}
                      >
                        <Plus /> Създай град "{text}"
                      </Button>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Адрес *</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Въведи адрес"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Лице за контакт</Label>
                  <Input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Въведи лице за контакт"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Телефон</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Въведи телефон"
                  />
                </div>

                {/* PARTNER */}
                <div className="grid gap-2">
                  <Label>Партньор *</Label>
                  <Combobox
                    value={partnerId}
                    onValueChange={setPartnerId}
                    options={partners.map((p) => ({
                      key: p.id,
                      value: p.id,
                      label: p.name,
                    }))}
                    placeholder="Избери партньор"
                  />
                </div>
              </div>

              {error && <div className="text-red-500">{error}</div>}

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Отказ
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Запазване..." : "Запази"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
