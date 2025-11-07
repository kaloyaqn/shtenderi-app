"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Phone, User, Building, MapPin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BasicHeader from "@/components/BasicHeader";
import LoadingScreen from "@/components/LoadingScreen";
import DeliveryPartnerOutstandingDebt from "@/components/delivery-partners/outstanding-debt";

export default function DeliveryPartnerViewPage({ params }) {
  const router = useRouter();
  const { partnerId } = use(params);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await fetch(`/api/delivery-partners/${partnerId}`);
        if (!response.ok) throw new Error("Failed to fetch delivery partner");
        const data = await response.json();
        setPartner(data);
      } catch (err) {
        setError("Грешка при зареждане на доставчик");
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [partnerId]);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!partner) return null;

  return (
    <div className="">
      <BasicHeader hasBackButton title={partner.name} subtitle={"Данни за доставчик"}>
        <Button variant={"outline"} onClick={() => router.push(`/dashboard/delivery-partners/${partner.id}/edit`)}>
          <Edit /> Редактирай
        </Button>
      </BasicHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-xl font-bold">
                    {partner.name?.slice(0, 2).toUpperCase() || "ДП"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{partner.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">ID: {partner.id}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Булстат</p>
                      <p className="text-base font-mono">{partner.bulstat || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Лице за контакт</p>
                      <p className="text-base">{partner.contactPerson || "-"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Телефон</p>
                      <a href={`tel:${partner.phone || ""}`} className="text-base text-blue-600 hover:text-blue-800">{partner.phone || "-"}</a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Седалище</p>
                      <p className="text-base text-gray-500">{partner.address || "Не е посочено"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Финанси</CardTitle>
            </CardHeader>
            <CardContent>
              <DeliveryPartnerOutstandingDebt />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Контакти</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">Email: <span className="text-gray-900">{partner.email || '-'}</span></div>
              <div className="text-sm text-gray-600">IBAN BGN: <span className="text-gray-900">{partner.bankAccountBG || '-'}</span></div>
              <div className="text-sm text-gray-600">IBAN EUR: <span className="text-gray-900">{partner.bankAccountEUR || '-'}</span></div>
              <div className="text-sm text-gray-600">Град: <span className="text-gray-900">{partner.city || '-'}</span></div>
              <div className="text-sm text-gray-600">Държава: <span className="text-gray-900">{partner.country || '-'}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

