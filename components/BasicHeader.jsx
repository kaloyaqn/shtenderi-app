import { RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function BasicHeader({title, subtitle, onClick, button_text, button_icon, children, hasBackButton}) {
  const router = useRouter();

    return (
        <div className="flex md:flex-row flex-col  justify-between items-center md:pb-4 border-b md:p-0 p-1 py-4 md:mb-4">
        <div className="flex items-center gap-3">
            {hasBackButton && (
                            <Button
                            onClick={() => router.back()}
                            className={'text-sm'} size='sm' variant={'ghost'}>
                            {"<-"} Назад
                        </Button>
            )}
        <div className="flex flex-col md:w-auto w-full">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-base text-gray-600 md:mb-0 mb-2">
            {subtitle}
          </p>
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
            <Button variant={'default'}
            onClick={onClick}
            >
            {button_icon && button_icon}    {button_text}
            </Button>
        )}

        {children && (
            <div className="flex items-center gap-2">{children}</div>
        )}
      </div>
    )
}