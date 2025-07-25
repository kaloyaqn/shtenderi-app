'use client';

import React from 'react';

export const PrintableRevision = React.forwardRef(({ revision }, ref) => {
  if (!revision) return null;

  return (
    <div ref={ref} className="p-8 font-sans bg-white text-black">
      <header className="flex justify-between items-center pb-4 border-b-2 border-black">
        <div>
          {/* You can add a logo here */}
          {/* <img src="/path/to/your/logo.png" alt="Company Logo" className="h-12" /> */}
          <h1 className="text-3xl font-bold">Справка от ревизия</h1>
        </div>
        <div className="text-right">
          <p><strong>№ на ревизия:</strong> {revision.id}</p>
          <p><strong>Дата:</strong> {new Date(revision.createdAt).toLocaleDateString('bg-BG')}</p>
        </div>
      </header>

      <section className="my-6">
        <h2 className="text-xl font-semibold mb-4">Детайли</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Щанд:</strong> {revision.stand?.name || 'N/A'}</div>
          <div><strong>Магазин:</strong> {revision.stand?.store?.name || 'N/A'}</div>
          <div><strong>Партньор:</strong> {revision.partner?.name || 'N/A'}</div>
          <div><strong>Ревизор:</strong> {revision.user?.name || revision.user?.email || 'N/A'}</div>
        </div>
      </section>

      <section className="my-6">
        <h2 className="text-xl font-semibold mb-4">Липсващи продукти</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Продукт</th>
              <th className="p-2 border">Баркод</th>
              <th className="p-2 border text-center">Липсващи бройки</th>
              <th className="p-2 border text-right">Ед. цена (лв.)</th>
              <th className="p-2 border text-right">Обща стойност (лв.)</th>
            </tr>
          </thead>
          <tbody>
            {revision.missingProducts?.length > 0 ? (
              revision.missingProducts.map((mp) => {
                const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
                // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
                const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
                const total = price * quantity;
                return (
                  <tr key={mp.id}>
                    <td className="p-2 border">{mp.product?.name || 'N/A'}</td>
                    <td className="p-2 border">{mp.product?.barcode || 'N/A'}</td>
                    <td className="p-2 border text-center">
                  {mp.givenQuantity !== null && mp.givenQuantity !== mp.missingQuantity ? (
                    <div>
                      <div className="font-semibold">{mp.missingQuantity}</div>
                      <div className="text-xs text-gray-600">(дадено: {mp.givenQuantity})</div>
                    </div>
                  ) : (
                    (mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity)
                  )}
                </td>
                    <td className="p-2 border text-right">{price.toFixed(2)}</td>
                    <td className="p-2 border text-right">{total.toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-2 border text-center">Няма липсващи продукти.</td>
              </tr>
            )}
          </tbody>
          {revision.missingProducts?.length > 0 && (
            <tfoot>
              <tr className="font-bold bg-gray-100">
                <td className="p-2 border text-right" colSpan={2}>Общо:</td>
                <td className="p-2 border text-center">
                  {revision.missingProducts.reduce((sum, mp) => {
                    // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
                    const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
                    return sum + quantity;
                  }, 0)}
                </td>
                <td className="p-2 border"></td>
                <td className="p-2 border text-right">
                  {revision.missingProducts.reduce((sum, mp) => {
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
      </section>

      <footer className="mt-16 pt-8 text-sm">
        <div className="grid grid-cols-2 gap-16">
          <div>
            <p><strong>Предал:</strong></p>
            <div className="mt-12 border-t border-gray-400">
              <p className="text-center">(Подпис)</p>
            </div>
          </div>
          <div>
            <p><strong>Приел:</strong></p>
            <div className="mt-12 border-t border-gray-400">
              <p className="text-center">(Подпис)</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}); 