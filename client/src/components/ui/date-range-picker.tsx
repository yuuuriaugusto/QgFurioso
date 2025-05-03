import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Definição de tipos para DateRange
export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

// Tipo para manipulador de eventos SelectRange
export type SelectRangeEventHandler = (range: DateRange | undefined) => void;

interface DatePickerWithRangeProps {
  className?: string;
  selectedRange: DateRange;
  onSelect: (range: DateRange) => void;
}

export function DatePickerWithRange({
  className,
  selectedRange,
  onSelect,
}: DatePickerWithRangeProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const handleRangeSelect = (range: DateRange) => {
    onSelect(range);
    if (range.from && range.to) {
      setIsPopoverOpen(false);
    }
  };

  // Opções de período predefinidas
  const presets = [
    {
      name: "Hoje",
      range: {
        from: new Date(),
        to: new Date(),
      },
    },
    {
      name: "Ontem",
      range: {
        from: addDays(new Date(), -1),
        to: addDays(new Date(), -1),
      },
    },
    {
      name: "Últimos 7 dias",
      range: {
        from: addDays(new Date(), -6),
        to: new Date(),
      },
    },
    {
      name: "Últimos 30 dias",
      range: {
        from: addDays(new Date(), -29),
        to: new Date(),
      },
    },
    {
      name: "Últimos 90 dias",
      range: {
        from: addDays(new Date(), -89),
        to: new Date(),
      },
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !selectedRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, "PPP", { locale: ptBR })} -{" "}
                  {format(selectedRange.to, "PPP", { locale: ptBR })}
                </>
              ) : (
                format(selectedRange.from, "PPP", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-2 p-3">
            <div>
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={selectedRange?.from}
                selected={{
                  from: selectedRange?.from,
                  to: selectedRange?.to,
                }}
                onSelect={(range) => handleRangeSelect(range as DateRange)}
                numberOfMonths={2}
                locale={ptBR}
              />
            </div>
            <div className="flex flex-col space-y-2 border-l pl-3">
              <div className="font-medium">Períodos</div>
              <div className="flex flex-col gap-1">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleRangeSelect(preset.range);
                    }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}