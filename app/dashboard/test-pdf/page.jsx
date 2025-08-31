'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";

const sampleProducts = [
  { name: 'Гумен елемент с дълго име', quantity: 1, price: 10.00 },
  { name: 'Хоризонтален кабел', quantity: 2, price: 25.50 },
  { name: 'Вертикален конектор', quantity: 5, price: 1.20 },
];

export default function TestPdfPage() {
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async () => {
    const res = await fetch('/api/email/weekly', { method: 'POST' });
    const data = await res.json();
    console.log(data);
}

  const handleDownloadDynamicPdf = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mushroom-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: sampleProducts }),
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
      // You could show an error toast here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Dynamic PDF Download</h1>
      <p className="mb-6">Click the button to generate and download a PDF receipt using a sample list of products.</p>
      <Button onClick={handleDownloadDynamicPdf} disabled={loading}>
        {loading ? 'Generating...' : 'Download Dynamic PDF'}
      </Button>

        <button
        onClick={sendTestEmail}
        >test</button>
    </div>
  );
} 