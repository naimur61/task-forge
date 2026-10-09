/** Every API success response: `{ data, meta? }`. */
export interface ApiResponse<T> {
  data: T;
  meta?: PageMeta;
}

/** Pagination info returned with every list. */
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** A page of results from a list endpoint. */
export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

/** Error body the API sends with every 4xx/5xx response. */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
  code: string;
  details: { field: string; message: string }[];
}

/** A small user object embedded in other resources. */
export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}
