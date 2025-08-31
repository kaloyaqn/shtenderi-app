"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const MultiCombobox = React.forwardRef(({ 
  options = [], 
  value, 
  onValueChange, 
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  className,
  disabled = false,
  ...props 
}, ref) => {
  const [open, setOpen] = React.useState(false)

  // Handle both string and array values for backward compatibility
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : [])
  const selectedOptions = options.filter(option => selectedValues.includes(option.value))

  const handleSelect = (currentValue) => {
    const selectedOption = options.find(opt => opt.label === currentValue)
    if (!selectedOption) return

    const newValues = selectedValues.includes(selectedOption.value)
      ? selectedValues.filter(v => v !== selectedOption.value)
      : [...selectedValues, selectedOption.value]

    onValueChange(newValues)
  }

  const removeValue = (valueToRemove) => {
    const newValues = selectedValues.filter(v => v !== valueToRemove)
    onValueChange(newValues)
  }

  const displayText = selectedOptions.length > 0 
    ? `${selectedOptions.length} selected`
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className='!w-full'>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between min-h-10", className)}
          disabled={disabled}
          {...props}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs"
                >
                  {option.label}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeValue(option.value)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        removeValue(option.value)
                      }
                    }}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full cursor-pointer inline-flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </div>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{displayText}</span>
            )}
          </div>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={handleSelect}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
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

MultiCombobox.displayName = "MultiCombobox"

export { MultiCombobox } 