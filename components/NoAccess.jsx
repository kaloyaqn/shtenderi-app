"use client";

import {
  Warehouse,
  Phone,
  Mail,
  Home,
  Store,
  User,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NoAcess({icon, title, subtitlte, help_text}) {
  return (
    <>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          {/* Empty State Illustration */}
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            {icon}
          </div>

          {/* Empty State Content */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {subtitlte}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="tel:0877974407">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-11">
                <Phone className="h-4 w-4 mr-2" />
                Свържете се с администратор
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-green-900 mb-1">
                  Нужда от помощ?
                </p>
                <p className="text-xs text-green-700 leading-relaxed">
                    {help_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
