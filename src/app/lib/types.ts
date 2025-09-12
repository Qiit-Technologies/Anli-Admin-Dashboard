export interface ErrorResponseData {
  message?: string;
  [key: string]: unknown;
}

export type ApiResponse<T> = {
  message: string;
  data: T;
} & Partial<PaginationMeta>;

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = ApiResponse<{
  data: T[];
  meta: PaginationMeta;
}>;
