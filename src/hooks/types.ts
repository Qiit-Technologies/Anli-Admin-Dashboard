export interface ErrorResponseData {
  message?: string;
  [key: string]: unknown;
}
export interface ApiResponse<T> {
  message: string;
  data: T;
}
