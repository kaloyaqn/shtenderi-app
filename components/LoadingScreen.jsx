import { Loader, Loader2 } from "lucide-react";

export default function LoadingScreen() {
    return (
        <div className="w-full h-[100vh] grid place-items-center">
            <Loader2 className="animate-spin text-gray-700"/>
        </div>
    )
}