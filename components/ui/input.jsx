import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  variant = "default", // variants: default | table
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // base
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // default variant (bordered with focus ring)
        variant === 'default' && "border border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        // table variant (no border, no shadow/ring)
        variant === 'table' && "border-0 shadow-none p-0 bg-gray-100 rounded-none px-1 focus-visible:ring-2 z-10 focus-visible:border-transparent",
        className
      )}
      {...props} />
  );
}

export { Input }
