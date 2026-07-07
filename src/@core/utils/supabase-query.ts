export interface TTableParams {
  page: number;
  limit: number;
  search?: string;
  isArchived?: string;
  startRange?: string;
  endRange?: string;
  timeFilter?: string;
  state?: string;
  district?: string;
  dept?: string;
}

export const applyTableParams = <T>(
  query: any, // Supabase query builder types are complex to export directly here without full Postgrest types
  params: TTableParams,
  searchColumns: string[],
) => {
  let q = query;

  // Search across multiple columns
  if (params.search && searchColumns.length > 0) {
    const searchValue = params.search.trim().replace(/[%_]/g, (char) => `\\${char}`);
    const orConditions = searchColumns
      .map((col) => {
        // Handle joined columns (e.g., 'profiles.full_name') if needed,
        // but ilike usually works fine in 'or' for flat or joined tables
        return `${col}.ilike.%${searchValue}%`;
      })
      .join(',');
    q = q.or(orConditions);
  }

  // Pagination
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;

  return q.range(from, to);
};
