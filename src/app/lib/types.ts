export interface ErrorResponseData {
  message?: string;
  [key: string]: unknown;
}

export type ApiResponse<T> = {
  message: string;
  data: T;
} & Partial<PaginationMeta>;

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
