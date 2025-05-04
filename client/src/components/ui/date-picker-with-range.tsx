"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerWithRangeProps {
  selectedRange: DateRange;
  onSelect: (range: DateRange) => void;
  className?: string;
}

export function DatePickerWithRange({
  selectedRange,
  onSelect,
  className,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={selectedRange?.from}
        selected={selectedRange}
        onSelect={onSelect}
        numberOfMonths={2}
        locale={ptBR}
      />
      
      {(selectedRange?.from || selectedRange?.to) && (
        <div className="flex justify-end p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect({ from: undefined, to: undefined })}
          >
            Limpar
          </Button>
        </div>
      )}
    </div>
  )
}