import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

export default function TableLink({href, children,className}) {
    return (
        <Link className={`text-blue-600 hover:text-blue-800 font-medium text-sm underline decoration-2 underline-offset-2 flex items-center group  ${className}`} href={href || '/'}>
            {children}

            <ExternalLinkIcon className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    )
}