"use client";

import { useEffect } from "react";
import { Button } from "../ui/button";
import { DownloadIcon } from "lucide-react";

export default function PrintStockButton({ missingProducts, revisionNumber }) {
  useEffect(() => {
    if (Array.isArray(missingProducts)) {
      console.log("Full missingProducts array:", missingProducts);
      missingProducts.forEach((product, index) => {
        console.log(`--- Product ${index + 1} ---`);
        console.log("Name:", product.product?.name || "N/A");
        console.log("Quantity:", product.missingQuantity || 0);
        console.log(
          "Price:",
          product.priceAtSale ?? product.product?.clientPrice ?? 0
        );
      });
    } else {
      console.log("produkti is not an array yet:", missingProducts);
    }
  }, [missingProducts]);

  const handlePrint = async () => {
    const response = await fetch("/api/test-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: Array.isArray(missingProducts)
          ? missingProducts.map((product) => ({
              name: product.product?.name || "N/A",
              quantity: product.missingQuantity || 0,
              price: product.priceAtSale ?? product.product?.clientPrice ?? 0,
            }))
          : [],
        revisionNumber: revisionNumber,
      }),
    });

    if (!response.ok) {
      alert("Failed to generate PDF");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${revisionNumber}-receipt.pdf`; // Hardcoded for now
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button
        size="sm"
        className="w-full text-xs"
        variant={"outline"}
        type="button"
        onClick={handlePrint}
      >
        <DownloadIcon />
        Свали PDF
      </Button>
    </>
  );
}
