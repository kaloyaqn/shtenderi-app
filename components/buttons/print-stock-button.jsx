"use client";

import { useEffect } from "react";
import { Button } from "../ui/button";

export default function PrintStockButton({missingProducts}) {

    useEffect(() => {
        if (Array.isArray(missingProducts)) {
            console.log('Full missingProducts array:', missingProducts);
            missingProducts.forEach((product, index) => {
                console.log(`--- Product ${index + 1} ---`);
                console.log('Name:', product.product?.name || 'N/A');
                console.log('Quantity:', product.missingQuantity || 0);
                console.log('Price:', product.priceAtSale ?? product.product?.clientPrice ?? 0);
            });
        } else {
            console.log('produkti is not an array yet:', missingProducts);
        }
    }, [missingProducts])

    const handlePrint = async () => {
        try {
            const response = await fetch('/api/test-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    products: Array.isArray(missingProducts)
                        ? missingProducts.map(product => ({
                            name: product.product?.name || "N/A",
                            quantity: product.missingQuantity || 0,
                            price: product.priceAtSale ?? product.product?.clientPrice ?? 0,
                        }))
                        : [],
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'receipt.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF Download Error:", error);
            // Optionally show a toast here
        }
    };

    return (
        <>
            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs flex-1 bg-transparent"
            onClick={handlePrint}>
                Свали PDF
            </Button>
        </>
    )
}
