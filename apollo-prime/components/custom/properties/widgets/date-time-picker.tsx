"use client";

import { useState, useCallback } from "react";
import { cn } from "@uipath/apollo-wind";
import { Input } from "@uipath/apollo-wind/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@uipath/apollo-wind/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uipath/apollo-wind/components/ui/select";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { DateTimePickerWidgetProps } from "../types";
import { PropertyConfigMenu } from "../property-config-menu";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const NOW_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 21 }, (_, i) => NOW_YEAR - 10 + i);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const fontClass = "!text-[length:var(--font-size-base)]";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function formatTime(h: number, m: number) {
  return `${pad(h)}:${pad(m)}`;
}

function parseDate(value: string) {
  if (value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

function parseTime(value: string) {
  if (value) {
    // Handle "HH:MM" or "YYYY-MM-DDTHH:MM"
    const match = value.match(/(\d{2}):(\d{2})/);
    if (match) return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
  }
  return { hour: 0, minute: 0 };
}

/* ------------------------------------------------------------------ */
/*  CalendarGrid                                                       */
/* ------------------------------------------------------------------ */

function CalendarGrid({
  selectedDate,
  viewYear,
  viewMonth,
  onViewChange,
  onSelect,
}: {
  selectedDate: string;
  viewYear: number;
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
  onSelect: (dateStr: string) => void;
}) {
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) onViewChange(viewYear - 1, 11);
    else onViewChange(viewYear, viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) onViewChange(viewYear + 1, 0);
    else onViewChange(viewYear, viewMonth + 1);
  };

  return (
    <div className="w-[264px]">
      {/* Month/Year header with navigation */}
      <div className="mb-2 flex items-center gap-1">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        <Select
          value={viewMonth.toString()}
          onValueChange={(v) => onViewChange(viewYear, parseInt(v, 10))}
        >
          <SelectTrigger className={cn("h-7 w-[110px] gap-1 px-2", fontClass)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((name, i) => (
              <SelectItem key={i} value={i.toString()} className={fontClass}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={viewYear.toString()}
          onValueChange={(v) => onViewChange(parseInt(v, 10), viewMonth)}
        >
          <SelectTrigger className={cn("h-7 w-[72px] gap-1 px-2", fontClass)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()} className={fontClass}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={nextMonth}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 text-center">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className={cn(
              "flex h-8 items-center justify-center text-muted-foreground",
              fontClass,
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 text-center">
        {Array.from({ length: totalCells }, (_, i) => {
          const day = i - firstDay + 1;
          if (day < 1 || day > daysInMonth) {
            return <div key={i} className="h-8" />;
          }

          const dateStr = formatDate(viewYear, viewMonth, day);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors",
                fontClass,
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isToday
                    ? "ring-1 ring-inset ring-primary/30"
                    : "hover:bg-accent",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TimePicker                                                         */
/* ------------------------------------------------------------------ */

function TimePicker({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  hour: number;
  minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("shrink-0 text-muted-foreground", fontClass)}>Time</div>
      <Select
        value={pad(hour)}
        onValueChange={(v) => onHourChange(parseInt(v, 10))}
      >
        <SelectTrigger className={cn("h-7 w-[70px] gap-1 px-2", fontClass)}>
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {HOURS.map((h) => (
            <SelectItem key={h} value={pad(h)} className={fontClass}>
              {pad(h)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className={cn("text-muted-foreground", fontClass)}>:</span>
      <Select
        value={pad(minute)}
        onValueChange={(v) => onMinuteChange(parseInt(v, 10))}
      >
        <SelectTrigger className={cn("h-7 w-[70px] gap-1 px-2", fontClass)}>
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {MINUTES.map((m) => (
            <SelectItem key={m} value={pad(m)} className={fontClass}>
              {pad(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyDateTimePickerProps extends DateTimePickerWidgetProps {
  value: string;
  onChange: (value: string) => void;
  supportsAdvanced?: boolean;
  supportsRefresh?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PropertyDateTimePicker({
  value,
  onChange,
  mode = "date",
  placeholder,
  supportsRefresh,
  className,
}: PropertyDateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const parsed = parseDate(value);
  const parsedTime = parseTime(value);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  const Icon = mode === "time" ? Clock : Calendar;
  const defaultPlaceholder =
    mode === "time"
      ? "Select time…"
      : mode === "datetime"
        ? "Select date and time…"
        : "Select date…";

  /* Display value */
  const displayValue = value
    ? mode === "datetime"
      ? value.replace("T", " ")
      : value
    : "";

  /* Selected date string for highlighting */
  const selectedDate = value
    ? formatDate(parsed.year, parsed.month, parsed.day)
    : "";

  /* Handlers */
  const handleDateSelect = useCallback(
    (dateStr: string) => {
      if (mode === "datetime") {
        const t = parseTime(value);
        onChange(`${dateStr}T${formatTime(t.hour, t.minute)}`);
      } else {
        onChange(dateStr);
        setOpen(false);
      }
    },
    [mode, value, onChange],
  );

  const handleHourChange = useCallback(
    (h: number) => {
      const t = parseTime(value);
      if (mode === "datetime") {
        const d = parseDate(value);
        const dateStr = value ? formatDate(d.year, d.month, d.day) : formatDate(parsed.year, parsed.month, parsed.day);
        onChange(`${dateStr}T${formatTime(h, t.minute)}`);
      } else {
        onChange(formatTime(h, t.minute));
      }
    },
    [mode, value, onChange, parsed],
  );

  const handleMinuteChange = useCallback(
    (m: number) => {
      const t = parseTime(value);
      if (mode === "datetime") {
        const d = parseDate(value);
        const dateStr = value ? formatDate(d.year, d.month, d.day) : formatDate(parsed.year, parsed.month, parsed.day);
        onChange(`${dateStr}T${formatTime(t.hour, m)}`);
      } else {
        onChange(formatTime(t.hour, m));
      }
    },
    [mode, value, onChange, parsed],
  );

  const handleViewChange = useCallback((year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            readOnly
            value={displayValue}
            placeholder={placeholder ?? defaultPlaceholder}
            onClick={() => setOpen(true)}
            className={cn(
              "h-8 cursor-pointer pr-14",
              fontClass,
              "[&::-webkit-calendar-picker-indicator]:hidden",
            )}
          />
        </PopoverAnchor>
        <PopoverContent
          className="w-auto p-3"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {(mode === "date" || mode === "datetime") && (
            <CalendarGrid
              selectedDate={selectedDate}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onViewChange={handleViewChange}
              onSelect={handleDateSelect}
            />
          )}

          {mode === "datetime" && (
            <div className="my-2 border-t border-(--border-subtle)" />
          )}

          {(mode === "time" || mode === "datetime") && (
            <TimePicker
              hour={parsedTime.hour}
              minute={parsedTime.minute}
              onHourChange={handleHourChange}
              onMinuteChange={handleMinuteChange}
            />
          )}
        </PopoverContent>
      </Popover>

      {/* Inline icons — right side of input */}
      <div className="pointer-events-none absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5 [&>*]:pointer-events-auto">
        <Icon className="pointer-events-none size-3.5 shrink-0 text-muted-foreground" />
        <PropertyConfigMenu pattern="text" showForceRefresh={supportsRefresh} />
      </div>
    </div>
  );
}
