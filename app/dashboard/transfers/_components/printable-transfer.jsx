'use client';

import React from 'react';

// This component is designed to be printed.
export const PrintableTransfer = React.forwardRef(({ transfer }, ref) => {
    
    if (!transfer) return null;

    console.log('transfer', transfer)

    const products = Array.isArray(transfer.products) ? transfer.products : [];
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = products.reduce((sum, p) => sum + p.quantity * (p.product.clientPrice || 0), 0);

    return (
        <div ref={ref} className="p-8 bg-white text-black text-sm">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Документ ЗА Трансфер</h1>
                <p className="text-gray-600">
                    № {transfer.id.substring(0, 8).toUpperCase()} / {new Date(transfer.createdAt).toLocaleDateString('bg-BG')}
                </p>
            </div>

            {/* From/To Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="border border-gray-300 p-4 rounded">
                    <div className="font-bold bg-gray-200 -m-4 p-2 mb-4 rounded-t">Източник</div>
                    <div className="grid grid-cols-2 gap-x-4">
                        <span className="font-semibold">Име:</span>
                        <span>{transfer.sourceStorageName}</span>
                    </div>
                </div>
                <div className="border border-gray-300 p-4 rounded">
                    <div className="font-bold bg-gray-200 -m-4 p-2 mb-4 rounded-t">Получател</div>
                    <div className="grid grid-cols-2 gap-x-4">
                        <span className="font-semibold">Име:</span>
                        <span>{transfer.destinationStorageName}</span>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <table className="w-full text-left border-collapse mb-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">Име на продукта</th>
                        <th className="p-2 border">EAN код</th>
                        <th className="p-2 border text-center">Количество</th>
                        <th className="p-2 border text-right">Ед. цена</th>
                        <th className="p-2 border text-right">Стойност</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td className="p-2 border">{p.product.name}</td>
                            <td className="p-2 border">{p.product.barcode}</td>
                            <td className="p-2 border text-center">{p.quantity}</td>
                            <td className="p-2 border text-right">{(p.product.clientPrice || 0).toFixed(2)} лв.</td>
                            <td className="p-2 border text-right">{(p.quantity * (p.product.clientPrice || 0)).toFixed(2)} лв.</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-bold bg-gray-50">
                        <td colSpan="2" className="p-2 border text-right">Общо:</td>
                        <td className="p-2 border text-center">{totalQuantity}</td>
                        <td className="p-2 border"></td>
                        <td className="p-2 border text-right">{totalValue.toFixed(2)} лв.</td>
                    </tr>
                </tfoot>
            </table>
            
            {/* Footer */}
            <div className="mt-8 pt-8 border-t">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="font-semibold">Предал:</span>
                        <div className="text-xs text-gray-500">{transfer.user?.name || transfer.user?.email}</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

PrintableTransfer.displayName = 'PrintableTransfer'; 