'use client';

import { Button } from "@/components/ui/button";

export default function TestPdfPage() {
  const handleDownloadTestPdf = () => {
    window.open('/api/test-pdf', '_blank');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test PDF Download</h1>
      <p className="mb-6">Click the button below to download a test PDF receipt formatted for a 2-inch (54mm) thermal printer.</p>
      <Button onClick={handleDownloadTestPdf}>
        Download Test PDF
      </Button>
    </div>
  );
} 