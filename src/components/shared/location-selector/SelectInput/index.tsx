'use client';

import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { isLocationMatch } from '../utils';

import { ISelectInputProps } from './types';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';


const SelectInput = ({
  name,
  label,
  options = [],
  placeholder,
  disabled,
  className,
  search,
  optional,
  required,
  description,
}: ISelectInputProps) => {
  const { control, setValue } = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && (
            <FormLabel required={required || !optional}>
              {label}
            </FormLabel>
          )}
          {search ? (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      'w-full justify-between font-normal h-11 dark:bg-input/30',
                      !field.value && 'text-muted-foreground',
                      disabled && 'opacity-50 cursor-not-allowed',
                    )}
                    disabled={disabled}
                  >
                    {field.value
                      ? options.find((option) => isLocationMatch(option.value, field.value))
                        ?.label
                      : placeholder || `Select ${label}...`}
                    <Icon
                      icon="mdi:chevron-down"
                      className="ml-2 h-4 w-4 shrink-0 opacity-50"
                    />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder={`Search ${label}...`} />
                  <CommandList>
                    <CommandEmpty>No {label} found.</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={() => {
                            field.onChange(option.value);
                            setOpen(false);
                          }}
                        >
                          <Icon
                            icon="mdi:check"
                            className={cn(
                              'mr-2 h-4 w-4',
                              isLocationMatch(field.value, option.value)
                                ? 'opacity-100'
                                : 'opacity-0',
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
          ) : (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="w-full h-11 dark:bg-input/30">
                  <SelectValue placeholder={placeholder || `Select ${label}...`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectInput;
