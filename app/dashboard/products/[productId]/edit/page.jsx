"use client";

import { useState, useEffect } from "react";
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
import LoadingScreen from "@/components/LoadingScreen";

// The image field in your form is just a text input for a URL (type='link' is not a valid input type in HTML, so it falls back to text).
// If you want to preview the image, you need to render an <img> tag with the value of the image field.
// Also, make sure the value you enter is a valid image URL.

export default function EditProductPage({
  productId,
  fetchProducts,
  onProductUpdated,
  rowId,
  setUpdatedRowId
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState(""); // for live preview

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);
        setImageUrl(data.image || "");
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Грешка при зареждане на продукт");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name")?.trim(),
      barcode: formData.get("barcode")?.trim(),
      pcd: formData.get("pcd")?.trim() || null,
      active: formData.get("active") === "on",
      clientPrice: Number(formData.get("clientPrice")),
      deliveryPrice: Number(formData.get("deliveryPrice")),
      image: formData.get("image"),
    };

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Грешка при редактиране на продукт");
      }

      onProductUpdated(result);
      setUpdatedRowId(rowId)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return <LoadingScreen />
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          {rowId}
          <Label htmlFor="name">Име *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={product.name}
            placeholder="Въведете име на продукта"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="barcode">Баркод *</Label>
          <Input
            id="barcode"
            name="barcode"
            required
            defaultValue={product.barcode}
            placeholder="Сканирайте или въведете баркод"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="pcd">Препоръчителна цена (ПЦД)</Label>
          <Input
            id="pcd"
            name="pcd"
            defaultValue={product.pcd || ""}
            placeholder="Въведете ПЦД"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="clientPrice">Клиентска цена *</Label>
          <Input
            id="clientPrice"
            name="clientPrice"
            type="number"
            step="0.01"
            required
            defaultValue={product.clientPrice || ""}
            placeholder="0.00"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="deliveryPrice">Доставна цена *</Label>
          <Input
            id="deliveryPrice"
            name="deliveryPrice"
            type="number"
            step="0.01"
            required
            defaultValue={product.deliveryPrice || ""}
            placeholder="0.00"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="image">Снимка (URL)</Label>
          <Input
            id="image"
            name="image"
            type="text"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            autoComplete="off"
          />
          {/* Show image preview if valid URL */}
          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Преглед на снимката"
                style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, border: "1px solid #eee" }}
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="active">Активен продукт</Label>
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={product.active}
            className="w-5 h-5"
          />
          <span className="text-xs text-muted-foreground">
            Ако продуктът е неактивен, няма да се показва в щандове и ревизии.
          </span>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отказ
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Запазване..." : "Запази"}
        </Button>
      </div>
    </form>
  );
}