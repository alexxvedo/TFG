"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Datos simulados para las flashcards y duración de estudio estimada por día
const flashcardsByDate = {
  "2024-11-05": { count: 5, duration: "30 min", completed: 3, pending: 2 },
  "2024-11-06": { count: 3, duration: "15 min", completed: 2, pending: 1 },
  "2024-11-07": { count: 8, duration: "45 min", completed: 6, pending: 2 },
  "2024-11-08": { count: 4, duration: "20 min", completed: 4, pending: 0 },
  "2024-11-09": { count: 7, duration: "35 min", completed: 5, pending: 2 },
};

export default function FlashcardCalendar() {
  const [value, setValue] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = format(date, "yyyy-MM-dd");
    const data = flashcardsByDate[dateStr];

    if (!data) return null;

    return (
      <div className="w-full flex flex-col items-center">
        <Badge
          variant={getBadgeVariant(data.count)}
          className="mt-1 cursor-pointer"
        >
          {data.count}
        </Badge>
      </div>
    );
  };

  const getBadgeVariant = (count) => {
    if (count <= 3) return "default";
    if (count <= 6) return "secondary";
    return "outline";
  };

  const handleDateClick = (value) => {
    setValue(value);
    const dateStr = format(value, "yyyy-MM-dd");
    setSelectedDate(flashcardsByDate[dateStr] ? dateStr : null);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Calendar
          onChange={handleDateClick}
          value={value}
          tileContent={tileContent}
          locale="es"
          className={cn(
            "w-full max-w-full rounded-lg shadow-sm",
            "react-calendar",
            "[&_.react-calendar__navigation]:mb-2",
            "[&_.react-calendar__navigation__label]:text-sm [&_.react-calendar__navigation__label]:font-medium",
            "[&_.react-calendar__month-view__weekdays]:mb-2",
            "[&_.react-calendar__month-view__weekdays__weekday]:text-muted-foreground [&_.react-calendar__month-view__weekdays__weekday]:font-normal [&_.react-calendar__month-view__weekdays__weekday]:text-sm",
            "[&_.react-calendar__month-view__days__day]:h-10 [&_.react-calendar__month-view__days__day]:w-10",
            "[&_.react-calendar__tile]:relative [&_.react-calendar__tile]:flex [&_.react-calendar__tile]:items-center [&_.react-calendar__tile]:justify-center",
            "[&_.react-calendar__tile--now]:bg-muted",
            "[&_.react-calendar__tile--active]:bg-primary [&_.react-calendar__tile--active]:text-primary-foreground",
            "[&_.react-calendar__tile:enabled:hover]:bg-muted",
            "[&_.react-calendar__tile:enabled:focus]:bg-muted",
            "border-none"
          )}
        />
        {selectedDate && flashcardsByDate[selectedDate] && (
          <div className="mt-4 p-4 border rounded-lg space-y-2">
            <p className="text-sm font-medium">
              {format(new Date(selectedDate), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Duración:</span>
              <span className="text-sm">{flashcardsByDate[selectedDate].duration}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Completadas
                </span>
                <Badge variant="success">
                  {flashcardsByDate[selectedDate].completed}
                </Badge>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  Pendientes
                </span>
                <Badge variant="warning">
                  {flashcardsByDate[selectedDate].pending}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
