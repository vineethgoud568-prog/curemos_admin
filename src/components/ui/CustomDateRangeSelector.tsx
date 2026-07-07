'use client';

import { format as formatDate } from 'date-fns';
import { CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';

import { ModifyCalendar } from './modifyCalendar';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CustomShadcnDatePickerProps {
  placeholder?: string;
  labelName?: string;
  value?: DateRange | undefined;
  onChange?: (value: DateRange | undefined) => void;
  error?: boolean;
  helperText?: string;
  disableCalendar?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  ApplyDateFilter?: (startRange: Date | undefined, endRange: Date | undefined) => void;
  ResetDateFilter: () => void;
}

export default function CustomDateRangesPicker({
  labelName,
  value,
  onChange,
  error,
  helperText,
  disableCalendar = false,
  minDate,
  maxDate,
  format = 'MMM dd, yyyy',
  ApplyDateFilter,
  ResetDateFilter,
}: CustomShadcnDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const isDateDisabled = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (minDate && checkDate < minDate) return true;
    if (maxDate && checkDate > maxDate) return true;

    return false;
  };

  const handleReset = () => {
    ResetDateFilter();
    onChange?.(undefined); 
    setOpen(false); 
  };

  return (
    <div className="flex flex-col gap-1">
      {labelName && (
        <label className="text-sm font-medium text-gray-700">{labelName}</label>
      )}

      <Popover open={open} onOpenChange={(nextOpen) => {
        // if closing (click outside / escape)
        if (!nextOpen) {
          handleReset();
        }
        setOpen(nextOpen);
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disableCalendar}
            className="justify-start text-left font-normal w-[280px] shadow-sm"
            style={{ height: '40px', backgroundColor:'white !important' }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from && value?.to
              ? `${formatDate(value.from, format)} → ${formatDate(value.to, format)}`
              : value?.from
                ? formatDate(value.from, format)
                : 'Select date range'}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="max-h-[calc(100vh-2rem)] w-auto overflow-y-auto p-2"
          align="start"
        >
          <ModifyCalendar
            mode="range"
            numberOfMonths={2}
            selected={value}
            onSelect={(range) => onChange?.(range)}
            defaultMonth={value?.from}
            disabled={isDateDisabled}

            // classNames={{
            //   selected: 'bg-[#5b6fdc] text-white',
            //   range_start: '[&>.rdp-day_button]:bg-[#5b6fdc] [&>.rdp-day_button]:text-white',
            //   range_middle:
            //     '[&>.rdp-day_button]:bg-transparent [&>.rdp-day_button]:text-inherit',
            //   range_end: '[&>.rdp-day_button]:bg-[#5b6fdc] [&>.rdp-day_button]:text-white',
            // }}
          />
          {value?.from || value?.to ? (
            <div className="flex justify-end mt-2 gap-4">            
              <Button
                // variant="ghost"
                size="sm"
                onClick={() => { 
                  if(ApplyDateFilter) ApplyDateFilter(value.from, value.to);
                  setOpen(false);
                }}
              >
                <CheckCircle2 className="w-4 h-4" /> Apply
              </Button>
              <Button
                // variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                <XCircle className="w-4 h-4" /> Reset
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>

      {error && helperText && (
        <p className="text-sm text-red-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
