'use client';

import * as React from 'react';
import {
  DayPicker,
  getDefaultClassNames,
  type MonthsProps,
} from 'react-day-picker';

import { cn } from '@/lib/utils';

function ModifyCalendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  // Custom Months wrapper to inject "-" between months
  const CustomMonths = (monthsProps: MonthsProps) => {
    const { children, className } = monthsProps;

    return (
      <div className={cn('flex items-start gap-4', className)}>
        {React.Children.map(children, (child, index) => (
          <>
            {child}
            {index === 1 && (
              <div className="self-center flex items-center justify-center px-2 text-lg font-semibold text-gray-400">
                –
              </div>
            )}
          </>
        ))}
      </div>
    );
  };

  return (
    <DayPicker
      numberOfMonths={2}
      showOutsideDays={showOutsideDays}
      fixedWeeks
      className={cn('p-3', className)}
      components={{
        Months: CustomMonths,
      }}
      classNames={{
        root: cn(defaultClassNames.root, 'p-2 bg-white rounded-xl'),
        months: 'flex flex-col gap-4 sm:flex-row sm:items-start',
        month: 'space-y-4',

        caption: 'relative mb-2 flex items-center justify-center',
        caption_label: 'text-sm font-semibold text-gray-800',
        nav: 'flex items-center gap-1',
        nav_button_previous: 'absolute left-0',
        nav_button_next: 'absolute right-0',

        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell: 'w-11 text-center text-xs font-medium text-gray-500',

        row: 'mt-2 flex w-full',
        cell: cn(
          'relative p-0 text-center align-middle',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
        ),

        day: cn(
          defaultClassNames.day,
          'mx-auto h-9 w-9 rounded-md p-0 hover:bg-gray-100 items-center justify-center text-center',
        ),

        today: 'border border-[#5b6fdc] ',
        
        selected: 'bg-[#88eaa5] text-[#002f66]',

        range_start: '[&>.rdp-day_button]:bg-[#6EDB8F] [&>.rdp-day_button]:text-[#002f66]',
        range_middle:
  '!bg-transparent [&>.rdp-day_button]:!bg-transparent [&>.rdp-day_button]:text-slate-700 [&>.rdp-day_button]:hover:!bg-transparent',
        range_end: '[&>.rdp-day_button]:bg-[#6EDB8F] [&>.rdp-day_button]:text-[#002f66]',
            

        outside:
          '!bg-transparent text-red-300 !border-0 [&>.rdp-day_button]:!bg-transparent [&>.rdp-day_button]:!text-transparent [&>.rdp-day_button]:!border-0 [&>.rdp-day_button]:pointer-events-none',
        hidden:
          '!bg-transparent text-transparent [&>.rdp-day_button]:!bg-transparent [&>.rdp-day_button]:!text-transparent [&>.rdp-day_button]:!border-0 [&>.rdp-day_button]:pointer-events-none',

        chevron: cn(
          defaultClassNames.chevron,
          '[&>svg]:fill-[#c59d5e] [&>svg]:stroke-[#c59d5e]',
        ),
        ...classNames,
      }}
      {...props}
    />
  );
}

export { ModifyCalendar };
