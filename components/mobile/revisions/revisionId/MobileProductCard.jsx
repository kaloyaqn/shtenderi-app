import { Package } from "lucide-react";

export default function MobileProductCard({mp}) {
    return (
        <div key={mp.id} className="border border-gray-200 rounded-md bg-white py-0">
        <div className="p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center">
              <Package className="w-2 h-2 text-gray-600" />
            </div>
            <span className="font-medium text-xs text-gray-900 mb-3 leading-tigh">
              {mp.product?.name}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Баркод:</span>
              <span className="text-xs font-mono text-gray-900">
                {mp.product?.barcode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Брой:</span>
              <span className="text-sm font-bold text-gray-900">
                {mp.givenQuantity !== null && mp.givenQuantity !== mp.missingQuantity ? (
                  <div className="text-right">
                    <div>{mp.givenQuantity}</div>
                    <div className="text-xs text-gray-500 font-normal">(искано: {mp.missingQuantity})</div>
                  </div>
                ) : !mp.isSold ? (
                  <div className="text-right text-red-600">
                    <div>{mp.missingQuantity}</div>
                    <div className="text-xs text-red-500 font-normal">(не сканиран)</div>
                  </div>
                ) : (
                  mp.missingQuantity
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
}