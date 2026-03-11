
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarEvent = {
  date: string; // yyyy-mm-dd
  type: string;
  title: string;
  color?: string;
  details?: string;
};

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  eventColorKey?: string;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  events = [],
  onEventClick,
  eventColorKey = 'color',
  ...props
}: CalendarProps) {
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>();
  // Map events by date for quick lookup
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  // Add event dots to days
  const modifiers = {
    hasEvent: (date: Date) => {
      const key = date.toISOString().slice(0, 10);
      return !!eventsByDate[key];
    }
  };


  // react-day-picker DayProps signature
  const renderDay = (dayProps: any) => {
    const date: Date = dayProps.date || dayProps.day || dayProps;
    const key = date.toISOString().slice(0, 10);
    const dayEvents = eventsByDate[key] || [];
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <span>{date.getDate()}</span>
        {dayEvents.length > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {dayEvents.slice(0, 3).map((ev, i) => (
              <span
                key={i}
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: ev[eventColorKey] || '#6366f1' }}
                title={ev.title}
              />
            ))}
            {dayEvents.length > 3 && <span className="text-xs ml-1">+{dayEvents.length - 3}</span>}
          </div>
        )}
      </div>
    );
  };

  function handleDayClick(date: Date, selected: any, e: any) {
    setSelectedDay(date);
    if (props.onDayClick) props.onDayClick(date, selected, e);
  }

  // List events for selected day
  const selectedKey = selectedDay ? selectedDay.toISOString().slice(0, 10) : undefined;
  const selectedEvents = selectedKey ? eventsByDate[selectedKey] || [] : [];

  return (
    <div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
          Day: renderDay,
        }}
        modifiers={modifiers}
        onDayClick={handleDayClick}
        {...props}
      />
      {/* Event list for selected day */}
      {selectedEvents.length > 0 && (
        <div className="mt-2 p-2 border rounded bg-muted/30">
          <div className="font-semibold mb-1">Events on {selectedKey}:</div>
          <ul className="space-y-1">
            {selectedEvents.map((ev, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: ev[eventColorKey] || '#6366f1' }} />
                <span className="font-medium cursor-pointer underline" onClick={() => onEventClick && onEventClick(ev)}>{ev.title}</span>
                {ev.details && <span className="text-xs text-muted-foreground ml-2">{ev.details}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
