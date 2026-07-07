'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  GetCity,
  GetRegions,
  GetState,
} from 'react-country-state-city';
import { useFormContext, useWatch } from 'react-hook-form';

import SelectInput from './SelectInput';
import { IOption } from './SelectInput/types';
import { cleanLocationName } from './utils';

import { formatLabel } from '@/lib/functions/format.lib';

/* ------------------- LOCATION SELECT (COUNTRY-STATE-CITY) ------------------- */

const INDIA_OPTION: IOption = {
  label: 'India 🇮🇳',
  value: 'India',
  id: 101,
};

const ALLOWED_STATE_NAMES = ['Andhra Pradesh', 'Telangana'];

export type TLocationField = 'region' | 'country' | 'state' | 'city';

interface IRCSCSelectorInputProps {
  /**
   * @default ['country', 'state', 'city']
   */
  fields?: TLocationField[];
  /**
   * Custom form names for each field (e.g. { country: 'origin_country' })
   */
  names?: Partial<Record<TLocationField, string>>;
  /**
   * Custom labels for each field
   */
  labels?: Partial<Record<TLocationField, string>>;
  /**
   * Whether to show as optional or which specific fields are optional
   */
  className?: string;
  disabled?: boolean;
  optional?: boolean | TLocationField[];
}

interface ILocationData {
  name: string;
  emoji?: string;
  id: string | number;
  [key: string]: unknown;
}

const RCSCSelectorInput = ({
  className,
  names = {},
  labels = {},
  disabled = false,
  optional = false,
  fields: initialFields = ['country', 'state', 'city'],
}: IRCSCSelectorInputProps) => {
  const { setValue, control } = useFormContext();

  // Stable reference for fields array
  const fields = useMemo(() => initialFields, [JSON.stringify(initialFields)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve actual form names
  const fieldNames = useMemo(
    () => ({
      region: names.region || 'region',
      country: names.country || 'country',
      state: names.state || 'state',
      city: names.city || 'city',
    }),
    [names],
  );

  // Watch current values
  const [regionValue, countryValue, stateValue] = useWatch({
    control,
    name: [fieldNames.region, fieldNames.country, fieldNames.state],
  });

  const isOptional = (field: TLocationField) => {
    if (typeof optional === 'boolean') return optional;
    return optional.includes(field);
  };

  /* ------------------- Logic: Automatic Resets ------------------- */

  const prevRegionRef = useRef(regionValue);
  const prevCountryRef = useRef(countryValue);
  const prevStateRef = useRef(stateValue);

  // Region change -> reset others
  useEffect(() => {
    if (prevRegionRef.current !== undefined && regionValue !== prevRegionRef.current) {
      if (regionValue !== undefined && regionValue !== null) {
        if (fields.includes('country')) setValue(fieldNames.country, '');
        if (fields.includes('state')) setValue(fieldNames.state, '');
        if (fields.includes('city')) setValue(fieldNames.city, '');
      }
    }
    prevRegionRef.current = regionValue;
  }, [regionValue, fieldNames, setValue, fields]);

  // Country change -> reset others
  useEffect(() => {
    if (prevCountryRef.current !== undefined && countryValue !== prevCountryRef.current) {
      if (countryValue !== undefined && countryValue !== null) {
        if (fields.includes('state')) setValue(fieldNames.state, '');
        if (fields.includes('city')) setValue(fieldNames.city, '');
      }
    }
    prevCountryRef.current = countryValue;
  }, [countryValue, fieldNames.state, fieldNames.city, setValue, fields]);

  // State change -> reset city
  useEffect(() => {
    if (prevStateRef.current !== undefined && stateValue !== prevStateRef.current) {
      if (stateValue !== undefined && stateValue !== null) {
        if (fields.includes('city')) setValue(fieldNames.city, '');
      }
    }
    prevStateRef.current = stateValue;
  }, [stateValue, fieldNames.city, setValue, fields]);

  /* ------------------- Options ------------------- */

  const [regionOptions, setRegionOptions] = useState<IOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<IOption[]>([]);
  const [stateOptions, setStateOptions] = useState<IOption[]>([]);
  const [cityOptions, setCityOptions] = useState<IOption[]>([]);

  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    if (fields.includes('country') && countryValue !== INDIA_OPTION.value) {
      setValue(fieldNames.country, INDIA_OPTION.value);
    }
  }, [countryValue, fieldNames.country, fields, setValue]);

  // Helper to get ID from name
  const getCountryId = (name: string) => {
    if (!name) return null;
    if (name === 'India') return 101; // Optimization for default
    const found = countryOptions.find((c) => c.label.startsWith(name) || c.value === name);
    return found ? Number(found.id) : null;
  };

  const getStateId = (name: string) => {
    if (!name) return null;
    const found = stateOptions.find((s) => s.label === name || s.value === name);
    return found ? Number(found.id) : null;
  };

  useEffect(() => {
    if (fields.includes('region')) {
      GetRegions().then((result) => {
        setRegionOptions(
          (result as ILocationData[]).map((r) => ({
            label: r.name,
            value: r.name,
            id: r.id,
          })),
        );
      });
    }
  }, [fields]);

  useEffect(() => {
    setCountryOptions([INDIA_OPTION]);
    setIsLoadingCountries(false);
  }, []);

  useEffect(() => {
    const cId = getCountryId(countryValue);
    if (cId && fields.includes('state')) {
      setIsLoadingStates(true);
      GetState(cId)
        .then((result) => {
          setStateOptions(
            (result as ILocationData[])
              .filter((s) => ALLOWED_STATE_NAMES.includes(s.name) || s.name === stateValue)
              .map((s) => ({
                label: s.name,
                value: s.name, // Use name for form value
                id: s.id, // Store ID for fetching
              })),
          );
        })
        .finally(() => setIsLoadingStates(false));
    } else {
      setStateOptions([]);
    }
  }, [countryValue, fields, countryOptions.length, stateValue]); // Re-run when options loaded or selection changes

  useEffect(() => {
    const cId = getCountryId(countryValue);
    const sId = getStateId(stateValue);
    if (cId && sId && fields.includes('city')) {
      setIsLoadingCities(true);
      GetCity(cId, sId)
        .then((result) => {
          setCityOptions(
            (result as ILocationData[]).map((c) => {
              const cleaned = cleanLocationName(c.name);
              return {
                label: cleaned,
                value: cleaned, // Use cleaned name for form value
                id: c.id, // Store ID for fetching
              };
            }),
          );
        })
        .finally(() => setIsLoadingCities(false));
    } else {
      setCityOptions([]);
    }
  }, [countryValue, stateValue, fields, stateOptions.length]); // Re-run when options loaded

  // Render helper
  const renderField = (type: TLocationField) => {
    if (!fields.includes(type)) return null;

    const name = fieldNames[type];
    const label = labels[type] ?? formatLabel(name);

    if (type === 'region') {
      return (
        <SelectInput
          search
          key={name}
          name={name}
          label={label}
          disabled={disabled}
          className={className}
          options={regionOptions}
          optional={isOptional('region')}
          placeholder={`Select ${label}...`}
        />
      );
    }

    if (type === 'country') {
      return (
        <SelectInput
          search
          key={name}
          name={name}
          label={label}
          className={className}
          options={countryOptions}
          optional={isOptional('country')}
          disabled
          placeholder={
            isLoadingCountries
              ? 'Loading countries...'
              : `Select ${label}...`
          }
        />
      );
    }

    if (type === 'state') {
      return (
        <SelectInput
          search
          key={name}
          name={name}
          label={label}
          className={className}
          options={stateOptions}
          optional={isOptional('state')}
          disabled={disabled || !countryValue || stateOptions.length === 0 || isLoadingStates}
          placeholder={
            isLoadingStates
              ? 'Loading states...'
              : !countryValue
                ? 'Choose Country first'
                : stateOptions.length === 0
                  ? 'No States Available'
                  : `Select ${label}...`
          }
        />
      );
    }

    if (type === 'city') {
      return (
        <SelectInput
          search
          key={name}
          name={name}
          label={label}
          className={className}
          options={cityOptions}
          optional={isOptional('city')}
          disabled={disabled || !stateValue || cityOptions.length === 0 || isLoadingCities}
          placeholder={
            isLoadingCities
              ? 'Loading districts...'
              : !stateValue
                ? 'Choose State first'
                : cityOptions.length === 0
                  ? 'No Districts Available'
                  : `Select ${label}...`
          }
        />
      );
    }

    return null;
  };

  return (
    <>
      {renderField('region')}
      {renderField('country')}
      {renderField('state')}
      {renderField('city')}
    </>
  );
};

export default RCSCSelectorInput;
