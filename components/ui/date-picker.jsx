import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { bg } from "date-fns/locale"

export default function DatePicker({ date = null, setDate }) {
  return (
    <>
      <Popover>
        <PopoverTrigger className="!w-full" asChild>
          <Button
            variant="outline"
            data-empty={!date}
            className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
          >
            <CalendarIcon />
            {date ? format(date, "PPP", { locale: bg }) : <span>Избери дата</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            captionLayout="dropdown"
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={bg}
          />
        </PopoverContent>
      </Popover>
    </>
  )
}