import { RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function BasicHeader({title, subtitle}) {
  const router = useRouter();

    return (
        <div className="flex md:flex-row flex-col  justify-between items-center md:pb-4 border-b md:p-0 p-1 py-4">
        <div className="flex flex-col md:w-auto w-full">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-base text-gray-600 md:mb-0 mb-2">
            {subtitle}
          </p>
        </div>
        <Button
          onClick={() => {
            router.refresh();
            setIsRefreshing(true);
          }}
          variant="outline"
        >
          <RefreshCcw  /> Обнови
        </Button>
      </div>
    )
}