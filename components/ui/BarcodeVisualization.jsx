import React from 'react';
import Barcode from 'react-barcode';

/**
 * BarcodeVisualization component that creates a scannable barcode
 * using the react-barcode library with proper encoding standards
 */
export default function BarcodeVisualization({ barcode, className = '' }) {
  if (!barcode || barcode === '-') {
    return <div className={`text-xs text-gray-400 ${className}`}>Няма баркод</div>;
  }

  // Clean the barcode string (remove any non-numeric characters for EAN-13)
  const cleanBarcode = barcode.toString().replace(/\D/g, '');
  
  // Determine the best barcode format based on length
  const getBarcodeFormat = (code) => {
    if (code.length === 8) return 'EAN8';
    if (code.length === 13) return 'EAN13';
    if (code.length === 12) return 'UPC';
    if (code.length <= 20) return 'CODE128';
    return 'CODE128'; // Default fallback
  };

  const format = getBarcodeFormat(cleanBarcode);

  return (
    <div className={`inline-block ${className}`}>
      <Barcode
        value={cleanBarcode}
        format={format}
        width={1.5}
        height={40}
        displayValue={true}
        fontSize={10}
        margin={0}
        background="#ffffff"
        lineColor="#000000"
      />
    </div>
  );
}
