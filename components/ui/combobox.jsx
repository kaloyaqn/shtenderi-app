"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const Combobox = React.forwardRef(({
  options = [],
  value,
  onValueChange,
  placeholder = "Избери...",
  searchPlaceholder = "Потърси...",
  emptyText = "Няма намерени резултати",
  className,
  disabled = false,
  onSearchChange,
  emptyContent,            // 👈 NEW (function returning JSX)
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")   // 👈 NEW: track search input

  const selectedOption = options.find(option => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full">
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("!w-full justify-between", className)}
          disabled={disabled}
          {...props}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command className="w-full">

          {/* 🔥 UPDATED: Controlled input with callback */}
          <CommandInput
            className="w-full"
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={(val) => {
              setSearch(val)
              onSearchChange?.(val)     // 👈 Send value to parent
            }}
          />

          <CommandList className="w-full">

            {/* 🔥 UPDATED: dynamic empty state */}
            <CommandEmpty>
              {emptyContent
                ? emptyContent(search)   // 👈 Pass search text into custom empty state
                : emptyText}
            </CommandEmpty>

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(currentValue) => {
                    const selected = options.find(opt => opt.label === currentValue)
                    onValueChange(selected ? selected.value : "")
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

        </Command>
      </PopoverContent>
    </Popover>
  )
})

Combobox.displayName = "Combobox"

export { Combobox }
