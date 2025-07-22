export interface ErrorResponseData {
  message?: string;
  [key: string]: unknown;
}

export type ApiResponse<T> = {
  message: string;
  data: T;
  access_token: string;
} & Partial<PaginationMeta>;

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
