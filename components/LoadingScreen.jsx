import { Loader, Loader2 } from "lucide-react";

export default function LoadingScreen({height = "100vh"}) {
    return (
        <div className="w-full grid place-items-center" style={{ height: height }}>
            <Loader2 className="animate-spin text-gray-700"/>
        </div>
    )
}       