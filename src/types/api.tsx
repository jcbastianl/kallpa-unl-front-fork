export interface ApiResponse<T> {
  code: number;
  status: string;
  msg: string;
  data: T;
  errors?: Record<string, string>;
}
