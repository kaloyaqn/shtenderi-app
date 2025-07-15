"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  LucideEdit,
  MoreHorizontal,
  Package,
  Printer,
  Search,
  Send,
  Warehouse,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import RevisionProductsTable from "@/app/dashboard/revisions/[revisionId]/_components/RevisionProductsTable";
import CreatePaymentRevisionForm from "@/components/forms/payments-revision/CreatePaymentRevisionForm";
import MobileProductCard from "./MobileProductCard";
import PaymentsTable from "@/components/tables/revisions/PaymentsTable";
import PaymentsTableMobile from "./PaymentsCardMobile";
import PaymentsCardMobile from "./PaymentsCardMobile";

export default function MobilePageRevisionId({
  revision,
  handlePrintStock,
  filteredProducts,
  contentRef,
  totalPaid,
  totalRevisionPrice,
  fetchPayments,
  revisionId,
  handleSendToClient,
  payments
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllActions, setShowAllActions] = useState(false);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                Продажба #{revision.number}
              </h1>
              <p className="text-xs text-gray-500">
                Всички данни за тази продажба
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllActions(!showAllActions)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-1 space-y-3">
        {/* Info Card */}
        <Card className="">
          <CardHeader>
            <CardTitle className="text-sm">Информация за поръчката</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-0">
            <div>
              <span className="text-xs text-gray-500">Партньор</span>
              <p className="text-base font-medium">{revision.partner?.name}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Щанд</span>
                <p className="text-base">{revision.stand?.name || "N/A"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Магазин</span>
                <p className="text-base">{revision.store?.name || "N/A"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Тип</span>
                <p className="text-base">{revision.type || "N/A"}</p>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Ревизор</span>
              <p className="text-base">
                {revision.user?.name || revision.user?.email || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Action Buttons */}
        <Card className={"py-0"}>
          <CardContent className="p-3">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllActions(!showAllActions)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            {showAllActions ? (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-transparent"
                  onClick={handlePrintStock}
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Принтирай
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-transparent"
                  onClick={handleSendToClient}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Изпрати
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-transparent"
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={!!invoice}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {invoice ? "Фактура създадена" : "Фактура"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-transparent"
                  onClick={() =>
                    router.push(`/dashboard/revisions/${revisionId}/edit`)
                  }
                >
                  <LucideEdit className="h-3 w-3 mr-1" />
                  Редактирай
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1 bg-transparent"
                  onClick={handlePrintStock}
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Принтирай
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1 bg-transparent"
                  onClick={() =>
                    router.push(`/dashboard/revisions/${revisionId}/edit`)
                  }
                >
                  <LucideEdit className="h-3 w-3 mr-1" />
                  Редактирай
                </Button>
              </div>
            )}

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white h-8 text-sm"
              onClick={() => setResupplyDialogOpen(true)}
            >
              <Warehouse className="h-3 w-3 mr-2" />
              Зареди от склад
            </Button>
          </CardContent>
        </Card>

        {/* Products Section */}
        <div className="">
          <div className="pb-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text- font-semibold">Продадени продукти</span>
              <Badge
                variant="secondary"
                className="bg-gray-200 text-gray-700 text-xs"
              >
                {revision.missingProducts.length} продукта
              </Badge>
            </div>
          </div>
          <div className="pt-0">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <Input
                placeholder="Потърси..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-8 text-sm bg-white border-gray-300"
              />
            </div>

            {/* Products List */}
            <div className="space-y-2 p-0">
              {filteredProducts.map((mp) => (
                    <MobileProductCard key={mp.id} mp={mp} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Няма намерени продукти.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Payments Section */}
        <CreatePaymentRevisionForm 
        totalPaid={totalPaid} totalRevisionPrice={totalRevisionPrice} fetchPayments={fetchPayments} revisionId={revisionId} revision={revision}
        />

        <div>
        <span className="text- font-semibold">Плащания към тази продажба</span>
            
            <div className="flex flex-col gap-1">

        {payments.map((payment) => (
            <PaymentsCardMobile key={payment.id} payment={payment}/>
        ))}
            </div>
        </div>

        


        {/* Printable Stock Table (always rendered, hidden except for print) */}
        <div
          ref={contentRef}
          className="hidden print:block bg-white p-8 text-black"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold">Стокова № {revision.number}</div>
            <div className="text-md">
              Дата: {new Date(revision.createdAt).toLocaleDateString("bg-BG")}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="mb-2">
              <div className="font-semibold">Доставчик:</div>
              <div>Фирма: Омакс Сълюшънс ЕООД</div>
              <div>ЕИК/ДДС номер: BG200799887</div>
              <div>Седалище: гр. Хасково, ул. Рай №7</div>
            </div>
            <div className="mb-2 text-right">
              <div className="font-semibold">Получател:</div>
              <div>Фирма: {revision.partner?.name || "-"}</div>
              <div>ЕИК/ДДС номер: {revision.partner?.bulstat || "-"}</div>
              <div>Седалище: {revision.partner?.address || "-"}</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Описание:</div>
          </div>
          <RevisionProductsTable
            missingProducts={revision.missingProducts}
            priceLabel="Единична цена с ДДС"
            totalLabel="Обща стойност"
          />
          <div className="mt-6">
            Изготвил: <b>{revision.user?.name || revision.user?.email || ""}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
