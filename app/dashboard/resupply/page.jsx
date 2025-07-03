"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Barcode,
  CheckCircle,
  XCircle,
  ArrowRight,
  Package,
  Warehouse,
  Store,
  Scan,
  ArrowLeftRight,
  Loader2,
} from "lucide-react"
import { useSession } from "next-auth/react"
import BasicHeader from "@/components/BasicHeader"

export default function GeneralResupplyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [mode, setMode] = useState("") // No default selection
  const [allStands, setAllStands] = useState([])
  const [allStorages, setAllStorages] = useState([])
  const [sourceId, setSourceId] = useState("")
  const [destinationId, setDestinationId] = useState("")
  const [productsInSource, setProductsInSource] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [barcodeInput, setBarcodeInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCheck, setShowCheck] = useState(false)
  const [showError, setShowError] = useState(false)
  const barcodeInputRef = useRef()
  const [isMobile, setIsMobile] = useState(false)
  const [step, setStep] = useState(1)

  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 768)
    }

    handleMode();
  }, [])

  // Fetch all stands and storages on mount
  useEffect(() => {
    setLoading(true)
    Promise.all([fetch("/api/stands").then((res) => res.json()), fetch("/api/storages").then((res) => res.json())])
      .then(([standsData, storagesData]) => {
        setAllStands(standsData)
        setAllStorages(storagesData)
      })
      .catch(() => toast.error("Грешка при зареждане на данни."))
      .finally(() => setLoading(false))
  }, [])

  // Fetch products for the selected source
  useEffect(() => {
    if (!sourceId || !mode) return
    setProductsInSource([])
    setSelectedProducts([])
    setLoading(true)

    let url = ""
    if (mode === "stand-to-stand") url = `/api/stands/${sourceId}/products`
    if (mode === "storage-to-storage" || mode === "storage-to-stand") url = `/api/storages/${sourceId}/products`

    if (!url) return

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProductsInSource(data)
        setTimeout(() => {
          barcodeInputRef.current?.focus()
        }, 100)
      })
      .catch(() => toast.error("Грешка при зареждане на продукти"))
      .finally(() => setLoading(false))
  }, [sourceId, mode])


  const handleMode = () => {
    let source = searchParams.get('source');

    if (source === 'stand') {
        setMode('stand-to-stand')
    } else if (source === 'storage') {
        setMode("storage-to-stand")
    }

  }

  // Handle barcode scan
  const handleBarcodeScanned = (e) => {
    if (e.key === "Enter" && barcodeInput) {
      e.preventDefault()
      const productInSource = productsInSource.find((p) => (p.product?.barcode || p.barcode) === barcodeInput)

      if (!productInSource) {
        toast.error("Продукт с този баркод не е намерен в източника.")
        setShowError(true)
        try {
          new Audio("/error.mp3").play()
        } catch {}
        setTimeout(() => setShowError(false), 1200)
        setBarcodeInput("")
        return
      }

      const productId = productInSource.product?.id || productInSource.id
      const existingProduct = selectedProducts.find((p) => p.productId === productId)
      const currentQuantity = existingProduct?.quantity || 0
      const maxQty = productInSource.quantity || productInSource.maxQuantity || 0

      if (currentQuantity >= maxQty) {
        toast.warning(
          `Достигнато е максималното налично количество за ${productInSource.product?.name || productInSource.name}.`,
        )
        setShowError(true)
        try {
          new Audio("/error.mp3").play()
        } catch {}
        setTimeout(() => setShowError(false), 1200)
      } else {
        handleProductQuantityChange(
          productId,
          String(currentQuantity + 1),
          true, // moveToTop
        )
        setShowCheck(true)
        try {
          new Audio("/success.mp3").play()
        } catch {}
        setTimeout(() => setShowCheck(false), 1200)
      }

      setBarcodeInput("")
    }
  }

  // Move to top logic
  const handleProductQuantityChange = (productId, newQuantity, moveToTop = false) => {
    const product = productsInSource.find((p) => (p.product?.id || p.id) === productId)
    if (!product) return

    const maxQty = product.quantity || product.maxQuantity || 0
    const existingIndex = selectedProducts.findIndex((p) => p.productId === productId)
    const qty = Math.max(0, Math.min(Number.parseInt(newQuantity, 10) || 0, maxQty))

    if (qty === 0) {
      setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId))
      return
    }

    if (existingIndex > -1) {
      let updated = [...selectedProducts]
      updated[existingIndex].quantity = qty
      if (moveToTop) {
        const [item] = updated.splice(existingIndex, 1)
        updated = [item, ...updated]
      }
      setSelectedProducts(updated)
    } else {
      setSelectedProducts((prev) => [
        { productId, name: product.product?.name || product.name, quantity: qty, maxQuantity: maxQty },
        ...prev,
      ])
    }
  }

  // Sort products: selected first, then unselected
  const selectedIds = selectedProducts.map((sp) => sp.productId)
  const sortedProducts = [
    ...productsInSource.filter((p) => selectedIds.includes(p.product?.id || p.id)),
    ...productsInSource.filter((p) => !selectedIds.includes(p.product?.id || p.id)),
  ]

  // Step 1: Pick mode (always visible, no default)
  const handleModeChange = (val) => {
    setMode(val)
    setSourceId("")
    setDestinationId("")
    setProductsInSource([])
    setSelectedProducts([])
    setBarcodeInput("")
    setStep(1)
  }

  const getSourceName = () => {
    if (mode === "stand-to-stand") {
      const stand = allStands.find((s) => s.id === sourceId)
      return stand ? `${stand.name}${stand.store?.name ? ` — ${stand.store.name}` : ""}` : ""
    }
    if (mode === "storage-to-storage" || mode === "storage-to-stand") {
      const storage = allStorages.find((s) => s.id === sourceId)
      return storage?.name || ""
    }
    return ""
  }

  const getDestinationName = () => {
    if (mode === "stand-to-stand" || mode === "storage-to-stand") {
      const stand = allStands.find((s) => s.id === destinationId)
      return stand ? `${stand.name}${stand.store?.name ? ` — ${stand.store.name}` : ""}` : ""
    }
    if (mode === "storage-to-storage") {
      const storage = allStorages.find((s) => s.id === destinationId)
      return storage?.name || ""
    }
    return ""
  }

  const handleSubmit = async () => {
    if (!sourceId || !destinationId) {
      toast.error("Моля, изберете източник и дестинация.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Моля, изберете продукти.");
      return;
    }
    setLoading(true);
    try {
      let payload, url, method = "POST";
      if (mode === "storage-to-stand") {
        payload = {
          sourceStorageId: sourceId,
          destinationStandId: destinationId,
          products: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity })),
        };
        url = "/api/resupply";
      } else if (mode === "stand-to-stand") {
        payload = {
          sourceStandId: sourceId,
          destinationStandId: destinationId,
          products: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity })),
        };
        url = "/api/stands/transfer";
      } else if (mode === "storage-to-storage") {
        payload = {
          sourceStorageId: sourceId,
          destinationId: destinationId,
          destinationType: "STORAGE",
          products: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity })),
        };
        url = "/api/storages/transfer";
      } else {
        toast.error("Невалиден тип трансфер.");
        setLoading(false);
        return;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Грешка при трансфер.");
      }
      toast.success("Трансферът е успешен!");
      // Optionally redirect or reset state
      setMode("");
      setSourceId("");
      setDestinationId("");
      setProductsInSource([]);
      setSelectedProducts([]);
      setBarcodeInput("");
      setStep(1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {/* Header */}

      <BasicHeader title={"Трансфер на продукти"} subtitle="Прехвърляне на продукти между щендери и складове" /> 

      {/* Main Content */}
      <div className="">
        <div className="space-y-6">
          {/* Step 1: Transfer Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ArrowLeftRight className="h-5 w-5 mr-2 text-gray-700" />
                Изберете тип трансфер
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} className="w-full" onValueChange={handleModeChange}>
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
                  <TabsTrigger value="stand-to-stand" className="flex items-center space-x-2 py-3">
                    <Store className="h-4 w-4" />
                    <span>Между щандове</span>
                  </TabsTrigger>
                  <TabsTrigger value="storage-to-storage" className="flex items-center space-x-2 py-3">
                    <Warehouse className="h-4 w-4" />
                    <span>Между складове</span>
                  </TabsTrigger>
                  <TabsTrigger value="storage-to-stand" className="flex items-center space-x-2 py-3">
                    <Package className="h-4 w-4" />
                    <span>Склад → Щанд</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {mode && (
            <>
              {/* Step 2: Source and Destination Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Изберете източник и дестинация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex md:flex-row flex-col items-end justify-between w-full gap-4">
                    {/* Source Selection */}
                    <div className="w-full">
                      <label className="text-sm font-medium text-gray-700">
                        {mode === "stand-to-stand" ? "Изходен щанд" : "Изходен склад"}
                      </label>
                      {mode === "stand-to-stand" && (
                        <Select value={sourceId} onValueChange={setSourceId} className="w-full">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Изберете изходен щанд..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allStands.map((stand) => (
                              <SelectItem key={stand.id} value={stand.id}>
                                {stand.name} {stand.store?.name ? `— ${stand.store.name}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {(mode === "storage-to-storage" || mode === "storage-to-stand") && (
                        <Select value={sourceId} onValueChange={setSourceId} className="w-full">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Изберете изходен склад..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allStorages.map((storage) => (
                              <SelectItem key={storage.id} value={storage.id}>
                                {storage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="hidden mb-1.5 md:flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>

                    {/* Destination Selection */}
                    <div className="w-full space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        {mode === "storage-to-storage" ? "Дестинация склад" : "Дестинация щанд"}
                      </label>
                      {mode === "stand-to-stand" && (
                        <Select value={destinationId} onValueChange={setDestinationId} className="w-full">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Изберете дестинация щанд..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allStands
                              .filter((s) => s.id !== sourceId)
                              .map((stand) => (
                                <SelectItem key={stand.id} value={stand.id}>
                                  {stand.name} {stand.store?.name ? `— ${stand.store.name}` : ""}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                      {mode === "storage-to-storage" && (
                        <Select value={destinationId} onValueChange={setDestinationId} className="w-full">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Изберете дестинация склад..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allStorages
                              .filter((s) => s.id !== sourceId)
                              .map((storage) => (
                                <SelectItem key={storage.id} value={storage.id}>
                                  {storage.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                      {mode === "storage-to-stand" && (
                        <Select value={destinationId} onValueChange={setDestinationId} className="w-full">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Изберете дестинация щанд..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allStands.map((stand) => (
                              <SelectItem key={stand.id} value={stand.id}>
                                {stand.name} {stand.store?.name ? `— ${stand.store.name}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {/* Transfer Summary */}
                  {sourceId && destinationId && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-blue-900">От:</div>
                          <div className="text-blue-700">{getSourceName()}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-blue-900">До:</div>
                          <div className="text-blue-700">{getDestinationName()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 3: Product Selection */}
              {sourceId && destinationId && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        <Scan className="h-5 w-5 mr-2 text-gray-700" />
                        Добавете продукти
                      </CardTitle>
                      {selectedProducts.length > 0 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {selectedProducts.length} избрани
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Barcode Scanner */}
                    <div className="relative">
                      <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Сканирайте баркод..."
                        className="pl-10 h-12 text-base"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        onKeyDown={handleBarcodeScanned}
                        disabled={loading}
                        ref={barcodeInputRef}
                        inputMode={isMobile ? "none" : undefined}
                      />
                    </div>

                    {/* Success/Error Indicators */}
                    {showCheck && (
                      <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg border border-green-200 animate-pulse">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Успешно добавен продукт</span>
                      </div>
                    )}

                    {showError && (
                      <div className="flex items-center gap-2 text-red-600 p-3 bg-red-50 rounded-lg border border-red-200 animate-pulse">
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">Грешка при добавяне</span>
                      </div>
                    )}

                    {/* Products List */}
                    {productsInSource.length > 0 && (
                      <div className="space-y-3">
                        <Separator />
                        <div className="text-sm font-medium text-gray-700">
                          Налични продукти ({productsInSource.length})
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {sortedProducts.map((p) => {
                            const selected = selectedProducts.find((sp) => sp.productId === (p.product?.id || p.id))
                            return (
                              <div
                                key={p.product?.id || p.id}
                                className={`rounded-lg border p-4 transition-all ${
                                  selected
                                    ? "bg-yellow-50 border-yellow-300 shadow-sm"
                                    : "bg-white border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 text-sm mb-1">
                                      {p.product?.name || p.name}
                                    </div>
                                    <div className="text-xs text-gray-500 font-mono">
                                      {p.product?.barcode || p.barcode}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3 ml-4">
                                    <div className="flex items-center space-x-2">
                                      <Input
                                        type="number"
                                        min={0}
                                        max={p.quantity || p.maxQuantity}
                                        value={selected?.quantity || ""}
                                        onChange={(e) =>
                                          handleProductQuantityChange(p.product?.id || p.id, e.target.value, true)
                                        }
                                        className="w-16 text-center text-sm"
                                        disabled={loading}
                                        placeholder="0"
                                      />
                                      <span className="text-xs text-gray-500 whitespace-nowrap">
                                        / {p.quantity || p.maxQuantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Transfer Button */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {selectedProducts.length > 0 && (
                            <span>
                              Общо {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} продукта за трансфер
                            </span>
                          )}
                        </div>
                        <Button
                          size="lg"
                          onClick={handleSubmit}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <ArrowLeftRight className="" />
                          )}
                          {loading ? "Прехвърляне..." : "Прехвърли"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
