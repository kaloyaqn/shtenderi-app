import React from 'react';

export default function RevisionProductsTable({ missingProducts, showTotals = true, className = '', priceLabel = 'Единична цена', totalLabel = 'Обща стойност' }) {
  return (
    <table className={`w-full border border-black mb-4 ${className}`}>
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-black px-2 py-1">Име на продукта</th>
          <th className="border border-black px-2 py-1">EAN код</th>
          <th className="border border-black px-2 py-1">Количество</th>
          <th className="border border-black px-2 py-1">{priceLabel}</th>
          <th className="border border-black px-2 py-1">{totalLabel}</th>
        </tr>
      </thead>
      <tbody>
        {missingProducts && missingProducts.length > 0 ? (
          missingProducts.map(mp => {
            const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
            // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
            const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
            const total = price * quantity;
            return (
              <tr key={mp.id}>
                <td className="border border-black px-2 py-1">{mp.product?.name || '-'}</td>
                <td className="border border-black px-2 py-1">{mp.product?.barcode || '-'}</td>
                <td className="border border-black px-2 py-1 text-center">
                  {mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity}
                </td>
                <td className="border border-black px-2 py-1 text-right">{price.toFixed(2)}</td>
                <td className="border border-black px-2 py-1 text-right">{total.toFixed(2)}</td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="5" className="p-2 border text-center">Няма липсващи продукти.</td>
          </tr>
        )}
      </tbody>
      {showTotals && missingProducts && missingProducts.length > 0 && (
        <tfoot>
          <tr className="font-bold bg-gray-100">
            <td className="p-2 border text-right" colSpan={2}>Общо:</td>
            <td className="p-2 border text-center">
              {missingProducts.reduce((sum, mp) => {
                // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
                const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
                return sum + quantity;
              }, 0)}
            </td>
            <td className="p-2 border"></td>
            <td className="p-2 border text-right">
              {missingProducts.reduce((sum, mp) => {
                const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
                // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
                const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
                return sum + price * quantity;
              }, 0).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
} 