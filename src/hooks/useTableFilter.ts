'use client';

import { useDebounce } from 'ahooks';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface useTableFiltersProps<T extends object> {
  extraPayload: T;
}

type BasePayload = {
  page: number;
  limit: number;
  search: string;
  sortField: string;
  sortOrder: string;
  status: string;
};

const useTableFilters = <T extends Record<string, any>>({
  extraPayload,
}: useTableFiltersProps<T>) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  // Helper to read initial values from URL
  const getInitialValue = (key: string, defaultValue: unknown) => {
    const val = searchParams.get(key);
    if (val === null) return defaultValue;
    if (typeof defaultValue === 'number') return Number(val);
    return val;
  };

  // 1. Initialize State
  const [search, setSearch] = useState(() => getInitialValue('search', '') as string);
  const debouncedSearchVal = useDebounce(search.trim(), { wait: 500 });

  const [payload, setPayload] = useState<BasePayload & T>(() => {
    const initial = {
      page: getInitialValue('page', 1) as number,
      limit: getInitialValue('limit', 10) as number,
      search: getInitialValue('search', '') as string,
      sortField: getInitialValue('sortField', '') as string,
      sortOrder: getInitialValue('sortOrder', 'desc') as string,
      status: getInitialValue('status', '') as string,
      ...extraPayload,
    } as BasePayload & T;

    // Load extra keys from URL
    Object.keys(extraPayload).forEach((key) => {
      (initial as Record<string, unknown>)[key] = getInitialValue(key, extraPayload[key]);
    });

    return initial;
  });

  // 2. Sync URL when payload changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    params.set('page', payload.page.toString());
    params.set('limit', payload.limit.toString());
    if (payload.search) params.set('search', payload.search);
    if (payload.sortField) params.set('sortField', payload.sortField);
    if (payload.sortOrder) params.set('sortOrder', payload.sortOrder);
    if (payload.status) params.set('status', payload.status);

    // Dynamic extra keys
    Object.keys(extraPayload).forEach((key) => {
      const val = (payload as Record<string, unknown>)[key];
      if (val) params.set(key, String(val));
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [payload, pathname, router, extraPayload]);

  // 3. Sync search state with debounced value
  useEffect(() => {
    setPayload((prev) => {
      if (prev.search === debouncedSearchVal) return prev;
      return { ...prev, search: debouncedSearchVal, page: 1 };
    });
  }, [debouncedSearchVal]);

  // Handlers
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
  }, []);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPayload((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (value: string) => {
    setPayload((prev) => ({ ...prev, limit: parseInt(value, 10), page: 1 }));
  };

  const onSortModelChange = (newModel: any) => {
    // Adding back for compatibility
    if (newModel.length) {
      setPayload((prev) => ({
        ...prev,
        sortField: newModel[0].id,
        sortOrder: newModel[0].desc ? 'desc' : 'asc',
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        sortField: '',
        sortOrder: 'desc',
      }));
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setPayload((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return {
    payload,
    setPayload,
    handleSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilterChange,
    onSortModelChange,
    search,
    status: payload.status,
  };
};

export default useTableFilters;
