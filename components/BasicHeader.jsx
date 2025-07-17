"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BasicHeader({
  title,
  subtitle,
  onClick,
  button_text,
  button_icon,
  children,
  hasBackButton,
  className
}) {
  const router = useRouter();
  const isMobile = useIsMobile();

  if (isMobile) {
    // Render a simplified or custom mobile header
    return (
      <nav>
        <div className={`flex flex-col items-start mb-4 p-2 border-b bg-white ${className}`}>
          <div className="flex items-center gap-3">
            {hasBackButton && (
              <Button
                onClick={() => router.back()}
                className={"text-sm w-auto"}
                size="sm"
                variant={"ghost"}
              >
                {"<-"} <span className="md:block hidden"></span>
              </Button>
            )}
            <div>
              <div className="flex items-center gap-2 w-full">
                <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">
                  {title}
                </h1>
              </div>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        {children && (
          <div className="flex flex-col items-center w-full gap-2 mb-4">
            {children}
          </div>
        )}
      </nav>
    );
  }

  return (
    <div className={`flex md:flex-row flex-col  justify-between md:items-center items-start mb-4 md:pb-4 border-b md:p-0 p-1 py-4 md:mb-4 ${className}`}>
      <div className="flex items-center gap-3 md:flex-row">
        {hasBackButton && (
          <Button
            onClick={() => router.back()}
            className={"text-sm md:w-auto w-auto"}
            size="sm"
            variant={"ghost"}
          >
            {"<-"} Назад
          </Button>
        )}
        <div className="flex flex-col md:w-auto w-full">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-base text-gray-600 md:mb-0 mb-2">{subtitle}</p>
        </div>
      </div>
      {!children && !button_text && (
        <Button
          onClick={() => {
            router.refresh();
          }}
          variant="outline"
        >
          <RefreshCcw /> Обнови
        </Button>
      )}

      {button_text && (
        <Button variant={"default"} onClick={onClick}>
          {button_icon && button_icon} {button_text}
        </Button>
      )}

      {children && (
        <div className="flex md:flex-row flex-col md:w-auto w-full items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
